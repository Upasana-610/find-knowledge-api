const express = require("express");
const stuAuth = require("../controllers/studentAuthController");
const student = require("../controllers/studentController");
const auth = require("../controllers/authController");

const router = express.Router();

router.post("/signup", stuAuth.studentSignup);
router.post("/login", stuAuth.studentLogin);
router.post("/logout", stuAuth.studentLogout);
router.get("/getStudent/:id", student.getStudent);

// router.get("/protect", stuAuth.studentProtect);
router.use(stuAuth.studentProtect);

router.put("/sendRequest", student.sendRequest);
router.put("/leaveTeacher", student.leaveTeacher);

module.exports = router;
