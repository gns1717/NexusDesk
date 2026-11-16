import { Router } from "express";
import WorkspaceItem from "../models/WorkspaceItem.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res) => {
  const items = await WorkspaceItem.find({ user: req.user._id }).sort({ pinned: -1, updatedAt: -1 });
  res.json(items);
});
router.post("/", async (req, res) => {
  const { title, content, kind } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
  const item = await WorkspaceItem.create({ user: req.user._id, title, content, kind });
  res.status(201).json(item);
});
router.put("/:id", async (req, res) => {
  const item = await WorkspaceItem.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { title: req.body.title, content: req.body.content, kind: req.body.kind, pinned: req.body.pinned } },
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});
router.delete("/:id", async (req, res) => {
  const item = await WorkspaceItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json({ message: "Item deleted" });
});
export default router;
