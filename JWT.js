const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtAuthMiddleware = (req, res, next) => {
  // Token header या cookie से निकाले
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies?.EchoswapTokenCookies;
  let token;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (tokenFromCookie) {
    token = tokenFromCookie;
  }
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: "7d", // Optional: token expiration
  });
};

module.exports = { jwtAuthMiddleware, generateToken };

// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const jwtAuthMiddleware = (req, res, next) => {
//   // Token header या cookie से निकाले
//   const authHeader = req.headers.authorization;
//   const tokenFromCookie = req.cookies?.token;
//   let token;

//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     token = authHeader.split(" ")[1];
//   } else if (tokenFromCookie) {
//     token = tokenFromCookie;
//   }

//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized: No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.log("JWT Error:", err.message);
//     return res.status(401).json({ error: "Unauthorized: Invalid token" });
//   }
// };

// const generateToken = (userData) => {
//   return jwt.sign(userData, process.env.JWT_SECRET, {
//     expiresIn: "7d", // Optional: token expiration
//   });
// };

// module.exports = { jwtAuthMiddleware, generateToken };

// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const jwtAuthMiddleware = (req,res,next)=>{

//     const authorization = req.headers.authorization;
//     if(! authorization) return res.status(401).json({error:"unauthorized"});
//     const token = req.headers.authorization.split(' ')[1];
//     if(!token) return res.status(401).json({error:"unauthorized"});
//     try{
//         const decoded = jwt.verify(token,process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     }catch(err){
//         console.log(err);
//         res.status(401).json({error:"unauthorized"})
//     }
// };

// const generateToken = (userData)=>{
//     return jwt.sign(userData,process.env.JWT_SECRET);
// };

// module.exports = {jwtAuthMiddleware,generateToken};
