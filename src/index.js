import express from "express";
import dotenv from "dotenv";

import rateLimit from "express-rate-limit";
import helmet from "helmet";
import slowDown from "express-slow-down";

import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";

dotenv.config();

const app = express();

app.use(helmet());

//use the command below if behind a proxy like nginx
// app.set("trust proxy", 1);

// Rate limiting
//using for limiting requests to 60 per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." });
  },
});

// Speed limiting
//using for limiting requests to 30 per minute
const speedLimiter = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 30, // allow 30 requests per 1 minute, then...
  delayMs: 500, // begin adding 500ms of delay per request above 30:
});

app.use(limiter);
app.use(speedLimiter);

app.use(express.json({ limit: "100kb" }));

app.get("/", async (req, res) => {
  res.send("Welcome to the Express Prisma CRUD API");
});

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
