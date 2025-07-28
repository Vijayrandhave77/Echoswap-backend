const Cart = require("../models/cart.schema");
const Product = require("../models/product.schema");
const getCartData = async (req, res) => {
  try {
    const user = req.user.id;
    const cartData = await Cart.find({ user })
      .populate("product")
      .populate("user");
    res.status(200).json({ message: "cart data", cart: cartData });
  } catch (error) {
    res.status(500).json(error);
  }
};

const addToCart = async (req, res) => {
  try {
    const user = req.user.id;
    const productId = req.body.productId;

    const exist = await Cart.findOne({ user, product: productId });

    if (!exist) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const totalAmount = product.price * 1;

      const response = await Cart.create({
        user,
        product: productId,
        quantity: 1,
        totalAmount,
      });

      res.status(200).json({
        message: "Product added to cart successfully",
        cart: response,
      });
    } else {
      res.status(400).json({ message: "Product already added to cart" });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const incQuantity = async (req, res) => {
  try {
    const { id } = req.body;

    const cartItem = await Cart.findById(id).populate("product");
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.quantity += 1;

    cartItem.totalAmount = cartItem.product.price * cartItem.quantity;

    await cartItem.save();

    res.status(200).json({
      message: "Quantity incremented and totalAmount updated",
      cart: cartItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const decQuantity = async (req, res) => {
  try {
    const { id } = req.body;

    const cartItem = await Cart.findById(id).populate("product");
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      cartItem.totalAmount = cartItem.product.price * cartItem.quantity;
      await cartItem.save();

      return res.status(200).json({
        message: "Quantity decremented and totalAmount updated",
        cart: cartItem,
      });
    } else {
      return res.status(400).json({ message: "Minimum quantity is 1" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const deleteCartData = async (req, res) => {
  try {
    const { cartId } = req.body;

    const response = await Cart.findByIdAndDelete(cartId);

    if (!response) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({
      message: "Cart item deleted successfully",
      deletedCart: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

module.exports = {
  getCartData,
  addToCart,
  incQuantity,
  decQuantity,
  deleteCartData,
};
