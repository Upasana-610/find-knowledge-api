const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { group } = require("console");

const teacherProfileSchema = new mongoose.Schema({
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
});

const TeacherProfile = mongoose.model("teacherProfiles", teacherProfileSchema);

module.exports = TeacherProfile;
