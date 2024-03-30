const express = require("express");
const student = require("../controllers/studentController");

const router = express.Router();

router.post("/signup", student.studentSignup);

module.exports = router;
