const express = require("express");
const {
  OrderController,
  verificationController,
} = require("../controllers/order.controller");
const router = express.Router();

router.post("/checkout", OrderController);
router.post("/verification", verificationController);

module.exports = router;
