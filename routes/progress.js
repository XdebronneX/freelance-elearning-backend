const express = require("express");
const router = express.Router();
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { startProgress, getLatestProgress, getCurrentlyWatched } = require("../controllers/progressController");

router.post("/progress/start", isAuthenticatedUser, startProgress);
router.get('/progress/latest/:lessonId', isAuthenticatedUser, getLatestProgress);
router.get('/current/watched/:lessonId', isAuthenticatedUser, getCurrentlyWatched);
module.exports = router;
