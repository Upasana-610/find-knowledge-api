const TeacherProfile = require("../models/TeacherProfile");
const Teacher = require("../models/Teacher");
const mongoose = require("mongoose");
const catchAsync = require("./../utils/catchAsync");
const handleFactory = require("./handlerFactory");
const AppError = require(".././utils/appError");

exports.createTeacherProfile = catchAsync(async (req, res, next) => {
  console.log(req.body);
  var session = await mongoose.startSession();
  let teacherProfile = null;
  let teacher = null;

  await session.startTransaction();

  try {
    try {
      teacherProfile = (
        await TeacherProfile.create([req.body], {
          session: session,
        })
      )[0];
      if (teacherProfile === undefined) throw new Error("Something went wrong");

      teacher = await Teacher.findByIdAndUpdate(
        req.body.teacherId,
        {
          $push: {
            teacherProfiles: teacherProfile._id,
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
        }
      );
    } catch (e) {
      console.log("Caught exception during insert transaction, aborting.");
      await session.abortTransaction();
      throw e;
    }
    await session.commitTransaction();
    console.log("Transaction committed");
  } catch (e) {
    throw e;
  } finally {
    await session.endSession();
  }

  res.status(200).json({
    status: "success",
    data: {
      teacherProfile: teacherProfile,
      teacher: teacher,
    },
  });
});

// exports.addTeacherProfileToTeacher = catchAsync(async (req, res, next) => {
//   console.log("a");
//   let teacher = null;
//   try {
//     teacher = await Teacher.findByIdAndUpdate(
//       req.body.teacherId,
//       {
//         $push: {
//           teacherProfiles: this._id,
//         },
//       }, // Correct the response object path
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//   } catch (e) {
//     console.log(e);
//   }

//   if (!teacher) {
//     return next(new AppError("No document found with that ID", 404));
//   }

//   res.locals.teacherProfile = teacher;
//   next();
// });
