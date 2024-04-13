const Student = require("../models/Student");
const catchAsync = require("../utils/catchAsync");
const auth = require("./authcontroller");
const handleFactory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const TeacherProfile = require("../models/TeacherProfile");
const mongoose = require("mongoose");

exports.getStudent = handleFactory.getOne(Student);

exports.sendRequest = catchAsync(async (req, res, next) => {
  const requestAlreadyExists = await Student.findOne({
    _id: req.user._id,
    PendingRequestSent: {
      $elemMatch: {
        teacherprofileId: req.body.PendingRequestSent.teacherprofileId,
      },
    },
  });
  if (requestAlreadyExists) {
    return next(new AppError("Request Already Sent", 500));
  }

  var session = await mongoose.startSession();
  var teacherProfile = null;
  var updatedStudent = null;

  await session.startTransaction();
  try {
    try {
      teacherProfile = await TeacherProfile.findByIdAndUpdate(
        req.body.PendingRequestSent.teacherprofileId,
        {
          $push: {
            pendingRequests: req.user._id,
          },
        }, // Correct the response object path
        {
          new: true,
          runValidators: true,
          session: session,
        }
      );
      if (teacherProfile === undefined || teacherProfile == null)
        throw new Error("Something went wrong");

      updatedStudent = await Student.findByIdAndUpdate(
        req.user._id,
        {
          $push: {
            PendingRequestSent: req.body.PendingRequestSent,
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

exports.leaveTeacher = catchAsync(async (req, res, next) => {
  const currentStudent = await Student.findOne({
    _id: req.user._id,
    subscribedTeachers: {
      $elemMatch: {
        teacherprofileId: req.body.pastTeachers.teacherprofileId,
      },
    },
  });
  if (!currentStudent) {
    return next(
      new AppError(
        "Teacher Profile does not belong to current student.So you cannot leave it.",
        500
      )
    );
  }

  var session = await mongoose.startSession();
  var teacherProfile = null;
  var updatedStudent = null;
  // console.log(req.user._id);

  await session.startTransaction();
  try {
    try {
      teacherProfile = await TeacherProfile.findByIdAndUpdate(
        req.body.pastTeachers.teacherprofileId,
        {
          $pull: {
            currentStudents: req.user._id,
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
              $eq: req.user._id, // Value to match in the array
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
              pastStudents: req.user._id,
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
            pastStudents: req.user._id,
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
          req.user._id,
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
        req.user._id,
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
        req.user._id,
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
deleteStudent***
*/

/*
editStudent
getAllSubcribedTeachers
getPastTeachers
getPendingRequest
*/
