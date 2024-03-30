const Teacher = require("../models/Teacher");
const auth = require("./authcontroller");

exports.teacherSignup = auth.signup(Teacher);
