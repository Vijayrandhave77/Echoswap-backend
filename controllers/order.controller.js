const Razorpay = require("razorpay");
const crypto = require("crypto");
const Cart = require("./../models/cart.schema");
const Order = require("./../models/order.schema");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const OrderController = async (req, res) => {
  try {
    const { amount, products } = req.body;
    const user = req.user.id;

    const sanitizedProducts = products.map((p) => ({
      product: p.product,
      quantity: p.quantity,
      totalAmount: p.totalAmount,
    }));

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    const payload = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      user: user,
      products: sanitizedProducts,
    };
    const orderResponse = new Order(payload);
    await orderResponse.save();
    res.status(200).json({ orderResponse });
  } catch (error) {
    res.status(500).json(error);
  }
};

const verificationController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const { orderId } = req.params;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generated_signature === razorpay_signature;
    if (isSignatureValid) {
      const query = {
        user: req.user.id,
        orderId: razorpay_order_id,
      };
      const orderData = await Order.updateOne(query, {
        $set: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      });
      await Cart.deleteMany();
      res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?orderId=${razorpay_order_id}&paymentId=${razorpay_payment_id}&signature=${razorpay_signature}`
      );
    } else {
      res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?order_id=${orderId}`
      );
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const webhookOrderStatus = async (req, res) => {
  try {
    const { status, order_id } = req.body.payload.payment.entity;
    const query = {
      orderId: order_id,
    };

    const orderData = await Order.updateOne(query, {
      $set: {
        status: status,
      },
    });
    res.status(200).json({ message: "status update successfully", orderData });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  OrderController,
  verificationController,
  getOrderById,
  webhookOrderStatus,
};
