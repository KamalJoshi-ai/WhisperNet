const express = require("express");
const router = express.Router();
const statusController = require("../controllers/statusController");
const authMiddleWare = require("../middlewares/authMiddleware");
const { multerMiddleware } = require("../config/cloudinaryConfig");

router.post(
  "/",
  authMiddleWare,
  multerMiddleware,
  statusController.createStatus
);
router.get("/", authMiddleWare, statusController.getStatus);

router.put("/:statusId/view", authMiddleWare, statusController.viewStatus);
router.delete(
  "/:statusId",
  authMiddleWare,
 statusController.deleteStatus
);

module.exports = router;
