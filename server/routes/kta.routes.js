const router = require("express").Router();
const { upload, uploadKta, checkKta, deleteKta } = require("../controllers/kta.controller");
const verifyToken = require("../middleware/auth");

router.get("/kta/check", verifyToken, checkKta);
router.post("/kta", verifyToken, upload.single("kta_file"), uploadKta);
router.delete("/kta", verifyToken, deleteKta);

module.exports = router;
