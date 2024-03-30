const express = require("express");
const teacher = require("../controllers/teachercontroller");

const router = express.Router();

router.post("/signup", teacher.teacherSignup);

module.exports = router;
