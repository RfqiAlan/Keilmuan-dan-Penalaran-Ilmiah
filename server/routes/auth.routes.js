const router = require("express").Router();
const { register, login, getMe, logout } = require("../controllers/auth.controller");
const verifyToken = require("../middleware/auth");

const { upload } = require("../controllers/kta.controller");

const handleUpload = (req, res, next) => {
  upload.single("kta_file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Ukuran file terlalu besar. Maksimal 5MB." });
      }
      return res.status(400).json({ message: err.message || "Gagal mengunggah file." });
    }
    next();
  });
};

router.post("/register", handleUpload, register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post("/logout", verifyToken, logout);

module.exports = router;
