const express = require("express")
const router = express.Router()
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { getAllStudents, getTotalDownloadedWorkbook } = require("../controllers/analyticsController");

router.get('/allStudents', isAuthenticatedUser,authorizeRoles("admin"), getAllStudents);
router.get('/totalDownloaded', isAuthenticatedUser,authorizeRoles("admin"), getTotalDownloadedWorkbook);
module.exports = router;