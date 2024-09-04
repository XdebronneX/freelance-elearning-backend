const express = require("express")
const router = express.Router()
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { getAllStudents } = require("../controllers/analyticsController");

router.get('/allStudents', isAuthenticatedUser,authorizeRoles("admin"), getAllStudents);

module.exports = router;