const category = require("../models/Category");
const TeacherProfile = require("../models/TeacherProfile");
const catchAsync = require("./../utils/catchAsync");
const handleFactory = require("./handlerFactory");

exports.createCategory = handleFactory.createOne(category);

exports.getAllCategories = handleFactory.getAll(category);

exports.getCategoryById = handleFactory.getOne(category);

/*
getAllTeachersbyCategory
getAllTeachersbySubCategory


*/
