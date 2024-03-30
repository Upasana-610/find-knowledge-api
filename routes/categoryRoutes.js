const express = require("express");
const category = require("../controllers/categoryController");

const router = express.Router();

router.post("/create", category.createCategory);

module.exports = router;
