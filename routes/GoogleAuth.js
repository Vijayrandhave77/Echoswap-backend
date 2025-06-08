const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/users.schema");
const { generateToken } = require("../JWT");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL
const JWT_SECRET = process.env.JWT_SECRET;
const REDIRECT_URI = "http://localhost:5077/api/auth/google/callback";

router.get("/google", (req, res) => {
  const hasGoogleAuth = req.cookies.googleAuth === "true";

  const redirectURL =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&access_type=offline` +
    `&prompt=${hasGoogleAuth ? "none" : "select_account"}`;

  res.redirect(redirectURL);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const { data } = await axios.post(`https://oauth2.googleapis.com/token`, {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { id_token, access_token } = data;

    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { email, name, picture } = userInfo.data;
    let user = await User.findOne({ email: email });
    if (!user) {
      user = new User({
        name,
        email,
        picture,
        authType: "google",
      });
      await user.save();
    }

    const payload = { id: user._id, email: user.email };
    const token = generateToken(payload);

    res.cookie("EchoswapTokenCookies", token, {
      httpOnly: false,
    });

    res.cookie("googleAuth", "true", {
      httpOnly: true,
    });

    res.redirect(`${FRONTEND_URL}/login-success?token=${token}`);
  } catch (error) {
    console.error("Google login error:", error.message);
    res.redirect(`${FRONTEND_URL}/login-failed`);
  }
});

module.exports = router;
