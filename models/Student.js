const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function(el) {
          return el === this.password;
        },
        message: "Password are not the same",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    AdditionalDetails: {
      type: String,
      Default: "",
    },
    subscribedTeachers: [
      {
        _id: false,

        teacherprofileId: {
          type: ObjectId,
          ref: "teacherProfiles",
        },
        subscribedentrymessage: {
          type: String,
          required: [true, "You must provide a entry message."],
        },
        joiningDate: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    PendingRequestSent: [
      {
        _id: false,
        teacherprofileId: {
          type: ObjectId,
          ref: "teacherProfiles",
        },
        pendingentrymessage: {
          type: String,
          required: [true, "You must provide a entry message."],
        },
      },
    ],
    pastTeachers: [
      {
        _id: false,

        teacherprofileId: {
          type: ObjectId,
          ref: "teacherProfiles",
        },
        pastentrymessage: {
          type: String,
          required: [true, "You must provide a entry message."],
        },
        pastleavingmessage: {
          type: String,
          required: [true, "You must provide a leaving message."],
        },
        leavingDate: {
          type: Date,
          default: Date.now(),
        },
        pastjoiningDate: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

studentSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

studentSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

studentSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

studentSchema.methods.correctPassword = async function(
  canditatePassword,
  userPassword
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

studentSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; // 100<200
  }
  return false;
};

studentSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

studentSchema.pre(/^find/, function(next) {
  this.populate({
    path: "subscribedTeachers.teacherprofileId",
  })
    .populate({
      path: "PendingRequestSent.teacherprofileId",
    })
    .populate({
      path: "pastTeachers.teacherprofileId",
    });

  next();
});

const Student = mongoose.model("students", studentSchema);

module.exports = Student;
