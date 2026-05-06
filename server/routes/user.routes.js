const router = require("express").Router();
const { getAllUsers, getUserById, updateUser, deleteUser, updateProfile } = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", verifyToken, requireRole("admin"), getAllUsers);
router.put("/profile", verifyToken, updateProfile);
router.get("/:id", verifyToken, requireRole("admin"), getUserById);
router.put("/:id", verifyToken, requireRole("admin"), updateUser);
router.delete("/:id", verifyToken, requireRole("admin"), deleteUser);

module.exports = router;
