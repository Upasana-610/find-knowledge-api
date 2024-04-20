const TeacherProfile = require("../models/TeacherProfile");
const Teacher = require("../models/Teacher");
const mongoose = require("mongoose");
const catchAsync = require("./../utils/catchAsync");
const handleFactory = require("./handlerFactory");
const AppError = require(".././utils/appError");
const Student = require("../models/Student");
const Category = require("./../models/Category");

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
      if (teacherProfile === undefined || teacherProfile == null)
        throw new Error("Something went wrong");

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

exports.getTeacherProfile = catchAsync(async (req, res, next) => {
  // Retrieve the teacher profile by ID
  var doc = await TeacherProfile.findById(req.params.id);
  // .select("-pendingRequests")
  // .select("-currentStudents")
  // .select("-pastStudents");

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  // Pending Requests
  var pendingRequests = await Student.find({
    _id: { $in: doc.pendingRequests },
  });
  pendingRequests.forEach((student) => {
    student.PendingRequestSent = student.PendingRequestSent.filter(
      (teacherProfile) => {
        return teacherProfile.teacherprofileId.id === req.params.id;
      }
    );
  });
  pendingRequests = pendingRequests.map((pending) => {
    console.log(pending.PendingRequestSent);
    pending = pending.toObject();
    pending.pendingentrymessage =
      pending.PendingRequestSent[0].pendingentrymessage;
    delete pending["subscribedTeachers"];
    delete pending["PendingRequestSent"];
    delete pending["pastTeachers"];

    console.log(pending);
    return pending;
  });

  //Current Students
  var currentStudents = await Student.find({
    _id: { $in: doc.currentStudents },
  });
  currentStudents.forEach((student) => {
    student.subscribedTeachers = student.subscribedTeachers.filter(
      (teacherProfile) => {
        return teacherProfile.teacherprofileId.id === req.params.id;
      }
    );
  });
  currentStudents = currentStudents.map((current) => {
    // console.log(current.currentStudentsent);
    current = current.toObject();
    current.joiningDate = current.subscribedTeachers[0].joiningDate;
    current.subscribedentrymessage =
      current.subscribedTeachers[0].subscribedentrymessage;
    delete current["subscribedTeachers"];
    delete current["PendingRequestSent"];
    delete current["pastTeachers"];

    //Past Students

    console.log(current);
    return current;
  });

  var pastStudents = await Student.find({
    _id: { $in: doc.pastStudents },
  });
  pastStudents.forEach((student) => {
    student.pastTeachers = student.pastTeachers.filter((teacherProfile) => {
      return teacherProfile.teacherprofileId.id === req.params.id;
    });
  });
  pastStudents = pastStudents.map((past) => {
    // console.log(current.pastent);
    past = past.toObject();
    past.pastjoiningDate = past.pastTeachers[0].pastjoiningDate;
    past.pastjoiningDate = past.pastTeachers[0].pastjoiningDate;
    past.pastleavingmessage = past.pastTeachers[0].pastleavingmessage;
    past.pastentrymessage = past.pastTeachers[0].pastentrymessage;

    delete past["subscribedTeachers"];
    delete past["PendingRequestSent"];
    delete past["pastTeachers"];

    console.log(past);
    return past;
  });

  doc = doc.toObject();
  delete doc.pendingRequests;
  delete doc.pastStudents;
  delete doc.pastStudents;

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
      pendingRequests,
    },
  });
});

exports.updateTeacherProfile = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (
    req.body.teacherId ||
    req.body.username ||
    req.body.category ||
    req.body.subcategory ||
    req.body.active
  ) {
    return next(
      new AppError(
        "This route is not for  teacherId,username, category, subcategory, active fields. ",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "teacherId",
    "username",
    "category",
    "subcategory",
    "active"
  );

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.findTeacherProfileByCategoryOrSubcategory = catchAsync(
  async (req, res, next) => {
    let profiles;
    // console.log(req.params.id);
    // Check if the ID exists in the subcategory collection
    const subcategory = await Category.findOne({
      "subcategories._id": req.params.id,
    });
    // console.log(subcategory);
    // console.log(typeof req.params.id);

    if (subcategory) {
      // Subcategory ID
      profiles = await TeacherProfile.find({ subcategory: req.params.id });
    } else {
      // Category ID
      profiles = await TeacherProfile.find({ category: req.params.id });
      // console.log(profiles);
    }

    // Return the found profiles
    res.status(200).json({
      status: "success",
      data: {
        teacher_profiles: profiles,
      },
    });
  }
);

exports.getAllTeacherProfiles = handleFactory.getAll(TeacherProfile);

exports.getStudentsForTeacherProfile = catchAsync(async (req, res, next) => {
  const teacherProfile = await TeacherProfile.findById(req.params.id)
    .populate("currentStudents")
    .populate("pendingRequests")
    .populate("pastStudents")
    .lean();

  if (!teacherProfile) {
    return next(new AppError("Could not get Students", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      currentStudents: teacherProfile.currentStudents,
      pendingRequests: teacherProfile.pendingRequests,
      pastStudents: teacherProfile.pastStudents,
    },
  });
});

/*
editTeacherProfile
deleteProfile


*/
/*
getAllStudents
*/
