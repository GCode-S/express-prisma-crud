import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cripto from "crypto";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// User registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const newPasswordCrypted = cripto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  try {
    const newUser = await prisma.user.create({
      data: { name, email, password: newPasswordCrypted },
    });
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res
      .status(500)
      .json({ error: "Error creating user", details: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const passwordCrypted = cripto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== passwordCrypted) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error during login", details: error.message });
  }
});

export default router;
