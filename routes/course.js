const express = require("express")
const router = express.Router()
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { createCourse, getCoursesPublic, getAdminCourses, getSingleCourse, deactivateCourses, reactivateCourses } = require("../controllers/courseController");

router.post('/new/course', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'banner' }, { name: 'trailer' }]), createCourse);
router.put('/courses/deactivatedMultiple', deactivateCourses);
router.put('/courses/reactivatedMultiple', reactivateCourses);
router.get('/admin/courses', isAuthenticatedUser, authorizeRoles("admin"), getAdminCourses);

router.get('/allCourses', isAuthenticatedUser, getCoursesPublic);
router.get('/singleCourse/:id', isAuthenticatedUser, getSingleCourse);
module.exports = router;