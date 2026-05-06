const router = require("express").Router();
const {
  createAccessRequest, getAllAccessRequests, getMyAccessRequests,
  approveAccessRequest, rejectAccessRequest,
} = require("../controllers/accessRequest.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.post("/", verifyToken, createAccessRequest);
router.get("/my", verifyToken, getMyAccessRequests);
router.get("/", verifyToken, requireRole("admin", "ketua"), getAllAccessRequests);
router.put("/:id/approve", verifyToken, requireRole("admin", "ketua"), approveAccessRequest);
router.put("/:id/reject", verifyToken, requireRole("admin", "ketua"), rejectAccessRequest);

module.exports = router;
