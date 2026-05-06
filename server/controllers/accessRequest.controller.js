const pool = require("../config/db");
const logActivity = require("../middleware/logger");

// POST /api/access-requests
const createAccessRequest = async (req, res) => {
  const { archive_id, reason, evidence } = req.body;
  if (!archive_id || !reason) {
    return res.status(400).json({ message: "Arsip dan alasan permintaan wajib diisi." });
  }
  try {
    const archiveResult = await pool.query("SELECT * FROM archives WHERE id = $1", [archive_id]);
    if (archiveResult.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });

    const existing = await pool.query(
      `SELECT id FROM access_requests WHERE user_id = $1 AND archive_id = $2
       AND status IN ('pending', 'approved') AND (expired_at IS NULL OR expired_at > NOW())`,
      [req.user.id, archive_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Anda sudah memiliki permintaan akses aktif untuk dokumen ini." });
    }

    const result = await pool.query(
      `INSERT INTO access_requests (user_id, archive_id, reason, evidence) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, archive_id, reason, evidence || null]
    );
    await logActivity(req.user.id, "ajukan_akses_dokumen", "access_requests", `Pengajuan akses dokumen ID: ${archive_id}`);
    res.status(201).json({ message: "Permintaan akses berhasil dikirim.", request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/access-requests
const getAllAccessRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT ar.*, u.name AS user_name, u.email AS user_email,
             a.title AS archive_title, a.category AS archive_category,
             adm.name AS approved_by_name
      FROM access_requests ar
      LEFT JOIN users u ON ar.user_id = u.id
      LEFT JOIN archives a ON ar.archive_id = a.id
      LEFT JOIN users adm ON ar.approved_by = adm.id WHERE 1=1
    `;
    const params = [];
    if (status) { params.push(status); query += ` AND ar.status = $${params.length}`; }
    query += " ORDER BY ar.created_at DESC";
    const result = await pool.query(query, params);
    res.json({ requests: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/access-requests/my
const getMyAccessRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, a.title AS archive_title, a.category AS archive_category
       FROM access_requests ar LEFT JOIN archives a ON ar.archive_id = a.id
       WHERE ar.user_id = $1 ORDER BY ar.created_at DESC`,
      [req.user.id]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/access-requests/:id/approve
const approveAccessRequest = async (req, res) => {
  const { admin_note, duration = "1d" } = req.body;
  const durationMap = { "1d": 1, "3d": 3, "7d": 7 };
  const days = durationMap[duration];
  const expiredAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;

  try {
    const result = await pool.query(
      `UPDATE access_requests SET status='approved', admin_note=$1, approved_by=$2,
       approved_at=NOW(), expired_at=$3, updated_at=NOW()
       WHERE id=$4 AND status='pending' RETURNING *`,
      [admin_note, req.user.id, expiredAt, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Permintaan tidak ditemukan atau sudah diproses." });
    await logActivity(req.user.id, "setujui_akses_dokumen", "access_requests", `Setujui akses, request ID: ${req.params.id}`);
    res.json({ message: "Permintaan akses disetujui.", request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/access-requests/:id/reject
const rejectAccessRequest = async (req, res) => {
  const { admin_note } = req.body;
  try {
    const result = await pool.query(
      `UPDATE access_requests SET status='rejected', admin_note=$1, approved_by=$2, updated_at=NOW()
       WHERE id=$3 AND status='pending' RETURNING *`,
      [admin_note, req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Permintaan tidak ditemukan atau sudah diproses." });
    await logActivity(req.user.id, "tolak_akses_dokumen", "access_requests", `Tolak akses, request ID: ${req.params.id}`);
    res.json({ message: "Permintaan akses ditolak.", request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { createAccessRequest, getAllAccessRequests, getMyAccessRequests, approveAccessRequest, rejectAccessRequest };
