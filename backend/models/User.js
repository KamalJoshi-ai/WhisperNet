
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse:true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phoneNumber: { type: String, unique: true, sparse: true },
    phoneSuffix: { type: String },
    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },
    ProfilePicture: { type: String },
    about: { type: String },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreed: { type: Boolean, default: false },
     username: {
      type: String,
      unique: true,
      sparse:true,  
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;