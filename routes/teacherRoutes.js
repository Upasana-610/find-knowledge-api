const express = require("express");
const teacher = require("../controllers/teachercontroller");

const router = express.Router();

router.post("/signup", teacher.teacherSignup);
router.get("/getTeacher/:id", teacher.getTeacher);

module.exports = router;
