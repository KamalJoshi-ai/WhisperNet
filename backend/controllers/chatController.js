const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Conversation = require("../models/Conversation");
const response = require("../utils/responseHandler");
const { uploadToCloudinary } = require("../config/cloudinaryConfig");
const Message = require("../models/Messages");





// {
//   fieldname: 'media',
//   originalname: 'sunset.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: 'uploads/',
//   filename: 'c6194b1a205d6b4122d3a3d5e20acda3', // Saved filename
//   path: 'uploads/c6194b1a205d6b4122d3a3d5e20acda3', // Full path to file
//   size: 345218
// }

const fs = require('fs');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageStatus = "send" } = req.body;
    const file = req?.file;

    const participants = [senderId, receiverId].sort();
    
    let conversation = await Conversation.findOne({ participants });
    if (!conversation) {
      conversation = new Conversation({ participants });
    }
  
    let imageOrVideoUrl = null;
    let contentType = null;
  
    if (file) {
      const uploadFile = await uploadToCloudinary(file);
      
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (!uploadFile?.secure_url) {
        return response(res, 400, "Failed to upload media");
      }
      
      imageOrVideoUrl = uploadFile.secure_url;
      const mime = file.mimetype;

      if (mime.startsWith("image/")) contentType = "image";
      else if (mime.startsWith("video/")) contentType = "video";
      else contentType = "file";

    } else if (content?.trim()) {
      contentType = "text";
    } else {
      return response(res, 400, "Message content is required");
    }

    let finalStatus = messageStatus;
    const receiverSocketId = req.socketUserMap?.get(receiverId)?.socketIds;
    if (receiverSocketId && finalStatus !== "read") {
      finalStatus = "delivered";
    }

    const message = new Message({
      conversation: conversation._id,
      content,
      contentType,
      fileType: file ? file.mimetype.split("/")[1] : null,
      fileName: file ? file.originalname : null,
      imageOrVideoUrl,
      sender: senderId,
      receiver: receiverId,
      messageStatus: finalStatus,
    });

    await message.save();

    conversation.lastMessage = message._id;
    
    if (finalStatus !== "read") {
      conversation.unreadCount += 1;
    }
    await conversation.save();

    const populateMessage = await Message.findById(message._id)
      .populate("sender", "username ProfilePicture")
      .populate("receiver", "username ProfilePicture");

    if (receiverSocketId && req.io) {
      const id = [...receiverSocketId][0]; 
    
      req.io.to(id).emit("receive_message", populateMessage);
    }

    return response(res, 201, "Message sent successfully", populateMessage);

  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    return response(res, 500, "Internal server error");
  }
};

exports.getConversation = async (req, res) => {

  let userId = req.user.userId;

  try {
    const conversation = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username ProfilePicture isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender receiver",
          select: "username ProfilePicture",
        },
      })
      .sort({ updatedAt: -1 });
    return response(
      res,
      200,
      "Conversation fetched successfully",
      conversation
    );
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return response(res, 404, "Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      return response(res, 403, "Not authorised to view this conversation");
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username ProfilePicture")
      .populate("receiver", "username ProfilePicture")
      .sort("createdAt");
   
    const updateResult = await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        // Using "sent" instead of "send" is standard, match your schema string here
        messageStatus: { $in: ["send", "delivered"] }, 
      },
      { $set: { messageStatus: "read" } }
    );
    

    if (updateResult && updateResult.modifiedCount > 0) {
      
    
      if (typeof conversation.unreadCount !== 'undefined') {
        conversation.unreadCount = 0;
        await conversation.save();
      }

      // Real-time synchronization via Socket.io
      const otherParticipantId = conversation.participants.find(
        id => id.toString() !== userId.toString()
      );

      if (otherParticipantId) {
        const otherUserStringId = otherParticipantId.toString();
        // Safe access map fallback check
        const receiverSocketData = req.socketUserMap?.get(otherUserStringId)?.socketIds;
        const receiverSocketId = receiverSocketData?.socketId;
           

        if (receiverSocketId && req.io) {
          const id = [...receiverSocketId][0]; 
          req.io.to(id).emit("messages_read", { 
            conversationId, 
            readBy: userId 
          });
        }
      }
    }

    return response(res, 200, "Message retrieved successfully", messages);

  } catch (error) {
    console.error("Error in getMessages controller:", error);
    return response(res, 500, "internal server error");
  }
};


exports.markAsRead = async (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user.userId;

  try {
    // Update all matching messages
    await Message.updateMany(
      {
         _id: { $in: messageIds }, 
      receiver: userId 
    },
      { $set: { messageStatus: "read" } }
    );

    // Fetch updated messages (optional if you want to return them)
    const updatedMessages = await Message.find({
      _id: { $in: messageIds },
      receiver: userId,
    });

    // Notify senders in real-time
    if (req.io && req.socketUserMap) {
      for (const message of updatedMessages) {
        const senderSocketId = req.socketUserMap.get(
          message.sender._id.toString()
        ).socketIds;
      
        if (senderSocketId) {
        const id = [...senderSocketId][0]; 
          req.io.to(id).emit("message-read", {
            _id: message._id,
            messageStatus: "read",
          });
        }
      }
    }

    return response(res, 200, "Message(s) marked as read", updatedMessages);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
};


exports.deleteMessage = async (req, res) => {

  const { messageId } = req.body;
 
 
  const userId = req.user.userId;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return response(res, 400, "message not found");
    }
    if (message.sender.toString() !== userId) {
      return response(res, 400, "not authorized to delete this message");
    }
    await message.deleteOne();

    //delete from receiver end also live deletion

    if (req.io && req.socketUserMap) {

      const receiverSocketId = req.socketUserMap.get(message.receiver.toString()).socketIds;
    
      
      if (receiverSocketId) {
        const id = [...receiverSocketId][0]; 
        req.io.to(id).emit("message_deleted", messageId);
      }

    }

    return response(res, 200, "Message deleted successfully", message);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
