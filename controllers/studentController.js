const Student = require("../models/Student");
const catchAsync = require("../utils/catchAsync");
const auth = require("./authcontroller");
const handleFactory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const TeacherProfile = require("../models/TeacherProfile");
const mongoose = require("mongoose");

exports.studentSignup = auth.signup(Student);

exports.getStudent = handleFactory.getOne(Student);

exports.sendRequest = catchAsync(async (req, res, next) => {
  const requestAlreadyExists = await Student.findOne({
    _id: req.body.id,
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
        throw new Error("Something went wrong");

      updatedStudent = await Student.findByIdAndUpdate(
        req.body.id,
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

exports.acceptRequest = catchAsync(async (req, res, next) => {
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
login
editStudent
resetPassword
forgotPassword
updatePassword
logout
protect
deleteStudent***

 */

/*
getAllSubcribedTeachers
getPastTeachers
getPendingRequest

*/
