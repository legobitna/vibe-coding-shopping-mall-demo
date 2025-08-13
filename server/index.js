require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGODB_ATLAS_URL ||
  "mongodb://localhost:27017/shoping-mall-demo";

app.use(express.json());

// CORS 설정 - production 환경에서는 프론트엔드 도메인만 허용
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "https://vibe-coding-noona-shoppingmall.vercel.app", // 실제 프론트엔드 URL
  process.env.FRONTEND_URL,
].filter(Boolean); // undefined 값 제거

console.log("Allowed CORS origins:", allowedOrigins);
console.log("Environment - NODE_ENV:", process.env.NODE_ENV);
console.log("Environment - FRONTEND_URL:", process.env.FRONTEND_URL);

const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS check - Incoming origin:", origin);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      console.log("No origin - allowing request");
      return callback(null, true);
    }

    // Check if origin is in allowed origins
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      const match = origin === allowedOrigin;
      console.log(`Checking ${origin} against ${allowedOrigin}: ${match}`);
      return match;
    });

    if (isAllowed) {
      console.log("Origin allowed:", origin);
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      console.log("Allowed origins:", allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));

app.get("/", (req, res) => {
  res.send("쇼핑몰 데모 서버가 실행 중입니다.");
});

// CORS 디버깅을 위한 미들웨어
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get("Origin")}`);
  next();
});

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
