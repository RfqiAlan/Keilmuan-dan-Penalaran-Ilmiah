const pool = require("../config/db");
const logActivity = require("../middleware/logger");

// GET /api/borrowings — Admin: all; Member: own
const getAllBorrowings = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT b.*, u.name AS user_name, u.email AS user_email,
             i.name AS item_name, i.code AS item_code,
             a.name AS approved_by_name
      FROM borrowings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN items i ON b.item_id = i.id
      LEFT JOIN users a ON b.approved_by = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { params.push(status); query += ` AND b.status = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.name ILIKE $${params.length} OR i.name ILIKE $${params.length})`;
    }

    query += " ORDER BY b.created_at DESC";
    const result = await pool.query(query, params);
    res.json({ borrowings: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/borrowings/my
const getMyBorrowings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT b.*, i.name AS item_name, i.code AS item_code, i.image_url,
             a.name AS approved_by_name
      FROM borrowings b
      LEFT JOIN items i ON b.item_id = i.id
      LEFT JOIN users a ON b.approved_by = a.id
      WHERE b.user_id = $1
    `;
    const params = [req.user.id];

    if (status) { params.push(status); query += ` AND b.status = $${params.length}`; }
    query += " ORDER BY b.created_at DESC";

    const result = await pool.query(query, params);
    res.json({ borrowings: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/borrowings/:id
const getBorrowingById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
              i.name AS item_name, i.code AS item_code, i.category AS item_category, i.image_url,
              a.name AS approved_by_name
       FROM borrowings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN items i ON b.item_id = i.id
       LEFT JOIN users a ON b.approved_by = a.id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Peminjaman tidak ditemukan." });

    const b = result.rows[0];
    // Non-admin can only see own borrowings
    if (req.user.role !== "admin" && b.user_id !== req.user.id) {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    res.json({ borrowing: b });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/borrowings
const createBorrowing = async (req, res) => {
  const { item_id, quantity, borrow_date, return_date, purpose } = req.body;

  if (!item_id || !quantity || !borrow_date || !return_date || !purpose) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }
  if (new Date(return_date) <= new Date(borrow_date)) {
    return res.status(400).json({ message: "Tanggal kembali harus setelah tanggal pinjam." });
  }

  try {
    const itemResult = await pool.query("SELECT * FROM items WHERE id = $1", [item_id]);
    if (itemResult.rows.length === 0) return res.status(404).json({ message: "Barang tidak ditemukan." });

    const item = itemResult.rows[0];
    if (item.available_stock < quantity) {
      return res.status(400).json({
        message: `Stok tidak mencukupi. Stok tersedia: ${item.available_stock}.`,
      });
    }

    const result = await pool.query(
      `INSERT INTO borrowings (user_id, item_id, quantity, borrow_date, return_date, purpose)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, item_id, quantity, borrow_date, return_date, purpose]
    );

    await logActivity(req.user.id, "ajukan_peminjaman", "borrowings",
      `Pengajuan pinjam "${item.name}" (x${quantity})`);

    res.status(201).json({ message: "Pengajuan peminjaman berhasil dikirim.", borrowing: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/borrowings/:id/approve
const approveBorrowing = async (req, res) => {
  const { admin_note } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bResult = await client.query("SELECT * FROM borrowings WHERE id = $1 FOR UPDATE", [req.params.id]);
    if (bResult.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ message: "Peminjaman tidak ditemukan." }); }

    const b = bResult.rows[0];
    if (b.status !== "pending") { await client.query("ROLLBACK"); return res.status(400).json({ message: "Hanya peminjaman berstatus pending yang bisa disetujui." }); }

    const itemResult = await client.query("SELECT * FROM items WHERE id = $1 FOR UPDATE", [b.item_id]);
    const item = itemResult.rows[0];
    if (item.available_stock < b.quantity) { await client.query("ROLLBACK"); return res.status(400).json({ message: "Stok tidak mencukupi." }); }

    await client.query(
      "UPDATE items SET available_stock = available_stock - $1, status = CASE WHEN available_stock - $1 = 0 THEN 'borrowed' ELSE status END, updated_at = NOW() WHERE id = $2",
      [b.quantity, b.item_id]
    );

    const updated = await client.query(
      "UPDATE borrowings SET status = 'borrowed', admin_note = $1, approved_by = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [admin_note, req.user.id, req.params.id]
    );

    await client.query("COMMIT");
    await logActivity(req.user.id, "setujui_peminjaman", "borrowings", `Setujui peminjaman ID: ${req.params.id}`);
    res.json({ message: "Peminjaman disetujui.", borrowing: updated.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }
};

// PUT /api/borrowings/:id/reject
const rejectBorrowing = async (req, res) => {
  const { admin_note } = req.body;
  try {
    const result = await pool.query(
      "UPDATE borrowings SET status = 'rejected', admin_note = $1, approved_by = $2, updated_at = NOW() WHERE id = $3 AND status = 'pending' RETURNING *",
      [admin_note, req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Peminjaman tidak ditemukan atau sudah diproses." });
    await logActivity(req.user.id, "tolak_peminjaman", "borrowings", `Tolak peminjaman ID: ${req.params.id}`);
    res.json({ message: "Peminjaman ditolak.", borrowing: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/borrowings/:id/return
const returnBorrowing = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bResult = await client.query("SELECT * FROM borrowings WHERE id = $1 FOR UPDATE", [req.params.id]);
    if (bResult.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ message: "Peminjaman tidak ditemukan." }); }

    const b = bResult.rows[0];
    if (b.status !== "borrowed" && b.status !== "late") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Hanya peminjaman aktif yang bisa diverifikasi pengembaliannya." });
    }

    await client.query(
      "UPDATE items SET available_stock = available_stock + $1, status = 'available', updated_at = NOW() WHERE id = $2",
      [b.quantity, b.item_id]
    );

    const updated = await client.query(
      "UPDATE borrowings SET status = 'returned', actual_return_date = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    await client.query("COMMIT");
    await logActivity(req.user.id, "verifikasi_pengembalian", "borrowings", `Barang dikembalikan, peminjaman ID: ${req.params.id}`);
    res.json({ message: "Pengembalian diverifikasi.", borrowing: updated.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }
};

module.exports = { getAllBorrowings, getMyBorrowings, getBorrowingById, createBorrowing, approveBorrowing, rejectBorrowing, returnBorrowing };
