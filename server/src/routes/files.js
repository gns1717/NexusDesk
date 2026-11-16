import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import FileRecord from "../models/FileRecord.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
const here = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(here, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${path.extname(file.originalname).slice(0, 12)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", async (req, res) => res.json(await FileRecord.find({ user: req.user._id }).sort({ createdAt: -1 })));
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Choose a file" });
  const record = await FileRecord.create({
    user: req.user._id, originalName: req.file.originalname,
    storedName: req.file.filename, mimeType: req.file.mimetype, size: req.file.size
  });
  res.status(201).json(record);
});
router.get("/:id/download", async (req, res) => {
  const record = await FileRecord.findOne({ _id: req.params.id, user: req.user._id });
  if (!record) return res.status(404).json({ message: "File not found" });
  res.download(path.join(uploadDir, record.storedName), record.originalName);
});
router.delete("/:id", async (req, res) => {
  const record = await FileRecord.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!record) return res.status(404).json({ message: "File not found" });
  fs.rm(path.join(uploadDir, record.storedName), { force: true }, () => {});
  res.json({ message: "File deleted" });
});
export default router;
