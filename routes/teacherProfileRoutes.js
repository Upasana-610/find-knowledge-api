const express = require("express");
const teacher = require("../controllers/teachercontroller");
const teacherProfile = require("../controllers/teacherProfilecontroller");

const router = express.Router();

router.post("/create", teacherProfile.createTeacherProfile);
router.get("/getTeacherProfile/:id", teacherProfile.getTeacherProfile);
router.get(
  "/findteacher/:id",
  teacherProfile.findTeacherProfileByCategoryOrSubcategory
);
router.get("/getall", teacherProfile.getAllTeacherProfiles);
router.get(
  "/getCurrentStudents/:id",
  teacherProfile.getStudentsForTeacherProfile
);

module.exports = router;
