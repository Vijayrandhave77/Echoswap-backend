const express = require("express");
const {
  OrderController,
  verificationController,
  getOrderById,
  webhookOrderStatus,
  getAllOrder,
} = require("../controllers/order.controller");
const { jwtAuthMiddleware } = require("../JWT");
const router = express.Router();

router.post("/checkout", jwtAuthMiddleware, OrderController);
router.post(
  "/verification/:orderId",
  jwtAuthMiddleware,
  verificationController
);
router.get("/all", jwtAuthMiddleware, getAllOrder);
router.get("/orderId/:id", jwtAuthMiddleware, getOrderById);
router.post("/webhook/order/status", webhookOrderStatus);

module.exports = router;
