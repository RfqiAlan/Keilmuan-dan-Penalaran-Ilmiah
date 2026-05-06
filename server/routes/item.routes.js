const router = require("express").Router();
const { getAllItems, getItemById, createItem, updateItem, deleteItem } = require("../controllers/item.controller");
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", verifyToken, getAllItems);
router.get("/:id", verifyToken, getItemById);
router.post("/", verifyToken, requireRole("admin"), createItem);
router.put("/:id", verifyToken, requireRole("admin", "koordinator"), updateItem);
router.delete("/:id", verifyToken, requireRole("admin"), deleteItem);

module.exports = router;
