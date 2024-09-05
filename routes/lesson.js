const express = require("express")
const router = express.Router()
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { createLesson, updateLesson, getAdminLessons, getAdminSingleLesson, getLessonsPublic, getSingleLessonPublic, deactivateLessons, reactivateCourses } = require("../controllers/lessonController");

router.post('/new/lesson', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'video' }, { name: 'banner' }, { name: 'thumbnail' }]), createLesson);
router.put('/add/lesson/:id', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'video' }, { name: 'banner' }, { name: 'thumbnail' }]), updateLesson);
router.get('/admin/lessons', isAuthenticatedUser, authorizeRoles("admin"), getAdminLessons);
router.get('/admin/singleLesson/:id', isAuthenticatedUser,authorizeRoles("admin"), getAdminSingleLesson);
router.put('/lessons/deactivatedMultiple',isAuthenticatedUser,authorizeRoles("admin"), deactivateLessons);
router.put('/lessons/reactivatedMultiple',isAuthenticatedUser,authorizeRoles("admin"), reactivateCourses);

router.get('/allLessons', isAuthenticatedUser, getLessonsPublic);
router.get('/singleLesson/:id', isAuthenticatedUser, getSingleLessonPublic);
module.exports = router;