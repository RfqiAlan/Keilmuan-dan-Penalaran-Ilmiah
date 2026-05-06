const pool = require("../config/db");
const logActivity = require("../middleware/logger");

// GET /api/archives
const getAllArchives = async (req, res) => {
  try {
    const { category, year, access_level, search } = req.query;
    let query = `
      SELECT a.*, u.name AS uploaded_by_name
      FROM archives a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Non-admin cannot see private documents
    if (!["admin", "ketua", "sekretaris"].includes(req.user.role)) {
      query += ` AND a.access_level != 'private'`;
    }

    if (category) { params.push(category); query += ` AND a.category = $${params.length}`; }
    if (year) { params.push(parseInt(year)); query += ` AND a.year = $${params.length}`; }
    if (access_level) { params.push(access_level); query += ` AND a.access_level = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (a.title ILIKE $${params.length} OR a.archive_number ILIKE $${params.length})`;
    }

    query += " ORDER BY a.year DESC, a.created_at DESC";
    const result = await pool.query(query, params);
    res.json({ archives: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/archives/:id
const getArchiveById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS uploaded_by_name FROM archives a
       LEFT JOIN users u ON a.uploaded_by = u.id WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });
    res.json({ archive: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/archives
const createArchive = async (req, res) => {
  const { archive_number, title, year, category, division, description, drive_file_id, preview_url, access_level } = req.body;

  if (!archive_number || !title || !year || !category || !drive_file_id) {
    return res.status(400).json({ message: "Nomor arsip, judul, tahun, kategori, dan Drive File ID wajib diisi." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO archives (archive_number, title, year, category, division, description, drive_file_id, preview_url, access_level, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [archive_number, title, parseInt(year), category, division, description, drive_file_id, preview_url, access_level || "internal", req.user.id]
    );
    await logActivity(req.user.id, "unggah_arsip", "archives", `Arsip baru: ${title} (${year})`);
    res.status(201).json({ message: "Arsip berhasil ditambahkan.", archive: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Nomor arsip sudah digunakan." });
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/archives/:id
const updateArchive = async (req, res) => {
  const { title, year, category, division, description, drive_file_id, preview_url, access_level } = req.body;
  try {
    const result = await pool.query(
      `UPDATE archives SET
        title         = COALESCE($1, title),
        year          = COALESCE($2, year),
        category      = COALESCE($3, category),
        division      = COALESCE($4, division),
        description   = COALESCE($5, description),
        drive_file_id = COALESCE($6, drive_file_id),
        preview_url   = COALESCE($7, preview_url),
        access_level  = COALESCE($8, access_level),
        updated_at    = NOW()
       WHERE id = $9 RETURNING *`,
      [title, year, category, division, description, drive_file_id, preview_url, access_level, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });
    res.json({ message: "Arsip diperbarui.", archive: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/archives/:id
const deleteArchive = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM archives WHERE id = $1 RETURNING id, title", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });
    res.json({ message: "Arsip berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/archives/:id/access-check
const checkAccess = async (req, res) => {
  try {
    const archiveResult = await pool.query("SELECT * FROM archives WHERE id = $1", [req.params.id]);
    if (archiveResult.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });

    const archive = archiveResult.rows[0];
    const userRole = req.user.role;

    // Public: everyone
    if (archive.access_level === "public") return res.json({ hasAccess: true, reason: "public" });

    // Internal: all logged-in users
    if (archive.access_level === "internal") return res.json({ hasAccess: true, reason: "internal" });

    // Private: admin, ketua, sekretaris only
    if (archive.access_level === "private") {
      const allowed = ["admin", "ketua", "sekretaris"].includes(userRole);
      return res.json({ hasAccess: allowed, reason: allowed ? "role" : "private_restricted" });
    }

    // Restricted: check active approved access_request
    if (archive.access_level === "restricted") {
      if (["admin", "ketua"].includes(userRole)) return res.json({ hasAccess: true, reason: "role" });

      const accessResult = await pool.query(
        `SELECT * FROM access_requests
         WHERE user_id = $1 AND archive_id = $2 AND status = 'approved'
           AND (expired_at IS NULL OR expired_at > NOW())
         LIMIT 1`,
        [req.user.id, req.params.id]
      );

      if (accessResult.rows.length > 0) {
        return res.json({ hasAccess: true, reason: "approved_request", expiresAt: accessResult.rows[0].expired_at });
      }

      return res.json({ hasAccess: false, reason: "restricted_no_access" });
    }

    res.json({ hasAccess: false, reason: "unknown" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/archives/:id/preview
const getPreview = async (req, res) => {
  try {
    const archiveResult = await pool.query("SELECT * FROM archives WHERE id = $1", [req.params.id]);
    if (archiveResult.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });

    const archive = archiveResult.rows[0];

    // Build the Google Drive preview URL (embed viewer, no download)
    const previewUrl = `https://drive.google.com/file/d/${archive.drive_file_id}/preview`;

    await logActivity(req.user.id, "buka_dokumen", "archives", `Buka arsip: ${archive.title}`);

    res.json({
      previewUrl,
      title: archive.title,
      drive_file_id: archive.drive_file_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getAllArchives, getArchiveById, createArchive, updateArchive, deleteArchive, checkAccess, getPreview };
