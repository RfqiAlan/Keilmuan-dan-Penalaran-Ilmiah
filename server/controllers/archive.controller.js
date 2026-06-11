const pool = require("../config/db");
const logActivity = require("../middleware/logger");

// Categories that require dual approval (admin + sekretaris)
const DUAL_APPROVAL_CATEGORIES = ["sk", "lpj", "arsip_karya"];

// GET /api/archives
const getAllArchives = async (req, res) => {
  try {
    const { category, year, search, approval_status } = req.query;
    const userRole = req.user.role;
    let query = `
      SELECT a.*, u.name AS uploaded_by_name,
             adm.name AS admin_approver_name,
             skm.name AS sekum_approver_name
      FROM archives a
      LEFT JOIN users u ON a.uploaded_by = u.id
      LEFT JOIN users adm ON a.approved_by_admin = adm.id
      LEFT JOIN users skm ON a.approved_by_sekum = skm.id
      WHERE 1=1
    `;
    const params = [];

    // Members can only see approved archives
    if (!["admin", "sekretaris", "ketua"].includes(userRole)) {
      params.push("approved");
      query += ` AND a.approval_status = $${params.length}`;
    } else if (approval_status) {
      // Admin/sekretaris can filter by approval status
      params.push(approval_status);
      query += ` AND a.approval_status = $${params.length}`;
    }

    if (category) { params.push(category); query += ` AND a.category = $${params.length}`; }
    if (year) { params.push(parseInt(year)); query += ` AND a.year = $${params.length}`; }
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

// GET /api/archives/years — Get list of available years for filtering
const getAvailableYears = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT year FROM archives ORDER BY year DESC"
    );
    res.json({ years: result.rows.map((r) => r.year) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/archives/pending — Get archives pending approval (for admin/sekretaris)
const getPendingArchives = async (req, res) => {
  try {
    const userRole = req.user.role;
    let query = `
      SELECT a.*, u.name AS uploaded_by_name,
             adm.name AS admin_approver_name,
             skm.name AS sekum_approver_name
      FROM archives a
      LEFT JOIN users u ON a.uploaded_by = u.id
      LEFT JOIN users adm ON a.approved_by_admin = adm.id
      LEFT JOIN users skm ON a.approved_by_sekum = skm.id
      WHERE a.approval_status != 'approved'
    `;

    // If admin: show archives that admin hasn't approved yet
    if (userRole === "admin") {
      query += " AND a.approved_by_admin IS NULL";
    }
    // If sekretaris: show archives that sekum hasn't approved yet
    if (userRole === "sekretaris") {
      query += " AND a.approved_by_sekum IS NULL";
    }

    query += " ORDER BY a.created_at DESC";
    const result = await pool.query(query);
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
      `SELECT a.*, u.name AS uploaded_by_name,
              adm.name AS admin_approver_name,
              skm.name AS sekum_approver_name
       FROM archives a
       LEFT JOIN users u ON a.uploaded_by = u.id
       LEFT JOIN users adm ON a.approved_by_admin = adm.id
       LEFT JOIN users skm ON a.approved_by_sekum = skm.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });
    res.json({ archive: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Helper: extract Google Drive file/folder ID and type from URL or plain ID
const extractDriveInfo = (input) => {
  if (!input) return { id: null, type: 'file' };
  const folderMatch = input.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return { id: folderMatch[1], type: 'folder' };
  const fileMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return { id: fileMatch[1], type: 'file' };
  const paramMatch = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (paramMatch) return { id: paramMatch[1], type: 'file' };
  return { id: input.trim(), type: 'file' };
};

// POST /api/archives
const createArchive = async (req, res) => {
  const { archive_number, title, year, category, division, description, drive_file_id, preview_url, access_level } = req.body;

  const driveInfo = extractDriveInfo(drive_file_id);
  if (!archive_number || !title || !year || !category || !driveInfo.id) {
    return res.status(400).json({ message: "Nomor arsip, judul, tahun, kategori, dan Link Google Drive wajib diisi." });
  }

  // Determine approval status based on category
  const needsDualApproval = DUAL_APPROVAL_CATEGORIES.includes(category);
  const approvalStatus = needsDualApproval ? "draft" : "approved";

  try {
    const result = await pool.query(
      `INSERT INTO archives (archive_number, title, year, category, division, description, drive_file_id, preview_url, access_level, drive_type, uploaded_by, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [archive_number, title, parseInt(year), category, division, description, driveInfo.id, preview_url, access_level || "admin", driveInfo.type, req.user.id, approvalStatus]
    );
    await logActivity(req.user.id, "unggah_arsip", "archives", `Arsip baru: ${title} (${year})${needsDualApproval ? " [Perlu dual-approval]" : ""}`);
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
  const driveInfo = drive_file_id ? extractDriveInfo(drive_file_id) : { id: null, type: null };
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
        drive_type    = COALESCE($9, drive_type),
        updated_at    = NOW()
       WHERE id = $10 RETURNING *`,
      [title, year, category, division, description, driveInfo.id, preview_url, access_level, driveInfo.type, req.params.id]
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

// PUT /api/archives/:id/approve — Dual approval by admin or sekretaris
const approveArchive = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  if (!["admin", "sekretaris"].includes(userRole)) {
    return res.status(403).json({ message: "Hanya admin atau sekretaris yang dapat menyetujui arsip." });
  }

  try {
    // Get current archive
    const archiveResult = await pool.query("SELECT * FROM archives WHERE id = $1", [req.params.id]);
    if (archiveResult.rows.length === 0) return res.status(404).json({ message: "Arsip tidak ditemukan." });

    const archive = archiveResult.rows[0];

    if (archive.approval_status === "approved") {
      return res.status(400).json({ message: "Arsip sudah disetujui sepenuhnya." });
    }

    // Check if this role already approved
    if (userRole === "admin" && archive.approved_by_admin) {
      return res.status(400).json({ message: "Admin sudah menyetujui arsip ini." });
    }
    if (userRole === "sekretaris" && archive.approved_by_sekum) {
      return res.status(400).json({ message: "Sekretaris sudah menyetujui arsip ini." });
    }

    // Determine new approval status
    let newStatus;
    const updateFields = [];
    const updateValues = [];

    if (userRole === "admin") {
      updateFields.push("approved_by_admin = $1", "admin_approved_at = NOW()");
      updateValues.push(userId);
      // Check if sekum already approved
      newStatus = archive.approved_by_sekum ? "approved" : "approved_admin";
    } else {
      updateFields.push("approved_by_sekum = $1", "sekum_approved_at = NOW()");
      updateValues.push(userId);
      // Check if admin already approved
      newStatus = archive.approved_by_admin ? "approved" : "approved_sekum";
    }

    updateFields.push(`approval_status = $${updateValues.length + 1}`);
    updateValues.push(newStatus);
    updateFields.push("updated_at = NOW()");

    const result = await pool.query(
      `UPDATE archives SET ${updateFields.join(", ")} WHERE id = $${updateValues.length + 1} RETURNING *`,
      [...updateValues, req.params.id]
    );

    await logActivity(userId, "approve_arsip", "archives",
      `${userRole === "admin" ? "Admin" : "Sekretaris"} menyetujui arsip: ${archive.title} → ${newStatus}`);

    res.json({
      message: `Arsip berhasil disetujui oleh ${userRole === "admin" ? "Admin" : "Sekretaris"}.${newStatus === "approved" ? " Arsip telah disetujui sepenuhnya." : ""}`,
      archive: result.rows[0],
    });
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

    // Admin always has access
    if (userRole === "admin") return res.json({ hasAccess: true, reason: "admin" });

    // Check if user's role is in the allowed roles (comma separated)
    const allowedRoles = archive.access_level ? archive.access_level.split(",") : [];
    if (allowedRoles.includes(userRole)) {
      return res.json({ hasAccess: true, reason: "role_allowed" });
    }

    // If not in allowed roles, check for active approved access_request
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

    // If no approved request, deny access
    res.json({ hasAccess: false, reason: "restricted_no_access" });
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
    const driveType = archive.drive_type || 'file';

    // Build the Google Drive preview URL based on type
    const previewUrl = driveType === 'folder'
      ? `https://drive.google.com/embeddedfolderview?id=${archive.drive_file_id}#list`
      : `https://drive.google.com/file/d/${archive.drive_file_id}/preview`;

    await logActivity(req.user.id, "buka_dokumen", "archives", `Buka arsip: ${archive.title}`);

    res.json({
      previewUrl,
      title: archive.title,
      drive_file_id: archive.drive_file_id,
      drive_type: driveType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllArchives, getAvailableYears, getPendingArchives, getArchiveById,
  createArchive, updateArchive, deleteArchive, approveArchive,
  checkAccess, getPreview,
};
