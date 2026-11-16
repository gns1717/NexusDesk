import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspace.js";
import fileRoutes from "./routes/files.js";
import settingsRoutes from "./routes/settings.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(cors({ origin: [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean) }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "NexusDesk API" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`NexusDesk API running on ${port}`)))
  .catch((error) => { console.error("Database connection failed:", error.message); process.exit(1); });
