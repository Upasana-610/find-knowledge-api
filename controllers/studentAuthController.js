const auth = require("./authController");
const Student = require("../models/Student");
const factory = require("./handlerFactory");

exports.studentSignup = auth.signup(Student, "studentjwt");
exports.studentLogin = auth.login(Student, "studentjwt");
exports.studentLogout = auth.logout("studentjwt");

exports.studentProtect = auth.protect(Student, "studentjwt");
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getStudent = factory.getOne(Student);
