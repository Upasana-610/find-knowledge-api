const TeacherProfile = require("../models/TeacherProfile");
const catchAsync = require("./../utils/catchAsync");
const handleFactory = require("./handlerFactory");

exports.createTeacherProfile = handleFactory.createOne(TeacherProfile);
