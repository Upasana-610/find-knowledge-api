const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const auth = require("./authcontroller");
const catchAsync = require("../utils/catchAsync");
const handleFactory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const TeacherProfile = require("../models/TeacherProfile");
const mongoose = require("mongoose");

exports.getTeacher = handleFactory.getOne(Teacher);

exports.acceptRequest = catchAsync(async (req, res, next) => {
  const checkIfTeacherProfileBelongstoTeacher = await TeacherProfile.findById(
    req.body.subscribedTeachers.teacherprofileId
  );
  // console.log(req.user._id);
  var check = JSON.stringify(checkIfTeacherProfileBelongstoTeacher.teacherId);
  check = check.slice(1, -1); // Remove the first and last character (quotes)

  if (!checkIfTeacherProfileBelongstoTeacher) {
    return next(new AppError("Teacher profile does not exist.", 500));
  } else {
    if (check !== req.user.id) {
      //  console.log(
      //   "Type of checkIfTeacherProfileBelongstoTeacher.teacherId:",
      //   typeof check
      // );
      // console.log("Type of req.user.id:", typeof req.user.id);

      // console.log(req.user.id + "\n" + check);

      return next(
        new AppError("Teacher profile does not belong to this teacher.", 500)
      );
    }
  }
  const pendingRequest = await Student.findOne({
    _id: req.body.id,
    PendingRequestSent: {
      $elemMatch: {
        teacherprofileId: req.body.subscribedTeachers.teacherprofileId,
      },
    },
  });
  if (!pendingRequest) {
    return next(
      new AppError("First the request needs to be sent by the Student", 500)
    );
  }

  var session = await mongoose.startSession();
  var teacherProfile = null;
  var updatedStudent = null;
  console.log(req.body.id);

  await session.startTransaction();
  try {
    try {
      teacherProfile = await TeacherProfile.findByIdAndUpdate(
        req.body.subscribedTeachers.teacherprofileId,
        {
          $pull: {
            pendingRequests: req.body.id,
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
        }
      );
      if (teacherProfile === undefined || teacherProfile == null)
        throw new Error(
          "Something went wrong in deleting from teacher profile pending requests"
        );
      console.log("object");

      teacherProfile = await TeacherProfile.findByIdAndUpdate(
        req.body.subscribedTeachers.teacherprofileId,
        {
          $push: {
            currentStudents: req.body.id,
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
        }
      );

      pendingRequest.PendingRequestSent = pendingRequest.PendingRequestSent.filter(
        (teacherProfile) => {
          return (
            String(teacherProfile.teacherprofileId._id) ===
            String(req.body.subscribedTeachers.teacherprofileId)
          );
        }
      );
      console.log(pendingRequest.PendingRequestSent[0].pendingentrymessage);

      if (teacherProfile === undefined || teacherProfile == null)
        throw new Error("Something went wrong in updating teacher profile");

      updatedStudent = await Student.findByIdAndUpdate(
        req.body.id,
        {
          $pull: {
            PendingRequestSent: {
              teacherprofileId: req.body.subscribedTeachers.teacherprofileId,
            },
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
          returnOriginal: false,
        }
      );
      if (updatedStudent === undefined || teacherProfile == null)
        throw new Error(
          "Something went wrong in deleting from student pending requests"
        );

      updatedStudent = await Student.findByIdAndUpdate(
        req.body.id,
        {
          $push: {
            subscribedTeachers: {
              teacherprofileId: req.body.subscribedTeachers.teacherprofileId,
              subscribedentrymessage:
                pendingRequest.PendingRequestSent[0].pendingentrymessage,
            },
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
      student: updatedStudent,
      teacherProfile: teacherProfile,
    },
  });
});

exports.removeStudent = catchAsync(async (req, res, next) => {
  const checkIfTeacherProfileBelongstoTeacher = await TeacherProfile.findById(
    req.body.pastTeachers.teacherprofileId
  );
  var check = JSON.stringify(checkIfTeacherProfileBelongstoTeacher.teacherId);
  check = check.slice(1, -1); // Remove the first and last character (quotes)

  if (!checkIfTeacherProfileBelongstoTeacher) {
    return next(new AppError("Teacher profile does not exist.", 500));
  } else {
    if (check !== req.user.id) {
      return next(
        new AppError("Teacher profile does not belong to this teacher.", 500)
      );
    }
  }
  const currentStudent = await Student.findOne({
    _id: req.body.id,
    subscribedTeachers: {
      $elemMatch: {
        teacherprofileId: req.body.pastTeachers.teacherprofileId,
      },
    },
  });
  if (!currentStudent) {
    return next(
      new AppError("Student does not exist in current student list.", 500)
    );
  }

  var session = await mongoose.startSession();
  var teacherProfile = null;
  var updatedStudent = null;
  // console.log(req.body.id);

  await session.startTransaction();
  try {
    try {
      teacherProfile = await TeacherProfile.findByIdAndUpdate(
        req.body.pastTeachers.teacherprofileId,
        {
          $pull: {
            currentStudents: req.body.id,
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
        }
      );
      if (teacherProfile === undefined || teacherProfile == null)
        throw new Error(
          "Something went wrong in deleting from teacher profile current students"
        );
      // console.log("object");

      var teacherProfilePast = await TeacherProfile.findOne(
        {
          _id: req.body.pastTeachers.teacherprofileId,
          pastStudents: {
            $elemMatch: {
              $eq: req.body.id, // Value to match in the array
            },
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
        }
      );
      // console.log("object");

      if (teacherProfilePast) {
        teacherProfile = await TeacherProfile.findByIdAndUpdate(
          req.body.pastTeachers.teacherprofileId,
          {
            $pull: {
              pastStudents: req.body.id,
            },
          }, // Correct the response object path
          {
            new: true,
            runValidators: true,
            session: session,
          }
        );
      }
      // console.log("object");

      teacherProfile = await TeacherProfile.findByIdAndUpdate(
        req.body.pastTeachers.teacherprofileId,
        {
          $push: {
            pastStudents: req.body.id,
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
        }
      );

      currentStudent.subscribedTeachers = currentStudent.subscribedTeachers.filter(
        (teacherProfile) => {
          return (
            String(teacherProfile.teacherprofileId._id) ===
            String(req.body.pastTeachers.teacherprofileId)
          );
        }
      );
      // console.log(currentStudent.subscribedTeachers[0].pendingentrymessage);

      if (teacherProfile === undefined || teacherProfile == null)
        throw new Error("Something went wrong in updating teacher profile");

      if (teacherProfilePast) {
        updatedStudent = await Student.findByIdAndUpdate(
          req.body.id,
          {
            $pull: {
              pastTeachers: {
                teacherprofileId: req.body.pastTeachers.teacherprofileId,
              },
            },
          }, // Correct the response object path
          {
            new: true,
            runValidators: true,
            session: session,
          }
        );
      }

      updatedStudent = await Student.findByIdAndUpdate(
        req.body.id,
        {
          $pull: {
            subscribedTeachers: {
              teacherprofileId: req.body.pastTeachers.teacherprofileId,
            },
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
          returnOriginal: false,
        }
      );
      if (updatedStudent === undefined || teacherProfile == null)
        throw new Error(
          "Something went wrong in deleting from subscribed Teachers"
        );

      updatedStudent = await Student.findByIdAndUpdate(
        req.body.id,
        {
          $push: {
            pastTeachers: {
              teacherprofileId: req.body.pastTeachers.teacherprofileId,
              pastentrymessage:
                currentStudent.subscribedTeachers[0].subscribedentrymessage,
              pastleavingmessage: req.body.pastTeachers.pastleavingmessage,
              pastjoiningDate: currentStudent.subscribedTeachers[0].joiningDate,
            },
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
      student: updatedStudent,
      teacherProfile: teacherProfile,
    },
  });
});

/*

editTeacher
protect
deleteTeacher***

 */
/*
getAllTeacherProfiles

*/
