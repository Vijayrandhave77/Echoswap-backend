const { default: mongoose } = require("mongoose");
const { fileUploads } = require("../GeneralHelper/filesHelper");
const Product = require("../models/product.schema");

const createProduct = async (req, res) => {
  try {
    const data = req.body;
    const postedBy = req.user.id;
    const gallery = await fileUploads(req);
    const location = JSON.parse(req.body.location);
    const payload = {
      ...data,
      postedBy,
      location,
      gallery: gallery.map((img) => img.secure_url),
    };

    const product = new Product(payload);
    await product.save();

    res.status(200).json({
      message: "Product Exchange successfully",
      data: product,
    });
  } catch (error) {
    console.error("Exchange product error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments({ deletedAt: null });
    const products = await Product.find({ deletedAt: null })
      .populate("postedBy", "-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      message: "All Products",
      products,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    res, status(500).json(error);
  }
};

const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate(
      "postedBy",
      "-password"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product by ID", product });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

const getUserProduct = async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const product = await Product.find({ postedBy: objectId }).populate(
      "postedBy"
    );

    res.status(200).json({ message: "all user product", product: product });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getUserProduct,
};
