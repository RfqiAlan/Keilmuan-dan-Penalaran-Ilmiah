const pool = require("../config/db");

// GET /api/activity-logs
const getActivityLogs = async (req, res) => {
  try {
    const { module, user_id, limit = 50 } = req.query;
    let query = `SELECT al.*, u.name AS user_name, u.email AS user_email
                 FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1`;
    const params = [];

    if (module) { params.push(module); query += ` AND al.module = $${params.length}`; }
    if (user_id) { params.push(parseInt(user_id)); query += ` AND al.user_id = $${params.length}`; }

    params.push(parseInt(limit));
    query += ` ORDER BY al.created_at DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json({ logs: result.rows, total: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getActivityLogs };
