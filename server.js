const { app, server, io, express } = require("./chat/socket.js");
const dotenv = require("dotenv").config();
const db = require("./DB");
const cors = require("cors");
const PORT = process.env.PORT || 5076;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use("/public", server.static("public"));
const userRoute = require("./routes/userRoutes");
const authRoutes = require("./routes/GoogleAuth");
const productRoute = require("./routes/productRouter");
const wishlistRoute = require("./routes/wishlistRouter");
const followRoute = require("./routes/followRouter");
const messageRoute = require("./routes/chat/chatRouter");
const notificationRoute = require("./routes/chat/notificationRouter");
const ordersRoute = require("./routes/orderRouter.js");
const cartRoute = require("./routes/cartRouter.js");

// const cronStart = require("./cron/index.js");
// cronStart()

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,POST,PATCH,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("EchoSwap Api is Running....");
  console.log("EchoSwap Api is Running....");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/follow", followRoute);
app.use("/api/message", messageRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/cart", cartRoute);

server.listen(PORT, () => {
  console.log("server is running on", PORT);
});
