const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleWare = require("../middlewares/authMiddleware");
const { multerMiddleware } = require("../config/cloudinaryConfig");

router.post(
  "/send-message",
  authMiddleWare,
  multerMiddleware,
  chatController.sendMessage
);
router.get("/conversations", authMiddleWare, chatController.getConversation);
router.get(
  "/conversations/:conversationId/messages",
  authMiddleWare,
  chatController.getMessages
);
router.put("/messages/read", authMiddleWare, chatController.markAsRead);
router.delete(
  "/messages/:messageId",
  authMiddleWare,
  chatController.deleteMessage
);
router.patch("/updateCount",authMiddleWare,chatController.updateCount)

module.exports = router;
