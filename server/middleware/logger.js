const pool = require("../config/db");

/**
 * logActivity(userId, action, module, description)
 * Can be called from any controller.
 */
const logActivity = async (userId, action, module, description = "") => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, module, description)
       VALUES ($1, $2, $3, $4)`,
      [userId, action, module, description]
    );
  } catch (err) {
    console.error("⚠️  Log activity error:", err.message);
  }
};

module.exports = logActivity;
