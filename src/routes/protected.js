import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Protected route to get all users
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userInfo } = user;
      return userInfo;
    });
    res.status(200).json({ data: usersWithoutPasswords, requester: req.user });
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Protected route to get all posts
router.get("/posts", verifyToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({ include: { author: true } });
    const postsWithoutPasswords = posts.map((post) => {
      const { password, ...authorInfo } = post.author;
      return { ...post, author: authorInfo };
    });
    res.json({ data: postsWithoutPasswords, requester: req.user });
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// Protected route to create a new post
router.post("/posts", verifyToken, async (req, res) => {
  const { title, content } = req.body;
  const authorId = req.user.userId;
  try {
    const newPost = await prisma.post.create({
      data: { title, content, authorId },
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Error creating post" });
  }
});

// Protected route view my profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { posts: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, ...userInfo } = user;
    res.json({ user: userInfo });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

// Protected route to update post
router.put("/posts", verifyToken, async (req, res) => {
  const { id, title, content } = req.body;
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own posts" });
    }
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title, content },
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Error updating post" });
  }
});

// Protected route to update my profile
router.put("/me/update", verifyToken, async (req, res) => {
  const { name, email } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, email },
    });
    const { password, ...userInfo } = updatedUser;
    res.json({ user: userInfo });
  } catch (error) {
    res.status(500).json({ error: "Error updating user profile" });
  }
});

// Protected route to delete a post
router.delete("/posts", verifyToken, async (req, res) => {
  const { id } = req.body;
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own posts" });
    }
    await prisma.post.delete({ where: { id } });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting post" });
  }
});

export default router;
