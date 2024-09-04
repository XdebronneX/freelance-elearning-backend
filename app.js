const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const errorMiddleware = require("./middlewares/errors");
const users = require("./routes/user");
const courses = require("./routes/course");
const carousels = require("./routes/carousel");
const analytics = require("./routes/analytic");

// List of allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://e-learning-freelance-frontend.vercel.app",
];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Routes
app.use("/api/v1", users);
app.use("/api/v1", courses);
app.use("/api/v1", carousels);
app.use("/api/v1", analytics);

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
