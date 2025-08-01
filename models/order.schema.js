const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["captured", "created", "failed"],
      default: "captured",
    },
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        totalAmount: {
          type: Number,
        },
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_payment_id: {
      type: String,
    },
    razorpay_signature: {
      type: String,
    },
  },
  { timestamps: true }
);

orderSchema.pre("find", function (next) {
  this.populate("products.product");
  this.populate("user", "-password");
  next();
});

orderSchema.pre("findOne", function (next) {
  this.populate("products.product");
  this.populate("user");
  next();
});

module.exports = mongoose.model("Orders", orderSchema);
