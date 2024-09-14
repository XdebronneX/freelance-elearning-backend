const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const errorMiddleware = require("./middlewares/errors");
const users = require("./routes/user");
const courses = require("./routes/course");
const carousels = require("./routes/carousel");
const analytics = require("./routes/analytic");
const lessons = require("./routes/lesson");
const progressRoute = require("./routes/progress")

// List of allowed origins
const allowedOrigins = [ "http://localhost:3000",
"https://e-learning-freelance-frontend.vercel.app"];
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  credentials: true,
}));

// Routes
app.use("/api/v1", users);
app.use("/api/v1", courses);
app.use("/api/v1", carousels);
app.use("/api/v1", lessons);
app.use("/api/v1", progressRoute);
app.use("/api/v1", analytics);
// Error Middleware
app.use(errorMiddleware);

module.exports = app;
