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
    pingInterval:30000,
  });


// At the top of your file, ensure your Map values contain a Set of socket IDs:
// onlineUsers = Map( userId -> { socketIds: Set([...]), isOnline: true, lastSeen: null } )

io.on("connection", async (socket) => {
  // 1. Get the userId immediately on connection
  const userId = socket.handshake.query.userId ? String(socket.handshake.query.userId) : null;
  
  if (!userId) {
    console.log(`Unknown socket connection dropped: ${socket.id}`);
    return socket.disconnect();
  }

  // Bind the properties straight to the socket instance for easy access elsewhere
  socket.userId = userId;
  socket.join(userId); 

  try {
    // 2. Check if this is a completely brand new user session (First Tab open)
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, {
        socketIds: new Set([socket.id]), // Put this first socket ID into a fresh Set
        isOnline: true,
        lastSeen: null,
      });

      // Update the database only once for this user session
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });

      // Notify other clients that this user is online
      io.emit("user_status", {
        userId,
        isOnline: true,
        lastSeen: null,
      });
      console.log(`User ${userId} came online 🟢`);

    } else {
      // 3. REFRESH / MULTI-TAB DETECTED: The user is already in the map
      // Simply add the new socket ID to their active Set
      onlineUsers.get(userId).socketIds.add(socket.id);
      console.log(`User ${userId} refreshed/opened a tab. Active connections: ${onlineUsers.get(userId).socketIds.size}`);
    
  }

  } catch (error) {
    console.error("Error handling user connection architecture:", error);
  }

// ─── Safely Scoped Disconnect Handler ───────────────────────────────
socket.on("disconnect", async () => {
  if (!userId) return;

  try {
    const userData = onlineUsers.get(userId);
    
    if (userData) {
      // 1. Remove ONLY the specific socket ID that closed/refreshed
      userData.socketIds.delete(socket.id);

      // 2. ONLY run cleanup if ALL tabs/windows are completely gone (Count hits 0)
      if (userData.socketIds.size === 0) {
        const now = new Date();

        // Remove from the active tracking map completely
        onlineUsers.delete(userId);

        // 3. Clear Typing Indicators safely
        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith("_timeout")) {
              clearTimeout(userTyping[key]);
            }
          });
          typingUsers.delete(userId);
          
          // Optional: Broadcast to rooms that this user stopped typing
          // io.emit("user_stopped_typing", { userId });
        }

        // 4. Update Database (only once when they are truly gone)
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: now,
        });

        // 5. Broadcast global status change
        io.emit("user_status", {   
          userId,
          isOnline: false,
          lastSeen: now,
        });

        console.log(`User ${userId} went completely offline ⚪ (All tabs closed)`);
      } else {
        // REFRESH / EXTRA TAB LOOP:
        console.log(`User ${userId} closed a tab, but remains online. Remaining active tabs: ${userData.socketIds.size}`);
      }
    }

    // Always clean up the individual socket room allocation
    socket.leave(userId);

  } catch (error) {
    console.error("Error handling disconnection safely:", error);
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
          

        const reactionUpdated = {
          messageId,
          reactions: populatedMessage.reactions,
        };

        const receiverData = [...onlineUsers.get(populatedMessage.sender._id.toString()).socketIds][0];  
        const senderData = [...onlineUsers.get(populatedMessage.receiver._id.toString()).socketIds][0]; 
        if (senderData)
          io.to(senderData).emit("reaction_update", reactionUpdated);    
        if (receiverData)
          io.to(receiverData).emit("reaction_update", reactionUpdated); 

      } catch (error) {
        console.error("Error handling reaction", error);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────

   

    io.socketUserMap = onlineUsers;

  });

  return io;
};

module.exports = initializeSocket;
