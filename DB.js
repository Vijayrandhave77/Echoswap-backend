const mongoose = require("mongoose");

const ONLINEURL = process.env.MONGODB_ONLINEURL;
mongoose.connect(ONLINEURL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("mongodb server is connected");
});

db.on("error", (err) => {
  console.log(err);
});

db.on("disconnected", () => {
  console.log("mongodb server is disconnected");
});

module.exports = db;
