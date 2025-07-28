const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: process.env.FRONTEND_URL,
    methods: "GET,POST,PATCH,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
}

const users = {};
io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log("✅ User connected:", socket.id, "userId:", userId);

  if (userId) {
    users[userId] = socket.id;
    console.log("Connected users:", users);
  }

  io.emit("getOnline",Object.keys(users));


  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    if (userId) {delete users[userId]
      io.emit("getOnline", Object.keys(users));
    };

  });
});

module.exports = { app, server, io,getReceiverSocketId,express };
