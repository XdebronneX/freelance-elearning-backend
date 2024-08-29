const express = require('express');
const app = express();

const errorMiddleware = require('./middlewares/errors');
const users = require('./routes/user');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1',users);

// Error Middleware
app.use(errorMiddleware)


module.exports = app;