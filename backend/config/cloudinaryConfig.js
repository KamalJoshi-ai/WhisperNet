const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedTypes = ["image", "video", "application", "text"];
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
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const mainType = file.mimetype.split("/")[0];

    if (!allowedTypes.includes(mainType)) {
      return reject(
        new Error("Only images, videos, and documents are allowed")
      );
    }

    const isRaw = mainType === "application" || mainType === "text";
    const extension = path.extname(file.originalname).slice(1);

    const options = {
      resource_type: isRaw ? "raw" : "auto",
      folder: "WhisperNet",
    };

    if (isRaw) {
      options.public_id = file.originalname;
    } else {
      options.use_filename = true;
      options.unique_filename = false;
      options.format = extension.toLowerCase();
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7 MB

const multerMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single("media");

module.exports = {
  uploadToCloudinary,
  multerMiddleware,
};