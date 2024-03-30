const TeacherProfile = require("../models/TeacherProfile");
const catchAsync = require("./../utils/catchAsync");
const handleFactory = require("./handlerFactory");

exports.createTeacherProfile = () =>
  catchAsync(async (req, res, next) => {
    console.log("first");
    const teacherProfile = await Model.create(req.body);
    res.data.teacherProfile = teacherProfile;
    // Specify the route to move to (assuming it's the next middleware/route)
    next(); // Move to the next middleware or route
  });

exports.addTeacherProfileToTeacher = () =>
  catchAsync(async (req, res, next) => {
    const teacher = await Model.findByIdAndUpdate(
      req.body.teacherId,
      { $push: { teacherProfiles: res.data.teacherProfile._id } }, // Correct the response object path
      {
        new: true,
        runValidators: true,
      }
    );

    if (!teacher) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        teacher: teacher,
      },
    });
  });
