const router = require("express").Router();
const {
  avatarUpload,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
} = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", verifyToken, requireRole("admin"), getAllUsers);
router.put("/profile", verifyToken, updateProfile);
router.post("/profile/avatar", verifyToken, avatarUpload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", verifyToken, deleteAvatar);
router.get("/:id", verifyToken, requireRole("admin"), getUserById);
router.put("/:id", verifyToken, requireRole("admin"), updateUser);
router.delete("/:id", verifyToken, requireRole("admin"), deleteUser);

module.exports = router;
