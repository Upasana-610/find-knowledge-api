const auth = require("./authcontroller");
const Teacher = require("../models/Teacher");
const factory = require("./handlerFactory");

exports.teacherSignup = auth.signup(Teacher, "teacherjwt");

exports.teacherLogin = auth.login(Teacher, "teacherjwt");
exports.teacherLogout = auth.logout("teacherjwt");

exports.teacherProtect = auth.protect(Teacher, "teacherjwt");

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getTeacher = factory.getOne(Teacher);
