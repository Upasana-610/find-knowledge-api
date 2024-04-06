const express = require("express");
const student = require("../controllers/studentController");

const router = express.Router();

router.post("/signup", student.studentSignup);
router.get("/getStudent/:id", student.getStudent);
router.put("/sendRequest", student.sendRequest);
router.put("/acceptRequest", student.acceptRequest);
router.put("/removeStudent", student.removeStudent);

module.exports = router;
