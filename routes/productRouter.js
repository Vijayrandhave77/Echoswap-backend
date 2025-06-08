const express = require("express");
const router = express.Router();
const { upload } = require("../GeneralHelper/filesHelper");
const { jwtAuthMiddleware } = require("../JWT");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getUserProduct,
} = require("../controllers/product.controller");

router.post(
  "/create",
  upload.array("gallery", 12),
  jwtAuthMiddleware,
  createProduct
);

router.get("/allProducts", getAllProducts);
router.get("/show/:id", getProductById);
router.get("/userProduct/:id", getUserProduct);

module.exports = router;
