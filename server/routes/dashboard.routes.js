const router = require("express").Router();
const { getDashboardSummary } = require("../controllers/dashboard.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/summary", verifyToken, requireRole("admin", "ketua", "sekretaris"), getDashboardSummary);

module.exports = router;
