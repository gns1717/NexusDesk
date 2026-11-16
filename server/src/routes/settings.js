import { Router } from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();
router.use(protect);
router.get("/", (req, res) => res.json(req.user.settings));
router.put("/", async (req, res) => {
  const update = {};
  if (["dark", "light"].includes(req.body.theme)) update["settings.theme"] = req.body.theme;
  if (typeof req.body.compactMode === "boolean") update["settings.compactMode"] = req.body.compactMode;
  const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true });
  res.json(user.settings);
});
export default router;
