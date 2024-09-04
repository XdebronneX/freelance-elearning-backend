const express = require("express")
const router = express.Router()
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { createCourse, getCoursesPublic, getAdminCourses, getSingleCourse, deactivateCourse, reactivateCourse } = require("../controllers/courseController");

router.post('/new/course', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'banner' }, { name: 'trailer' }]), createCourse);
router.put('/course/deactivated/:id', isAuthenticatedUser, authorizeRoles('admin'), deactivateCourse);
router.put('/course/reactivated/:id', isAuthenticatedUser, authorizeRoles('admin'), reactivateCourse);
router.get('/admin/courses', isAuthenticatedUser, authorizeRoles("admin"), getAdminCourses);

router.get('/allCourses', isAuthenticatedUser, getCoursesPublic);
router.get('/singleCourse/:id', isAuthenticatedUser, getSingleCourse);
module.exports = router;