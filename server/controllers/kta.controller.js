const pool = require("../config/db");
const multer = require("multer");
const logActivity = require("../middleware/logger");

// Multer config: memory storage for direct email attachment
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan."));
    }
  },
});

// POST /api/users/kta — Not used for registration directly anymore
const uploadKta = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File KTA wajib diunggah." });
    }

    // Check if user already has a KTA, delete old one from local storage
    const existing = await pool.query("SELECT kta_drive_id FROM users WHERE id = $1", [req.user.id]);
    if (existing.rows[0]?.kta_drive_id) {
      const oldPath = path.join(__dirname, "../uploads/kta", existing.rows[0].kta_drive_id);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // The file is already saved by multer, filename is in req.file.filename
    const fileName = req.file.filename;

    // Update user's kta_drive_id (now storing local filename) in database
    await pool.query(
      "UPDATE users SET kta_drive_id = $1, updated_at = NOW() WHERE id = $2",
      [fileName, req.user.id]
    );

    await logActivity(req.user.id, "upload_kta", "users", `Upload KTA lokal: ${fileName}`);

    res.json({
      message: "KTA berhasil diunggah.",
      kta: {
        drive_id: fileName,
        preview_url: `${req.protocol}://${req.get("host")}/uploads/kta/${fileName}`,
        thumbnail_url: `${req.protocol}://${req.get("host")}/uploads/kta/${fileName}`,
      },
    });
  } catch (err) {
    console.error("Upload KTA error:", err);
    res.status(500).json({ message: err.message || "Gagal mengunggah KTA." });
  }
};

// GET /api/users/kta/check — Check if user has KTA
const checkKta = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT kta_drive_id FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const ktaFileName = result.rows[0].kta_drive_id;
    const hasKta = !!ktaFileName;

    res.json({
      hasKta,
      kta: hasKta
        ? {
            drive_id: ktaFileName,
            preview_url: `${req.protocol}://${req.get("host")}/uploads/kta/${ktaFileName}`,
            thumbnail_url: `${req.protocol}://${req.get("host")}/uploads/kta/${ktaFileName}`,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/users/kta — Remove KTA
const deleteKta = async (req, res) => {
  try {
    const result = await pool.query("SELECT kta_drive_id FROM users WHERE id = $1", [req.user.id]);
    const fileName = result.rows[0]?.kta_drive_id;
    
    if (fileName) {
      const filePath = path.join(__dirname, "../uploads/kta", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query("UPDATE users SET kta_drive_id = NULL, updated_at = NOW() WHERE id = $1", [req.user.id]);
    await logActivity(req.user.id, "hapus_kta", "users", "Hapus KTA");

    res.json({ message: "KTA berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Helper: get file extension from MIME type
function getExtension(mimeType) {
  const map = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
  return map[mimeType] || ".jpg";
}

module.exports = { upload, uploadKta, checkKta, deleteKta };
