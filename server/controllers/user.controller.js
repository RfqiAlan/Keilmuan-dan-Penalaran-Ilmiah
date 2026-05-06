const pool = require("../config/db");

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = "SELECT id, name, email, phone, role, status, created_at FROM users WHERE 1=1";
    const params = [];

    if (role) { params.push(role); query += ` AND role = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
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
      "SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = $1",
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
  const { name, phone, role, status } = req.body;
  const allowedRoles = ["admin", "ketua", "sekretaris", "bendahara", "koordinator", "anggota", "alumni"];
  const allowedStatuses = ["active", "inactive", "suspended"];

  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Role tidak valid." });
  }
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        role = COALESCE($3, role),
        status = COALESCE($4, status),
        updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, role, status`,
      [name, phone, role, status, req.params.id]
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
  const { name, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = NOW()
       WHERE id = $3 RETURNING id, name, email, phone, role, status`,
      [name, phone, req.user.id]
    );
    res.json({ message: "Profil diperbarui.", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, updateProfile };
