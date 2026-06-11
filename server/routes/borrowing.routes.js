const router = require("express").Router();
const {
  getAllBorrowings, getMyBorrowings, getBorrowingById,
  createBorrowing, approveBorrowing, rejectBorrowing, returnBorrowing,
} = require("../controllers/borrowing.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", verifyToken, requireRole("admin", "ketua", "sekretaris"), getAllBorrowings);
router.get("/my", verifyToken, getMyBorrowings);
router.get("/:id", verifyToken, getBorrowingById);
router.post("/", verifyToken, createBorrowing);
router.put("/:id/approve", verifyToken, requireRole("admin", "ketua"), approveBorrowing);
router.put("/:id/reject", verifyToken, requireRole("admin", "ketua"), rejectBorrowing);
router.put("/:id/return", verifyToken, requireRole("admin"), returnBorrowing);

module.exports = router;
