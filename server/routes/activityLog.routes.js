const router = require("express").Router();
const { getActivityLogs } = require("../controllers/activityLog.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", verifyToken, requireRole("admin"), getActivityLogs);

module.exports = router;
