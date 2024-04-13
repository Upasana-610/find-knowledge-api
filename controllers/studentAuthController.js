const auth = require("./authController");
const Student = require("../models/Student");

exports.studentSignup = auth.signup(Student, "studentjwt");
exports.studentLogin = auth.login(Student, "studentjwt");
exports.studentLogout = auth.logout("studentjwt");

exports.studentProtect = auth.protect(Student, "studentjwt");
