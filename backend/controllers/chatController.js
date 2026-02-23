const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Conversation = require("../models/Conversation");
const response = require("../utils/responseHandler");
const { uploadToCloudinary } = require("../config/cloudinaryConfig");
const Message = require("../models/Messages");






exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageStatus } = req.body;

    const file = req?.file;
//     req.file = {
//   fieldname: 'media',
//   originalname: 'photo.png',
//   encoding: '7bit',
//   mimetype: 'image/png',
//   destination: 'uploads/',
//   filename: '9f1c8a0b3a7d2c9e',
//   path: 'uploads/9f1c8a0b3a7d2c9e',
//   size: 234567
// }

    const participants = [senderId, receiverId].sort();
    //Check if Conversation already exists
    let conversation = await Conversation.findOne({
      participants: participants,
    });

    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
    }

    let imageOrVideoUrl = null;
    let contentType = null;

    if (file) {
      const uploadFile = await uploadToCloudinary(file);
      if (!uploadFile?.secure_url) {
        return response(res, 400, "Failed to upload media");
      }
      imageOrVideoUrl = uploadFile?.secure_url;
const mime = file.mimetype;

if (mime.startsWith("image/")) {
  contentType = "image";
} 
else if (mime.startsWith("video/")) {
  contentType = "video";
} 
else {
  contentType = "file";
}

    } else if (content?.trim()) {
      contentType = "text";
    } else {
      return response(res, 400, "Message content is required");
    }

    const message = new Message({
  conversation: conversation?._id,
  content,
  contentType,
  fileType: file ? file.mimetype.split("/")[1] : null,
  fileName: file ? file.originalname : null,
  imageOrVideoUrl,
  sender: senderId,
  receiver: receiverId,
  messageStatus,
});
    await message.save();
    if (message?.content) {
      conversation.lastMessage = message?._id;
    }
   if (messageStatus !== "read") {
  conversation.unreadCount += 1;
}

    await conversation.save();

    const populateMessage = await Message.findById(message?._id)
      .populate("sender", "username ProfilePicture")
      .populate("receiver", "username ProfilePicture");


    if (req.io && req.socketUserMap) {
     
      const receiverSocketId = req.socketUserMap.get(receiverId)?.socketId;
      if (receiverSocketId) {

        req.io.to(receiverSocketId).emit("receive_message", populateMessage);
        
        message.messageStatus = "delivered";
        
        await message.save();
      }
    }

    return response(res, 201, "Message send successfully", populateMessage);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};

//get All conversation

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

//get messages of specific conversation
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
   
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        messageStatus: { $in: ["send", "delivered"] },
      },
      { $set: { messageStatus: "read" } }
    );
    conversation.unreadCount = 0;
    await conversation.save();

    return response(res, 200, "Message retrieved successfully", messages);
  } catch (error) {
    console.error(error);
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
        ).socketId;
      
        if (senderSocketId) {
        
          req.io.to(senderSocketId).emit("message-read", {
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
      const receiverSocketId = req.socketUserMap.get(
        message.receiver.toString()
      );
    
      
      if (receiverSocketId) {
        req.io.to(receiverSocketId?.socketId).emit("message_deleted", messageId);
      }
    }

    return response(res, 200, "Message deleted successfully", message);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
