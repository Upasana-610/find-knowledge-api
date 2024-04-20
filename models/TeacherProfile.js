const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { group } = require("console");
const Teacher = require("../models/Teacher");
const AppError = require(".././utils/appError");

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
      foreignField: "subcategories.$[]._id",
      localField: "subcategory",
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
        type: ObjectId,
        ref: "students",
      },
    ],
    currentStudents: [
      {
        type: ObjectId,
        ref: "students",
      },
    ],
    pastStudents: [
      {
        type: ObjectId,
        ref: "students",
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
    path: "category",
  });

  next();
});

const TeacherProfile = mongoose.model("teacherProfiles", teacherProfileSchema);

module.exports = TeacherProfile;
