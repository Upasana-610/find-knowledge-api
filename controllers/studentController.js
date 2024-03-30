const Student = require("../models/Student");
const auth = require("./authcontroller");

exports.studentSignup = auth.signup(Student);
