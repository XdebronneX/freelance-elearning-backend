const express = require("express")
const router = express.Router()
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { createCourse, getCoursesPublic, getAdminCourses, getAdminSingleCourse, getSingleCoursePublic, deactivateCourses, reactivateCourses, updateCourse, downloadworkBook } = require("../controllers/courseController");

router.post('/new/course', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'banner' }, { name: 'trailer' }, { name: 'workBook' }]), createCourse);
router.put('/update/course/:id', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'banner' }, { name: 'trailer' }, { name: 'workBook' }]), updateCourse);
router.put('/courses/deactivatedMultiple',isAuthenticatedUser,authorizeRoles("admin"), deactivateCourses);
router.put('/courses/reactivatedMultiple',isAuthenticatedUser,authorizeRoles("admin"), reactivateCourses);
router.get('/admin/courses', isAuthenticatedUser, authorizeRoles("admin"), getAdminCourses);
router.get('/admin/singleCourse/:id', isAuthenticatedUser,authorizeRoles("admin"), getAdminSingleCourse);
router.get('/download/workbook/:id', downloadworkBook);

router.get('/allCourses', isAuthenticatedUser, getCoursesPublic);
router.get('/singleCourse/:id', isAuthenticatedUser, getSingleCoursePublic);
module.exports = router;