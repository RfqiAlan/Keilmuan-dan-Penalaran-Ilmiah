const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("✅ Terhubung ke PostgreSQL (Neon)");
});

pool.on("error", (err) => {
  console.error("❌ Koneksi database error:", err.message);
});

module.exports = pool;
