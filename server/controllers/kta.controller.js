const pool = require("../config/db");
const multer = require("multer");
const { uploadToDrive, deleteFromDrive } = require("../config/googleDrive");
const logActivity = require("../middleware/logger");

// Multer config: memory storage (buffer) for Google Drive upload
const upload = multer({
  storage: multer.memoryStorage(),
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

// POST /api/users/kta — Upload KTA to Google Drive
const uploadKta = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File KTA wajib diunggah." });
    }

    // Check if user already has a KTA, delete old one from Drive
    const existing = await pool.query("SELECT kta_drive_id FROM users WHERE id = $1", [req.user.id]);
    if (existing.rows[0]?.kta_drive_id) {
      await deleteFromDrive(existing.rows[0].kta_drive_id);
    }

    // Upload to Google Drive
    const fileName = `KTA_${req.user.name.replace(/\s+/g, "_")}_${req.user.id}_${Date.now()}${getExtension(req.file.mimetype)}`;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

    const driveResult = await uploadToDrive(
      req.file.buffer,
      fileName,
      req.file.mimetype,
      folderId
    );

    // Update user's kta_drive_id in database
    await pool.query(
      "UPDATE users SET kta_drive_id = $1, updated_at = NOW() WHERE id = $2",
      [driveResult.fileId, req.user.id]
    );

    await logActivity(req.user.id, "upload_kta", "users", `Upload KTA: ${fileName}`);

    res.json({
      message: "KTA berhasil diunggah.",
      kta: {
        drive_id: driveResult.fileId,
        preview_url: driveResult.previewUrl,
        thumbnail_url: driveResult.thumbnailUrl,
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

    const ktaDriveId = result.rows[0].kta_drive_id;
    const hasKta = !!ktaDriveId;

    res.json({
      hasKta,
      kta: hasKta
        ? {
            drive_id: ktaDriveId,
            preview_url: `https://drive.google.com/file/d/${ktaDriveId}/preview`,
            thumbnail_url: `https://drive.google.com/thumbnail?id=${ktaDriveId}&sz=w400`,
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
    if (result.rows[0]?.kta_drive_id) {
      await deleteFromDrive(result.rows[0].kta_drive_id);
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
