const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const dotenv = require("dotenv");
const path = require('path')
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function (image + video)
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    // Allowed file types
 const allowedTypes = ["image", "video", "application", "text"];
 
    if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
      fs.unlink(file.path, () => {});
      return reject(new Error("Only image ,docs and  video uploads are allowed"));
    }
     let resourceType = "auto";
     if (
       file.mimetype.startsWith("application") ||
       file.mimetype.startsWith("text")
     ) {
       resourceType = "raw"; // For PDFs, Word, Excel, ZIP etc.
     }
const fileExtension = path.extname(file.originalname).replace(".", "");

   const options = {
  resource_type: resourceType,
  folder: "Talkio",
  use_filename: true,
  unique_filename: false,
   format: fileExtension,
};

    cloudinary.uploader.upload(file.path, options, (error, result) => {
      // Delete local file after upload attempt
      fs.unlink(file.path, () => {});

      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
};

// Multer middleware
const multerMiddleware = multer({ dest: "uploads/" }).single("media");

module.exports = {
  uploadToCloudinary,
  multerMiddleware,
};

