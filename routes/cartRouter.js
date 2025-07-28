const express = require("express");
const {
  getCartData,
  addToCart,
  incQuantity,
  decQuantity,
  deleteCartData,
} = require("../controllers/cart.controller");
const { jwtAuthMiddleware } = require("../JWT");
const router = express.Router();

router.get("/", jwtAuthMiddleware, getCartData);
router.post("/create", jwtAuthMiddleware, addToCart);
router.post("/quantity/increase", jwtAuthMiddleware, incQuantity);
router.post("/quantity/decrease", jwtAuthMiddleware, decQuantity);
router.delete("/delete", jwtAuthMiddleware, deleteCartData);

module.exports = router;
