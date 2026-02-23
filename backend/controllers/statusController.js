const mongoose = require("mongoose");
const Status = require("../models/Status");
const response = require("../utils/responseHandler");
const { uploadToCloudinary } = require("../config/cloudinaryConfig");

exports.createStatus = async (req, res) => {
  try {
    const { content, contentType } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    let mediaUrl = null;
    let finalContentType = contentType || "text";

    // 🔹 If file is uploaded
    if (file) {
      
      const uploadFile = await uploadToCloudinary(file); 
      if (!uploadFile?.secure_url) {
        return response(res, 400, "Failed to upload media");
      }
      mediaUrl = uploadFile.secure_url;

      if (file.mimetype.startsWith("image")) {
        finalContentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        finalContentType = "video";
      } else {
        return response(res, 400, "Unsupported file type");
      }
    }
    // 🔹 If text content is provided
    else if (content?.trim()) {
      finalContentType = "text";
    } else {
      return response(res, 400, "Message content is required");
    }

    // 🔹 Expiry time = 24hrs
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 🔹 Create Status
    const status = new Status({
      user: userId,
      content: mediaUrl || content,
      contentType: finalContentType,
      expiresAt,
    });

    await status.save();

    // 🔹 Populate user + viewers
    const populateStatus = await Status.findById(status._id)
      .populate("user", "username ProfilePicture")
      .populate("viewers", "username ProfilePicture");

if(req.io && req.socketUserMap){
  //broadcast to every connected user except the owner
  for(const [connectedUserId,socketId]of req.socketUserMap){
    if(connectedUserId!==userId){
      req.io.to(socketId).emit("new_status",populateStatus)
    }
  }
}

    return response(res, 201, "Status sent successfully", populateStatus);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
};



exports.getStatus = async (req, res) => {


  try {
    const userId = req.user.userId;

    // 🔹 Current time (to check expiry)
    const now = new Date();

    // 🔹 Find all valid statuses (not expired)
    const statuses = await Status.find({ expiresAt: { $gt: now } })
      .populate("user", "username ProfilePicture") // user info
      .populate("viewers", "username ProfilePicture") // viewers info
      .sort({ createdAt: -1 }); // latest first

 
    return response(res, 200, "Statuses fetched successfully", statuses);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }


};


exports.viewStatus = async (req, res) => {
  try {
    
    const { statusId } = req.params; // jis status ko dekhna hai
    const userId = req.user.userId; // currently logged in user

    // find status
    const status = await Status.findById(statusId)
      

    if (!status) {
      return response(res, 404, "Status not found");
    }

    // agar user already viewers list me nahi hai to add karo
    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);
      await status.save();
    }
      const updatedStatus = await Status.findById(statusId)
        .populate("user ", "username ProfilePicture") // status owner
        .populate("viewers", "username ProfilePicture");

        if (req.io && req.socketUserMap) {
        const statusOwnerSocketId = req.socketUserMap.get(status.user._id.toString()
        ); 
        if(statusOwnerSocketId){
          const viewData={
            statusId,
            viewerId:userId,
            totalViewers:updatedStatus.viewers.length,
            viewers:updatedStatus.viewers
          }
          req.to.to(statusOwnerSocketId).emit("status-viewed",viewData)
        }
        else{
          console.log("status owner not connected")
        }

        }
    return response(res, 200, "Status fetched successfully", updatedStatus);
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
};



exports.deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params; // jis status ko delete karna hai
    const userId = req.user.userId; // currently logged in user

    // status find karo
    const status = await Status.findById(statusId);

    if (!status) {
      return response(res, 404, "Status not found");
    }

    // check karo kya ye status current user ka hai
    if (status.user.toString() !== userId) {
      return response(res, 403, "You are not allowed to delete this status");
    }

    // delete karo
status.deleteOne();

    if (req.io && req.socketUserMap) {
      
      for (const [connectedUserId, socketId] of req.socketUserMap) {
        if (connectedUserId !== userId) {
          req.io.to(socketId).emit("status_deleted", statusId);
        }
      }
    }

    return response(res, 200, "Status deleted successfully");
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal server error");
  }
};
