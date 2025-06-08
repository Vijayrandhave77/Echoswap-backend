const express = require("express");
const router = express.Router();
const {
  getMessage,
  sendMessage,
  getConversationUsers,
} = require("../../controllers/chat/chat.controller");
const { jwtAuthMiddleware } = require("../../JWT");

router.post("/send/:id", jwtAuthMiddleware, sendMessage);
router.get("/get/:id", jwtAuthMiddleware, getMessage);
router.get("/conversations", jwtAuthMiddleware, getConversationUsers);

module.exports = router;
