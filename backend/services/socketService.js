const { Server } = require("socket.io");
const User = require("../models/User");
const Message = require("../models/Messages");

const onlineUsers = new Map();
const typingUsers = new Map();

const initializeSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "PUT", "POST", "DELETE"],
    },
    pingTimeout: 60000,
  });


io.on("connection", (socket) => {

    let userId = null;

    // ─── User Connects ───────────────────────────────────────────
    socket.on("user_connected", async (connectingUserId) => {
      try {
        userId = String(connectingUserId);
        socket.userId = userId;

        onlineUsers.set(userId, {
          socketId: socket.id,
          isOnline: true,
          lastSeen: null,
        });

        socket.join(userId);

        await User.findByIdAndUpdate(
          userId,
          { isOnline: true, lastSeen: null },
          { new: true }
        );

        io.emit("user_status", {
          userId,
          isOnline: true,
          lastSeen: null,
        });

      } catch (error) {
        console.error("Error handling user connection", error);
      }
    });

    // ─── Get User Status ─────────────────────────────────────────
    socket.on("get_user_status", (requestedUserId, callback) => {
      const userData = onlineUsers.get(String(requestedUserId));
      callback({
        userId: requestedUserId,
        isOnline: !!userData,
        lastSeen: userData ? null : new Date(),
      });
    });

    // ─── Get All Online Users ─────────────────────────────────────
    socket.on("get_online_users", () => {
      socket.emit("online_users", Array.from(onlineUsers.entries()));
    });

    // ─── Send Message ─────────────────────────────────────────────
    socket.on("send_Message", async (message) => {
      try {
        if (!message.receiver?._id) return;

        const receiverData = onlineUsers.get(String(message.receiver._id));  // ✅ fixed

        if (receiverData) {
          io.to(receiverData.socketId).emit("receive-message", message);  // ✅ fixed
        }
      } catch (error) {
        console.error("Error sending message", error);
        socket.emit("message-error", { error: "failed to send message" });
      }
    });

    // ─── Message Read ─────────────────────────────────────────────
    socket.on("message_read", async (messageIds, senderId) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { messageStatus: "read" } }
        );

        const senderData = onlineUsers.get(String(senderId));  // ✅ fixed

        if (senderData) {
          messageIds.forEach((messageId) => {
            io.to(senderData.socketId).emit("message_status_update", {  // ✅ fixed
              messageId,
              messageStatus: "read",
            });
          });
        }
      } catch (error) {
        console.error("Error updating message read status:", error);
      }
    });

    // ─── Typing Start ─────────────────────────────────────────────
    socket.on("typing_start", ({ conversationId, receiverId }) => {
      if (!userId || !conversationId || !receiverId) return;

      if (!typingUsers.has(userId)) typingUsers.set(userId, {});
      const userTyping = typingUsers.get(userId);

      userTyping[conversationId] = true;

      // clear existing timeout
      if (userTyping[`${conversationId}_timeout`]) {
        clearTimeout(userTyping[`${conversationId}_timeout`]);
      }

      // auto stop after 2s
      userTyping[`${conversationId}_timeout`] = setTimeout(() => {
        userTyping[conversationId] = false;
        socket.to(receiverId).emit("user_typing", {
          userId,
          conversationId,
          isTyping: false,
        });
      }, 2000);

      socket.to(receiverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: true,
      });
    });


    
    // ─── Typing Stop ──────────────────────────────────────────────
    socket.on("typing_stop", (conversationId, receiverId) => {
      if (!userId || !conversationId || !receiverId) return;

      if (typingUsers.has(userId)) {
        const userTyping = typingUsers.get(userId);
        userTyping[conversationId] = false;

        if (userTyping[`${conversationId}_timeout`]) {
          clearTimeout(userTyping[`${conversationId}_timeout`]);
          delete userTyping[`${conversationId}_timeout`];
        }
      }

      socket.to(receiverId).emit("user_typing", {
        userId,
        conversationId,
        isTyping: false,
      });
    });

    // ─── Add / Update Reaction ────────────────────────────────────
    socket.on("add_reaction", async ({ messageId, emoji, reactionUserId }) => {
      try {
        const alreadyReactedSame = await Message.findOne({
          _id: messageId,
          "reactions.user": reactionUserId,
          "reactions.emoji": emoji,
        });

        if (alreadyReactedSame) {
          // same emoji → remove
          await Message.updateOne(
            { _id: messageId },
            { $pull: { reactions: { user: reactionUserId } } }
          );
        } else {
          // different emoji → update
          const updated = await Message.findOneAndUpdate(
            { _id: messageId, "reactions.user": reactionUserId },
            { $set: { "reactions.$.emoji": emoji } },
            { new: true }
          );

          if (!updated) {
            // no reaction yet → add new
            await Message.updateOne(
              { _id: messageId },
              { $push: { reactions: { user: reactionUserId, emoji } } }
            );
          }
        }

        const populatedMessage = await Message.findById(messageId)
          .populate("sender", "username ProfilePicture")
          .populate("receiver", "username ProfilePicture")
          .populate("reactions.user", "username");

        const reactionUpdated = {
          messageId,
          reactions: populatedMessage.reactions,
        };

        const senderData = onlineUsers.get(populatedMessage.sender._id.toString());   // ✅ fixed
        const receiverData = onlineUsers.get(populatedMessage.receiver._id.toString()); // ✅ fixed

        if (senderData)
          io.to(senderData.socketId).emit("reaction_update", reactionUpdated);    // ✅ fixed
        if (receiverData)
          io.to(receiverData.socketId).emit("reaction_update", reactionUpdated);  // ✅ fixed

      } catch (error) {
        console.error("Error handling reaction", error);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────
    const handleDisconnected = async () => {
      if (!userId) return;

      try {
        onlineUsers.delete(userId);

        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith("_timeout")) clearTimeout(userTyping[key]);
          });
          typingUsers.delete(userId);
        }

        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user_status", {   // ✅ consistent event name (was "Offline")
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.leave(userId);
        console.log(`User ${userId} disconnected`);
      } catch (error) {
        console.error("Error handling disconnection", error);
      }
    };

    socket.on("disconnect", handleDisconnected);

    io.socketUserMap = onlineUsers;
  });

  return io;
};

module.exports = initializeSocket;
