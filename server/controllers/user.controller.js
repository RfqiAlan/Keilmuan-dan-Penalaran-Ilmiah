const pool = require("../config/db");
const multer = require("multer");
const logActivity = require("../middleware/logger");

// Multer memory storage for avatar upload
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan."));
    }
  },
});

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, year } = req.query;
    let query = "SELECT id, name, email, phone, role, status, avatar_url, nra, kta_drive_id, created_at FROM users WHERE 1=1";
    const params = [];

    if (role) { params.push(role); query += ` AND role = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (year) {
      params.push(parseInt(year));
      query += ` AND EXTRACT(YEAR FROM created_at) = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR nra ILIKE $${params.length})`;
    }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json({ users: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, status, avatar_url, nra, created_at FROM users WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan." });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  const { name, phone, role, status, avatar_url, nra } = req.body;
  const allowedRoles = ["admin", "ketua", "sekretaris", "bendahara", "koordinator", "anggota", "anggota_bph", "alumni"];
  const allowedStatuses = ["active", "inactive", "suspended"];

  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Role tidak valid." });
  }
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  try {
    const hasAvatar = avatar_url !== undefined;
    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        role = COALESCE($3, role),
        status = COALESCE($4, status),
        avatar_url = CASE WHEN $5::boolean IS TRUE THEN $6 ELSE avatar_url END,
        nra = COALESCE($7, nra),
        updated_at = NOW()
       WHERE id = $8
       RETURNING id, name, email, phone, role, status, avatar_url, nra`,
      [name, phone, role, status, hasAvatar, avatar_url || null, nra ? nra.trim() : null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan." });
    res.json({ message: "User diperbarui.", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: "Tidak dapat menghapus akun sendiri." });
    }
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan." });
    res.json({ message: "User berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/users/profile — update own profile
const updateProfile = async (req, res) => {
  const { name, phone, avatar_url } = req.body;
  try {
    const hasAvatar = avatar_url !== undefined;
    const result = await pool.query(
      `UPDATE users SET
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         avatar_url = CASE WHEN $3::boolean IS TRUE THEN $4 ELSE avatar_url END,
         updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, role, status, avatar_url, nra`,
      [name, phone, hasAvatar, avatar_url || null, req.user.id]
    );
    res.json({ message: "Profil diperbarui.", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/users/profile/avatar — upload / update user avatar photo
const uploadAvatar = async (req, res) => {
  try {
    let avatarUrl = req.body.avatar_url;

    if (req.file) {
      const mime = req.file.mimetype;
      const b64 = req.file.buffer.toString("base64");
      avatarUrl = `data:${mime};base64,${b64}`;
    }

    if (!avatarUrl) {
      return res.status(400).json({ message: "File gambar atau avatar_url wajib disertakan." });
    }

    const result = await pool.query(
      `UPDATE users SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, phone, role, status, avatar_url, nra`,
      [avatarUrl, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    await logActivity(req.user.id, "update_avatar", "users", "Memperbarui foto profil");

    res.json({
      message: "Foto profil berhasil diperbarui.",
      user: result.rows[0],
      avatar_url: result.rows[0].avatar_url,
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: err.message || "Gagal memperbarui foto profil." });
  }
};

// DELETE /api/users/profile/avatar — remove user avatar photo
const deleteAvatar = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET avatar_url = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, phone, role, status, avatar_url, nra`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    await logActivity(req.user.id, "delete_avatar", "users", "Menghapus foto profil");

    res.json({
      message: "Foto profil berhasil dihapus.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Delete avatar error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  avatarUpload,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
};
