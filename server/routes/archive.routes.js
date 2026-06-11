const router = require("express").Router();
const {
  getAllArchives, getAvailableYears, getPendingArchives, getArchiveById,
  createArchive, updateArchive, deleteArchive, approveArchive,
  checkAccess, getPreview, listDriveFolder,
} = require("../controllers/archive.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

// Public (authenticated) routes
router.get("/", verifyToken, getAllArchives);
router.get("/years", verifyToken, getAvailableYears);
router.get("/pending", verifyToken, requireRole("admin", "sekretaris"), getPendingArchives);
router.get("/drive/folder/:folderId", verifyToken, listDriveFolder);
router.get("/:id/access-check", verifyToken, checkAccess);
router.get("/:id/preview", verifyToken, getPreview);
router.get("/:id", verifyToken, getArchiveById);

// Admin/Sekretaris routes
router.post("/", verifyToken, requireRole("admin", "sekretaris"), createArchive);
router.put("/:id", verifyToken, requireRole("admin", "sekretaris"), updateArchive);
router.put("/:id/approve", verifyToken, requireRole("admin", "sekretaris"), approveArchive);
router.delete("/:id", verifyToken, requireRole("admin"), deleteArchive);

module.exports = router;
