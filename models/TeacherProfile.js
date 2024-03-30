const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { group } = require("console");

const teacherProfileSchema = new mongoose.Schema(
  {
    teacherId: {
      type: ObjectId,
      required: [true, "Teacher Profile must belong to a teacher"],
    },
    username: {
      type: String,
      required: [true, "Please tell us your name"],
      unique: true,
    },
    category: {
      type: ObjectId,
      ref: "categories",
      required: [true, "Please choose your category"],
    },
    subcategory: {
      type: ObjectId,
      ref: "categories",
      foreignField: "subcategories._id",
      localField: "_id",
      required: [true, "Please choose your sub-category"],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    daysAvailable: [
      {
        type: String,
        enum: {
          values: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          message:
            "Only Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday sizes are allowed ",
        },
      },
    ],
    remuneration: {
      online: {
        private: {
          type: Number,
          default: 0,
        },
        group: {
          type: Number,
          default: 0,
        },
      },
      offline: {
        private: {
          type: Number,
          default: 0,
        },
        group: {
          type: Number,
          default: 0,
        },
      },
    },
    AdditionalDetails: String,
    pendingRequests: [
      {
        studentId: {
          type: ObjectId,
          ref: "students",
        },
      },
    ],
    currentStudents: [
      {
        studentId: {
          type: ObjectId,
          ref: "students",
        },
      },
    ],
    pastStudents: [
      {
        studentId: {
          type: ObjectId,
          ref: "students",
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

teacherProfileSchema.pre(/^find/, function(next) {
  this.populate({
    path: "pendingRequests.studentId",
    select: ["_id", "name", "AdditionalDetails"],
  })
    .populate({
      path: "pendingRequests.studentId",
      match: { "PendingRequestSent.teacherprofileId": { $eq: this._id } },
      select: ["PendingRequestSent.pendingentrymessage"],
    })
    .populate({
      path: "currentStudents.studentId",
      select: ["_id", "name", "AdditionalDetails"],
    })
    .populate({
      path: "currentStudents.studentId",
      match: { "subscribedTeachers.teacherprofileId": { $eq: this._id } },
      select: [
        "subscribedTeachers.subscribedentrymessage",
        "subscribedTeachers.joiningDate",
      ],
    })
    .populate({
      path: "pastStudents.studentId",
      select: ["_id", "name", "AdditionalDetails"],
    })
    .populate({
      path: "pastStudents.studentId",
      match: { "pastTeachers.teacherprofileId": { $eq: this._id } },
      select: [
        "pastTeachers.pastentrymessage",
        "pastTeachers.pastjoiningDate",
        "pastTeachers.leavingDate",
        "pastTeachers.pastleavingmessage",
      ],
    });

  next();
});

const TeacherProfile = mongoose.model("teacherProfiles", teacherProfileSchema);

module.exports = TeacherProfile;
