const express = require('express');
const router = express.Router();
const authController=require('../controllers/authController')
const authMiddleWare = require("../middlewares/authMiddleware");
const {multerMiddleware }= require("../config/cloudinaryConfig");



router.post('/send-otp',authController.sendOtp)
router.post('/verify-otp',authController.verifyOtp)
router.put('/update-profile',authMiddleWare,multerMiddleware,authController.updateProfile)
router.get('/logout',authController.logout)
router.get('/check-auth',authMiddleWare,authController.checkAuthenticated)
router.get('/users',authMiddleWare,authController.getAllUsers)
module.exports=router;
// export {router}
// export const router
