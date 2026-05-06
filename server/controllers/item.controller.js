const pool = require("../config/db");
const logActivity = require("../middleware/logger");

// GET /api/items
const getAllItems = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = "SELECT * FROM items WHERE 1=1";
    const params = [];

    if (category) { params.push(category); query += ` AND category = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length})`;
    }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json({ items: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/items/:id
const getItemById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Barang tidak ditemukan." });
    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/items
const createItem = async (req, res) => {
  const { code, name, category, description, total_stock, condition, location, image_url } = req.body;

  if (!code || !name || !category) {
    return res.status(400).json({ message: "Kode, nama, dan kategori wajib diisi." });
  }
  if (total_stock < 0) {
    return res.status(400).json({ message: "Stok tidak boleh negatif." });
  }

  const stock = parseInt(total_stock) || 1;

  try {
    const result = await pool.query(
      `INSERT INTO items (code, name, category, description, total_stock, available_stock, condition, location, image_url)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8) RETURNING *`,
      [code, name, category, description, stock, condition || "baik", location, image_url]
    );

    await logActivity(req.user.id, "tambah_barang", "items", `Barang baru: ${name} (${code})`);
    res.status(201).json({ message: "Barang berhasil ditambahkan.", item: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Kode barang sudah digunakan." });
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/items/:id
const updateItem = async (req, res) => {
  const { name, category, description, total_stock, available_stock, condition, location, image_url, status } = req.body;

  if (total_stock !== undefined && total_stock < 0) {
    return res.status(400).json({ message: "Stok tidak boleh negatif." });
  }

  try {
    const result = await pool.query(
      `UPDATE items SET
        name            = COALESCE($1, name),
        category        = COALESCE($2, category),
        description     = COALESCE($3, description),
        total_stock     = COALESCE($4, total_stock),
        available_stock = COALESCE($5, available_stock),
        condition       = COALESCE($6, condition),
        location        = COALESCE($7, location),
        image_url       = COALESCE($8, image_url),
        status          = COALESCE($9, status),
        updated_at      = NOW()
       WHERE id = $10 RETURNING *`,
      [name, category, description, total_stock, available_stock, condition, location, image_url, status, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Barang tidak ditemukan." });
    await logActivity(req.user.id, "edit_barang", "items", `Edit barang ID: ${req.params.id}`);
    res.json({ message: "Barang diperbarui.", item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM items WHERE id = $1 RETURNING id, name", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Barang tidak ditemukan." });
    await logActivity(req.user.id, "hapus_barang", "items", `Hapus barang: ${result.rows[0].name}`);
    res.json({ message: "Barang berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem };
