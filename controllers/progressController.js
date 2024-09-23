const ProgressModel = require("../models/progress");
const LessonModel = require("../models/lesson");
const ErrorHandler = require("../utils/errorHandler");
const NotificationModel = require("../models/notification")

// exports.startProgress = async (req, res, next) => {
//     try {
//         const { lessonId, videoLessonId, currentDuration } = req.body;
//         const userId = req.user.id;

//         const lesson = await LessonModel.findById(lessonId);
//         if (!lesson) {
//             return next(new ErrorHandler("Lesson not found!", 404));
//         }

//         const videoLessonEntry = lesson.videoLesson.find(v => v._id.toString() === videoLessonId);
//         if (!videoLessonEntry) {
//             return next(new ErrorHandler("Video not found in the lesson!", 404));
//         }

//         const totalDuration = videoLessonEntry.video.duration.seconds;

//         const isFinished = (currentSeconds, totalSeconds) => {
//             return currentSeconds >= totalSeconds;
//         };

//         let progress = await ProgressModel.findOne({ userId, lessonId });

//         const currentSeconds = currentDuration.seconds || 0;

//         const currentVideoIndex = lesson.videoLesson.findIndex(v => v._id.toString() === videoLessonId);

//         if (currentVideoIndex > 0) {
//             const firstVideoId = lesson.videoLesson[0]._id.toString();
//             const firstVideoProgress = progress ? progress.videoProgress.find(vp => vp.videoLessonId.toString() === firstVideoId) : null;

//             if (!firstVideoProgress || !firstVideoProgress.isFinished) {
//                 return next(new ErrorHandler("Finish previous video to unlock", 400));
//             }
//         }

//         if (!progress) {
//             progress = new ProgressModel({
//                 userId,
//                 lessonId,
//                 videoProgress: [{
//                     videoLessonId,
//                     currentDuration: {
//                         seconds: currentSeconds,
//                     },
//                     isFinished: isFinished(currentSeconds, totalDuration),
//                     lastWatchedAt: new Date(),
//                 }],
//             });
//         } else {
//             const videoProgressEntry = progress.videoProgress.find(vp => vp.videoLessonId.toString() === videoLessonId);

//             if (videoProgressEntry) {
//                 videoProgressEntry.currentDuration.seconds = currentSeconds;

//                 if (!videoProgressEntry.isFinished) {
//                     videoProgressEntry.isFinished = isFinished(videoProgressEntry.currentDuration.seconds, totalDuration);
//                 }
                
//                 videoProgressEntry.lastWatchedAt = new Date();
//             } else {
//                 progress.videoProgress.push({
//                     videoLessonId,
//                     currentDuration: {
//                         seconds: currentSeconds,
//                     },
//                     isFinished: isFinished(currentSeconds, totalDuration),
//                     lastWatchedAt: new Date(),
//                 });
//             }
//         }

//         const totalVideosCount = lesson.videoLesson.length;
//         const finishedVideosCount = progress.videoProgress.filter(vp => vp.isFinished).length;

//         progress.watchCompleted = finishedVideosCount === totalVideosCount;

//         await progress.save();

//         res.status(200).json({
//             success: true,
//             progress,
//         });
//     } catch (error) {
//         next(new ErrorHandler(error.message || "Failed to update progress", 500));
//     }
// };

exports.startProgress = async (req, res, next) => {
    try {
        const { lessonId, videoLessonId, currentDuration } = req.body;
        const userId = req.user.id;

        // Populate the assignCourse field to access the course details
        const lesson = await LessonModel.findById(lessonId).populate('assignCourse');
        if (!lesson) {
            return next(new ErrorHandler("Lesson not found!", 404));
        }

        const videoLessonEntry = lesson.videoLesson.find(v => v._id.toString() === videoLessonId);
        if (!videoLessonEntry) {
            return next(new ErrorHandler("Video not found in the lesson!", 404));
        }

        const totalDuration = videoLessonEntry.video.duration.seconds;

        const isFinished = (currentSeconds, totalSeconds) => {
            return currentSeconds >= totalSeconds;
        };

        let progress = await ProgressModel.findOne({ userId, lessonId });

        const currentSeconds = currentDuration.seconds || 0;

        const currentVideoIndex = lesson.videoLesson.findIndex(v => v._id.toString() === videoLessonId);

        // Ensure previous video is finished before unlocking the next video
        if (currentVideoIndex > 0) {
            const firstVideoId = lesson.videoLesson[0]._id.toString();
            const firstVideoProgress = progress ? progress.videoProgress.find(vp => vp.videoLessonId.toString() === firstVideoId) : null;

            if (!firstVideoProgress || !firstVideoProgress.isFinished) {
                return next(new ErrorHandler("Finish previous video to unlock", 400));
            }
        }

        // If no progress record exists, create a new one
        if (!progress) {
            progress = new ProgressModel({
                userId,
                lessonId,
                videoProgress: [{
                    videoLessonId,
                    currentDuration: {
                        seconds: currentSeconds,
                    },
                    isFinished: isFinished(currentSeconds, totalDuration),
                    lastWatchedAt: new Date(),
                }],
            });
        } else {
            // Update existing video progress or add a new entry
            const videoProgressEntry = progress.videoProgress.find(vp => vp.videoLessonId.toString() === videoLessonId);

            if (videoProgressEntry) {
                videoProgressEntry.currentDuration.seconds = currentSeconds;

                if (!videoProgressEntry.isFinished) {
                    videoProgressEntry.isFinished = isFinished(videoProgressEntry.currentDuration.seconds, totalDuration);
                }
                
                videoProgressEntry.lastWatchedAt = new Date();
            } else {
                progress.videoProgress.push({
                    videoLessonId,
                    currentDuration: {
                        seconds: currentSeconds,
                    },
                    isFinished: isFinished(currentSeconds, totalDuration),
                    lastWatchedAt: new Date(),
                });
            }
        }

        const totalVideosCount = lesson.videoLesson.length;
        const finishedVideosCount = progress.videoProgress.filter(vp => vp.isFinished).length;

        progress.watchCompleted = finishedVideosCount === totalVideosCount;

        await progress.save();

        // Check if the current video is finished and insert a notification if true
        const currentVideoProgress = progress.videoProgress.find(vp => vp.videoLessonId.toString() === videoLessonId);
        if (currentVideoProgress.isFinished) {
            const videoNotification = new NotificationModel({
                user: req.user ? req.user.id : null,
                action: `Finish video ${videoLessonEntry.title}`,
            });
            await videoNotification.save();
        }

        // If all videos are finished, insert a course completion notification using assignCourse title
        if (progress.watchCompleted && lesson.assignCourse) {
            const courseNotification = new NotificationModel({
                user: req.user ? req.user.id : null,
                action: `Finish course ${lesson.assignCourse.title}`,
            });
            await courseNotification.save();
        }

        res.status(200).json({
            success: true,
            progress,
        });
    } catch (error) {
        next(new ErrorHandler(error.message || "Failed to update progress", 500));
    }
};

exports.getLatestProgress = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.id;

        const progress = await ProgressModel.findOne({ userId, lessonId });

        if (!progress) {
            return next(new ErrorHandler("No progress found for the user on this lesson!", 404));
        }

        const latestProgressPerVideo = progress.videoProgress.reduce((acc, curr) => {
            const existingEntry = acc.find(vp => vp.videoLessonId.toString() === curr.videoLessonId.toString());

            if (!existingEntry) {
                acc.push(curr);
            } else if (new Date(curr.lastWatchedAt) > new Date(existingEntry.lastWatchedAt)) {
                const index = acc.findIndex(vp => vp.videoLessonId.toString() === curr.videoLessonId.toString());
                acc[index] = curr;
            }
            return acc;
        }, []);

        res.status(200).json({
            success: true,
            latestProgressPerVideo
        });
    } catch (error) {
        next(new ErrorHandler(error.message || "Failed to retrieve latest progress", 500));
    }
};

exports.getCurrentlyWatched = async (req, res, next) => {
    try {
        const { lessonId } = req.params; 
        const userId = req.user.id; 

        const progress = await ProgressModel.findOne({ userId, lessonId });

        if (!progress) {
            return next(new ErrorHandler("No progress found for the user on this lesson!", 404));
        }

        const currentlyWatched = progress.videoProgress.find(vp => !vp.isFinished);

        if (!currentlyWatched) {
            return res.status(200).json({
                success: true,
                message: "All videos in this lesson have been completed!"
            });
        }

        res.status(200).json({
            success: true,
            currentlyWatched
        });
    } catch (error) {
        next(new ErrorHandler(error.message || "Failed to retrieve currently watched video", 500));
    }
};