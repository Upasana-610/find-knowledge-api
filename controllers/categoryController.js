const category = require("../models/Category");
const TeacherProfile = require("../models/TeacherProfile");
const catchAsync = require("./../utils/catchAsync");
const handleFactory = require("./handlerFactory");

exports.createCategory = handleFactory.createOne(category);

exports.getAllCategories = handleFactory.getAll(category);

exports.getCategoryById = handleFactory.getOne(category);

exports.getSubcategoryById = catchAsync(async (req, res, next) => {
  // Check if the ID exists in the subcategory collection
  const subcategory = await category.findOne({
    "subcategories._id": req.params.id,
  });
  console.log(subcategory);
  if (subcategory)
    subcategory.subcategories = subcategory.subcategories.filter(
      (doc) => doc._id.toString() === req.params.id.toString()
    );

  // Return the found profiles
  res.status(200).json({
    status: "success",
    data: {
      data: subcategory,
    },
  });
});
/*
getAllTeachersbyCategory
getAllTeachersbySubCategory


*/
