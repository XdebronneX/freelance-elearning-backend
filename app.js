const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");

const errorMiddleware = require('./middlewares/errors');
const users = require('./routes/user');
const courses = require('./routes/course');
const carousels = require("./routes/carousel");
const analytics = require('./routes/analytic');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
// Routes
app.use('/api/v1',users);
app.use('/api/v1',courses);
app.use('/api/v1',carousels);
app.use('/api/v1',analytics);

// Error Middleware
app.use(errorMiddleware)


module.exports = app;