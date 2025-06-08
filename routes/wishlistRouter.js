const express = require("express");
const router = express.Router();

const { jwtAuthMiddleware } = require("../JWT");
const {
  getUserwishlist,
  addToWishlist,
} = require("../controllers/wishlist.controller");

router.get("/", jwtAuthMiddleware, getUserwishlist);
router.post("/create", jwtAuthMiddleware, addToWishlist);
module.exports = router;
