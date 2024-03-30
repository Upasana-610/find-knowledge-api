const express = require("express");
const teacher = require("../controllers/teachercontroller");
const teacherProfile = require("../controllers/teacherProfilecontroller");

const router = express.Router();

router
  .route("/create")
  .post(teacherProfile.createTeacherProfile)
  .patch(teacherProfile.addTeacherProfileToTeacher);

module.exports = router;
