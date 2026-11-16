import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, settings: user.settings });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8)
      return res.status(400).json({ message: "Name, email and password (8+ characters) are required" });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
  } catch (error) { res.status(500).json({ message: "Could not create account" }); }
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() }).select("+password");
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: tokenFor(user), user: safeUser(user) });
});

router.get("/me", protect, (req, res) => res.json({ user: safeUser(req.user) }));
export default router;
