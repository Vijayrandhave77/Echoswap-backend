const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware } = require("../JWT");
const {
  followUser,
  getFollowFollowing,
} = require("../controllers/follow.controller");

router.post("/followuser", jwtAuthMiddleware, followUser);
router.get("/following/all", jwtAuthMiddleware, getFollowFollowing);

module.exports = router;
