const express = require("express");
const router = express.Router();
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { startProgress, getLatestProgress, getCurrentlyWatched, getAllFinishVideo, getAllFinishCourse } = require("../controllers/progressController");

router.post("/progress/start", isAuthenticatedUser, startProgress);
router.get('/progress/latest/:lessonId', isAuthenticatedUser, getLatestProgress);
router.get('/current/watched/:lessonId', isAuthenticatedUser, getCurrentlyWatched);
router.get('/finishVideos', isAuthenticatedUser, getAllFinishVideo);
router.get('/finishCourses', isAuthenticatedUser, getAllFinishCourse);

module.exports = router;
