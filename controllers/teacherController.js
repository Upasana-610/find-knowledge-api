const Teacher = require("../models/Teacher");
const auth = require("./authcontroller");
const handleFactory = require("./handlerFactory");
const AppError = require("./../utils/appError");

exports.teacherSignup = auth.signup(Teacher);
exports.getTeacher = handleFactory.getOne(Teacher);

/*
login
editTeacher
resetPassword
forgotPassword
updatePassword
logout
protect
deleteTeacher***

 */
/*
getAllTeacherProfiles

*/
