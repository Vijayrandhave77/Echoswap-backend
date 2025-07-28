const Razorpay = require("razorpay");
const crypto = require("crypto");
const Cart = require("./../models/cart.schema");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const OrderController = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json(error);
  }
};

const verificationController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generated_signature === razorpay_signature;
    if (isSignatureValid) {
      console.log("Payment verified");
      const deleteCartData = await Cart.deleteMany();
      res.status(200).json({ success: true, message: "Payment Verified" });
    } else {
      console.log("Invalid signature");
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { OrderController, verificationController };
