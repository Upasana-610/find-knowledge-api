const express = require("express");
const teacher = require("../controllers/teachercontroller");
const teacherProfile = require("../controllers/teacherProfilecontroller");

const router = express.Router();

router.post("/create", teacherProfile.createTeacherProfile);

module.exports = router;
