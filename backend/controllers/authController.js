const User = require("../models/User");
const { sendOtpToEmail } = require("../services/emailService");
const otpGenerator = require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const twilioService = require("../services/twilioService");
const generateToken = require("../utils/jsonwebtoken");
const Conversation = require("../models/Conversation");
const bcrypt = require("bcryptjs");
const {uploadToCloudinary,multerMidleware} = require ('../config/cloudinaryConfig')
const OTP_EXPIRY_MINUTES = 5;

const sendOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenerator();
  const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  try {
    let user;

    if (email) {
      user = await User.findOne({ email });
      if (!user) user = new User({ email });

      const otpHash = await bcrypt.hash(otp, 10);
      user.emailOtp = otpHash;

      user.emailOtpExpiry = expiry;
      await user.save();

      await sendOtpToEmail(email, otp);
      return response(res, 200, "OTP sent to your email", { email });
    }

    
    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, "Phone number and suffix or email is  required");
    }

    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber: fullPhoneNumber });
    if (!user) user = new User({ phoneNumber: fullPhoneNumber, phoneSuffix:phoneSuffix });

    await twilioService.sendOtpToPhoneNumber(fullPhoneNumber);

    await user.save();
    return response(res, 200, "OTP sent successfully", {
      phoneNumber: fullPhoneNumber,
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, "Internal Server Error");
  }
};

const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;

  try {
    let user;
    const now = new Date();

    // Email OTP verification
    if (email) {
      user = await User.findOne({ email });
      if (!user) return response(res, 404, "User not found");

      if (!user.emailOtp || now > new Date(user.emailOtpExpiry)) {
        return response(res, 400, "OTP expired. Please request a new OTP.");
      }
const isOtpValid = await bcrypt.compare(
  String(otp).trim(),
  user.emailOtp
);
if (!isOtpValid) return response(res, 400, "Invalid OTP Bcrypt");

      // Correct OTP — mark verified
      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
    } else {
      // Phone OTP verification
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "Phone number and suffix are required");
      }

      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber: fullPhoneNumber });
      if (!user) return response(res, 404, "User not found");

      const result = await twilioService.otpVerify(fullPhoneNumber, otp);
      if (result.status !== "approved") {
        return response(res, 400, "Invalid OTP. Please try again.");
      }

      user.isVerified = true;
      await user.save();
    }

    // Generate auth token
    const token = generateToken(user.id);
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 86400 * 365,
      sameSite: "none",
      secure: true
    });

    return response(res, 200, "OTP verified successfully", { token, user });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return response(res, 500, "Internal Server Error");
  }
};

const updateProfile = async(req,res)=>{

  const {username,agreed,about}=req.body;
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    
     if (req.file) {
       const uploadResult = await uploadToCloudinary(req.file);
       user.ProfilePicture = uploadResult?.secure_url;
     } else if (req.body.ProfilePicture) {
       user.ProfilePicture = req.body.ProfilePicture;
     }     

    if(username)user.username=username;
    if(agreed)user.agreed=agreed;
    if(about)user.about=about;
    await user.save();
  

    return response(res,200,'user profile updated successfully',user)
  } catch (error) {
    console.error("Error is given below    ",error)
        return response(res, 500, "Internal Server Error");

  }
}


const logout = async (req,res)=>{
  try {


    res.clearCookie("authToken", {
  httpOnly: true,
      sameSite: "none",
      secure: true
});
    return response(res,200,"user logout successfully")
  } catch (error) {
    console.error(error);
    return response (res,500,"internal server error")
  }
}

const checkAuthenticated = async(req,res)=>{
  try {
    const userId = req.user.userId;
    if(!userId){
return response (res,404,"unauthorised: Login first")
    }
    const user = await User.findById(userId);
    if(!user)
    {
      return response(res, 404, "User does not exist");
    }
       return response(res, 200, "User retrieved and allowed to use whisperNet",user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
}


const getAllUsers=async(req,res)=>{
  const loggedInUser= req.user.userId;
  try {
    const users = await User.find({ _id: { $ne: loggedInUser } }).select(
        "username ProfilePicture lastSeen isOnline about phoneNumber phoneSuffix"
      )
      .lean();
    const userWithConversation = await Promise.all(
      users.map(async(user)=>{
        const conversation = await Conversation.findOne({
          participants: { $all: [loggedInUser, user?._id] },
        }).populate({
            path: "lastMessage",
            select: "content createdAt sender receiver", 
          })
          .lean();

          
        return {
          ...user,
          conversation: conversation || '0',
        };
      })

    )
   
   
    return response(res,200,"user retrieved successfully",userWithConversation)
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
}


module.exports=  { sendOtp, verifyOtp ,updateProfile,logout,checkAuthenticated,getAllUsers};
