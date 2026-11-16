import { Router } from "express";
import User from "../models/User.js";
import FileRecord from "../models/FileRecord.js";
import WorkspaceItem from "../models/WorkspaceItem.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect, adminOnly);
router.get("/overview", async (_req, res) => {
  const [users, files, items] = await Promise.all([
    User.countDocuments(), FileRecord.countDocuments(), WorkspaceItem.countDocuments()
  ]);
  res.json({ users, files, workspaceItems: items });
});
router.get("/users", async (_req, res) => {
  const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(200);
  res.json(users);
});
router.patch("/users/:id/role", async (req, res) => {
  if (!["user", "admin"].includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("name email role");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});
router.delete("/users/:id", async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own admin account" });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await Promise.all([FileRecord.deleteMany({ user: user._id }), WorkspaceItem.deleteMany({ user: user._id })]);
  res.json({ message: "User and workspace data deleted" });
});
export default router;
