const { fileUploads } = require("../GeneralHelper/filesHelper");
const { generateToken } = require("../JWT");
const jwt = require("jsonwebtoken");
const sendEmail = require("../mailer");

const User = require("../models/users.schema");
const signup = async (req, res) => {
  try {
    const data = req.body;

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User already exists with this email" });
    }

    const user = new User(data);
    const response = await user.save();

    const payload = {
      id: response.id,
      name: response.name,
      email: response.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    const signupDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    sendEmail("welcome", user.email, {
      name: user.name,
      email: user.email,
      subject: "Welcome to Our App!",
      signupDate,
      year: new Date().getFullYear(),
      expireMinutes: 10,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
    })
      .then(() => console.log("Welcome email sent"))
      .catch(console.error);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: response,
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = generateToken(payload);
    res.cookie("EchoswapTokenCookies", token, {
      httpOnly: false,
      secure: false,
      sameSite: "None",
    });

    res.status(200).json({
      status: "success",
      user,
      message: "User logged in successfully",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("EchoswapTokenCookies");
  res.json({ message: "Logged out successfully" });
};

const getUser = async (req, res) => {
  try {
    const id = req.user.id || req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const files = await fileUploads(req);
    const user_id = req.user.id;
    let update = req.body;

    if (files && files.secure_url) {
      update = { ...update, picture: files.secure_url };
    }

    const exist = await User.findByIdAndUpdate({ _id: user_id }, update, {
      new: true,
    });

    if (!exist) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: exist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      message: "Password created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please create an account." });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const requestTime = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await sendEmail("forgot-password", user.email, {
      name: user.name,
      email: user.email,
      subject: "Reset Your EchoSwap Password",
      requestTime,
      expireMinutes: 10,
      year: new Date().getFullYear(),
      resetLink: `${process.env.FRONTEND_URL}/reset-password/${token}`,
    });

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;
    let valid;
    try {
      valid = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findOne({ _id: valid.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getUser,
  getUserById,
  updateUser,
  createPassword,
  forgotPassword,
  resetPassword,
};
