require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",           require("./routes/auth.routes"));
app.use("/api/users",          require("./routes/user.routes"));
app.use("/api/items",          require("./routes/item.routes"));
app.use("/api/borrowings",     require("./routes/borrowing.routes"));
app.use("/api/archives",       require("./routes/archive.routes"));
app.use("/api/access-requests",require("./routes/accessRequest.routes"));
app.use("/api/dashboard",      require("./routes/dashboard.routes"));
app.use("/api/activity-logs",  require("./routes/activityLog.routes"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "SIMPAR UKM API berjalan ✅",
    version: "1.0.0",
    docs: "https://github.com/your-repo",
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ message: "Internal Server Error." });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SIMPAR UKM Server berjalan di http://localhost:${PORT}`);
});