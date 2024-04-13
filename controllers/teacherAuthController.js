const auth = require("./authcontroller");
const Teacher = require("../models/Teacher");

exports.teacherSignup = auth.signup(Teacher, "teacherjwt");

exports.teacherLogin = auth.login(Teacher, "teacherjwt");
exports.teacherLogout = auth.logout("teacherjwt");

exports.teacherProtect = auth.protect(Teacher, "teacherjwt");
