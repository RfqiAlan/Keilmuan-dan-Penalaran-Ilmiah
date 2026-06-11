const router = require("express").Router();
const { register, login, getMe, logout } = require("../controllers/auth.controller");
const verifyToken = require("../middleware/auth");

const { upload } = require("../controllers/kta.controller");

router.post("/register", upload.single("kta_file"), register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post("/logout", verifyToken, logout);

module.exports = router;
