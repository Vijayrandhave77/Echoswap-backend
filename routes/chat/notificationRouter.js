const express = require("express");
const router = express.Router();
const {
  getUserNotification,
  readNotification,
} = require("../../controllers/chat/notification.controller");
const { jwtAuthMiddleware } = require("../../JWT");

router.get("/", jwtAuthMiddleware, getUserNotification);
router.put("/:id/read", jwtAuthMiddleware, readNotification);

module.exports = router;
