import mongoose from "mongoose";

const workspaceItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, default: "", maxlength: 20000 },
  kind: { type: String, enum: ["note", "task", "document"], default: "note" },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("WorkspaceItem", workspaceItemSchema);
