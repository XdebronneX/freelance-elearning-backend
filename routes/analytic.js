const express = require("express")
const router = express.Router()
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { getAllStudents, getTotalDownloadedWorkbook, getAllCompletedCourse, getTotalInactiveUsers, getTotalActiveUsers } = require("../controllers/analyticsController");

router.get('/allStudents', isAuthenticatedUser,authorizeRoles("admin"), getAllStudents);
router.get('/totalDownloaded', isAuthenticatedUser,authorizeRoles("admin"), getTotalDownloadedWorkbook);
router.get('/totalCompleted', isAuthenticatedUser,authorizeRoles("admin"), getAllCompletedCourse);
router.get('/totalInactive', isAuthenticatedUser,authorizeRoles("admin"), getTotalInactiveUsers);
router.get('/totalActive', isAuthenticatedUser,authorizeRoles("admin"), getTotalActiveUsers);
module.exports = router;