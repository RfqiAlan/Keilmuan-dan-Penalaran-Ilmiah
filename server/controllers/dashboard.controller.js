const pool = require("../config/db");

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    const [items, borrowings, archives, accessReqs, logs] = await Promise.all([
      pool.query(`SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status='borrowed' THEN 1 ELSE 0 END) AS borrowed,
        SUM(CASE WHEN status='damaged' THEN 1 ELSE 0 END) AS damaged
        FROM items`),
      pool.query(`SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status='borrowed' AND return_date < NOW() THEN 1 ELSE 0 END) AS late
        FROM borrowings`),
      pool.query("SELECT COUNT(*) AS total FROM archives"),
      pool.query("SELECT COUNT(*) AS pending FROM access_requests WHERE status='pending'"),
      pool.query(`SELECT al.*, u.name AS user_name FROM activity_logs al
                  LEFT JOIN users u ON al.user_id = u.id
                  ORDER BY al.created_at DESC LIMIT 10`),
    ]);

    res.json({
      items: items.rows[0],
      borrowings: borrowings.rows[0],
      archives: archives.rows[0],
      access_requests: accessReqs.rows[0],
      recent_activity: logs.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getDashboardSummary };
