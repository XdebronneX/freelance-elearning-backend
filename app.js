const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const errorMiddleware = require("./middlewares/errors");
const users = require("./routes/user");

// List of allowed origins
const allowedOrigins = ["http://localhost:3000"];
// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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

// Error Middleware
app.use(errorMiddleware);

module.exports = app;
