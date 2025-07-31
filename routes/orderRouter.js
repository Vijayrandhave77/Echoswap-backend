const express = require("express");
const {
  OrderController,
  verificationController,
  getOrderById,
  webhookOrderStatus,
} = require("../controllers/order.controller");
const { jwtAuthMiddleware } = require("../JWT");
const router = express.Router();

router.post("/checkout", jwtAuthMiddleware, OrderController);
router.post(
  "/verification/:orderId",
  jwtAuthMiddleware,
  verificationController
);
router.get("/:id", jwtAuthMiddleware, getOrderById);
router.post("/webhook/order/status", webhookOrderStatus);

module.exports = router;
