const pool = require("../config/db");

/**
 * requireKta
 * Middleware: checks if the user has uploaded a KTA (Kartu Tanda Anggota).
 * Admin users bypass this check.
 */
const requireKta = async (req, res, next) => {
  try {
    // Admin bypass
    if (req.user.role === "admin") {
      return next();
    }

    const result = await pool.query(
      "SELECT kta_drive_id FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    const user = result.rows[0];
    if (!user.kta_drive_id) {
      return res.status(403).json({
        message: "Anda harus mengunggah Kartu Tanda Anggota (KTA) terlebih dahulu.",
        code: "KTA_REQUIRED",
      });
    }

    next();
  } catch (err) {
    console.error("requireKta error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = requireKta;
