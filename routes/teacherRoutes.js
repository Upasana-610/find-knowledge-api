const express = require("express");
const teaAuth = require("../controllers/teacherAuthController");
const teacher = require("../controllers/teachercontroller");
const student = require("../controllers/studentController");
const auth = require("../controllers/authController");

const router = express.Router();

router.post("/signup", teaAuth.teacherSignup);
router.post("/login", teaAuth.teacherLogin);
router.post("/logout", teaAuth.teacherLogout);

router.get("/getTeacher/:id", teacher.getTeacher);

// router.get("/protect", teaAuth.teacherProtect);

router.use(teaAuth.teacherProtect);

router.put("/acceptRequest", teacher.acceptRequest);
router.put("/removeStudent", teacher.removeStudent);

module.exports = router;
