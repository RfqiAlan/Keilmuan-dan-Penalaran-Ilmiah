const router = require("express").Router();
const {
  getAllArchives, getArchiveById, createArchive, updateArchive, deleteArchive,
  checkAccess, getPreview,
} = require("../controllers/archive.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", verifyToken, getAllArchives);
router.get("/:id/access-check", verifyToken, checkAccess);
router.get("/:id/preview", verifyToken, getPreview);
router.get("/:id", verifyToken, getArchiveById);
router.post("/", verifyToken, requireRole("admin", "sekretaris"), createArchive);
router.put("/:id", verifyToken, requireRole("admin", "sekretaris"), updateArchive);
router.delete("/:id", verifyToken, requireRole("admin"), deleteArchive);

module.exports = router;
