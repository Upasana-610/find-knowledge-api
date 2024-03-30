const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");

const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const teacherProfileRoutes = require("./routes/teacherProfileRoutes");

const app = express();

app.enable("trust proxy");

app.use(fileUpload());
app.use(cors());

app.options("*", cors());

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/teacherprofile", teacherProfileRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
