const express = require("express");
const category = require("../controllers/categoryController");

const router = express.Router();

router.post("/create", category.createCategory);
router.get("/getAllCategories", category.getAllCategories);
router.get("/getCategoryById/:id", category.getCategoryById);
module.exports = router;
