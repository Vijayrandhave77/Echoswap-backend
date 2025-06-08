const Wishlist = require("../models/wishlist.schema");

const getUserwishlist = async (req, res) => {
  try {
    const user = req.user.id;
    const wishlists = await Wishlist.find({ user }).populate([
      { path: "user" },
      {
        path: "product",
        populate: {
          path: "postedBy",
        },
      },
    ]);
    res.status(200).json({ message: "wish lists", wishlists });
  } catch (error) {
    res.status(500).json(error);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const product = req.body.productId;
    const user = req.user.id;

    const payload = { user, product };

    const exist = await Wishlist.findOne(payload);

    if (!exist) {
      const wishlist = new Wishlist(payload);
      await wishlist.save();
      res.status(200).json({
        message: "add to wishlist successfully",
        added: true,
      });
    } else {
      await Wishlist.deleteOne(payload);
      res.status(200).json({
        message: "remove to wishlist successfully",
        removed: true,
      });
    }
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getUserwishlist, addToWishlist };
