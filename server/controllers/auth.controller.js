const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const logActivity = require("../middleware/logger");

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password minimal 6 karakter." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const allowedRoles = ["admin", "ketua", "sekretaris", "bendahara", "koordinator", "anggota", "alumni"];
    const userRole = allowedRoles.includes(role) ? role : "anggota";

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, status, created_at`,
      [name, email, hashedPassword, phone || null, userRole]
    );

    const user = result.rows[0];
    await logActivity(user.id, "register", "auth", `User baru mendaftar: ${email}`);

    res.status(201).json({ message: "Registrasi berhasil.", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const user = result.rows[0];

    if (user.status === "inactive" || user.status === "suspended") {
      return res.status(403).json({ message: "Akun Anda tidak aktif. Hubungi administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    await logActivity(user.id, "login", "auth", `User login: ${email}`);

    res.json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  await logActivity(req.user.id, "logout", "auth", `User logout: ${req.user.email}`);
  res.json({ message: "Logout berhasil." });
};

module.exports = { register, login, getMe, logout };
