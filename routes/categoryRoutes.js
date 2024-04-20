const express = require("express");
const category = require("../controllers/categoryController");

const router = express.Router();

router.post("/create", category.createCategory);
router.get("/getAllCategories", category.getAllCategories);
router.get("/getCategoryById/:id", category.getCategoryById);
router.get("/getSubcategoryById/:id", category.getSubcategoryById);

module.exports = router;
