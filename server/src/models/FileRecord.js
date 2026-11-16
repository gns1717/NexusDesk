import mongoose from "mongoose";

const fileRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: { type: String, default: "application/octet-stream" },
  size: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("FileRecord", fileRecordSchema);
