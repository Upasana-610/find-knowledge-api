const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, jwt, statusCode, req, res) => {
  const token = signToken(user._id);
  // console.log(token);
  res.cookie(jwt, token, {
    // expires: new Date(
    //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    // ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = (Model, jwt) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const url = `${req.protocol}://${req.get("host")}/me`;

    await new Email(user, url).sendWelcome();

    createSendToken(user, jwt, 201, req, res);
  });

exports.login = (Model, jwt) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await Model.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }
    createSendToken(user, jwt, 200, req, res);
  });

exports.logout = (jwt) => (req, res) => {
  res.cookie(jwt, "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = (Model, jwtToken) =>
  catchAsync(async (req, res, next) => {
    let token;
    console.log("jwt " + jwtToken);
    console.log(req.cookies);
    // console.log(req.cookies.jwt);
    var cookie;
    var jwtfrombody;
    if (jwtToken === "studentjwt") {
      jwtfrombody = req.body.studentjwt;
      cookie = req.cookies.studentjwt;
    } else {
      cookie = req.cookies.teacherjwt;
      jwtfrombody = req.body.teacherjwt;
    }
    console.log(cookie);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (cookie) {
      token = cookie;
    } else if (jwtfrombody) {
      token = jwtfrombody;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await Model.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    // console.log(res.locals.user);
    // res.status(200).json({
    //   status: "success",
    // });
    next();
  });
