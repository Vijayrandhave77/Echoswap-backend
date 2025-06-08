const express = require("express");
const router = express.Router();

const { jwtAuthMiddleware } = require("../JWT");
const {
  signup,
  login,
  logout,
  getUser,
  getUserById,
  updateUser,
  createPassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");
const { upload } = require("../GeneralHelper/filesHelper");

router.get("/", jwtAuthMiddleware, getUser);
router.get("/findbyid/:id", getUserById);
router.post("/signup", signup);
router.post("/login", login);
router.post(
  "/update",
  jwtAuthMiddleware,
  upload.single("profileImage"),
  updateUser
);
router.post("/createPassword", jwtAuthMiddleware, createPassword);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post("/logout", logout);

module.exports = router;
