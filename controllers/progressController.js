// const ProgressModel = require("../models/progress");
// const LessonModel = require("../models/lesson");
// const ErrorHandler = require("../utils/errorHandler");

// exports.startProgress = async (req, res, next) => {
//     try {
//         const { lessonId, videoId, currentDuration } = req.body;
//         const userId = req.user.id; // Assumed from authentication middleware

//         // Fetch the lesson to get the videoLesson and its duration
//         const lesson = await LessonModel.findById(lessonId);
//         if (!lesson) {
//             return next(new ErrorHandler("Lesson not found!", 404));
//         }

//         // Find the video within the videoLesson array that matches the videoId
//         const videoLessonEntry = lesson.videoLesson.find(v => v.video.public_id === videoId);

//         if (!videoLessonEntry) {
//             return next(new ErrorHandler("Video not found in the lesson!", 404));
//         }

//         // Extract the totalDuration from the videoLesson
//         const totalDuration = videoLessonEntry.video.duration || { hours: 0, minutes: 0, seconds: 0 };

//         // Convert currentDuration to seconds (if needed)
//         // const currentDurationInSeconds = currentDuration.hours * 3600 + currentDuration.minutes * 60 + currentDuration.seconds;

//         // Check if progress already exists for this user, lesson, and video
//         let progress = await ProgressModel.findOne({ userId, lessonId, videoId });

//         if (!progress) {
//             // Create new progress if none exists
//             progress = new ProgressModel({
//                 userId,
//                 lessonId,
//                 videoId,
//                 currentDuration: {
//                     hours: currentDuration.hours || 0,
//                     minutes: currentDuration.minutes || 0,
//                     seconds: currentDuration.seconds || 0,
//                 },
//                 totalDuration: {
//                     hours: totalDuration.hours || 0,
//                     minutes: totalDuration.minutes || 0,
//                     seconds: totalDuration.seconds || 0,
//                 },
//                 lastWatchedAt: new Date(),
//             });
//         } else {
//             // Update existing progress
//             progress.currentDuration = {
//                 hours: currentDuration.hours || progress.currentDuration.hours,
//                 minutes: currentDuration.minutes || progress.currentDuration.minutes,
//                 seconds: currentDuration.seconds || progress.currentDuration.seconds,
//             };
//             progress.lastWatchedAt = new Date();
//         }

//         // Save the progress
//         await progress.save();

//         res.status(200).json({
//             success: true,
//             progress,
//         });
//     } catch (error) {
//         next(new ErrorHandler(error.message || "Failed to update progress", 500));
//     }
// };

//** working with the video id  */
// const ProgressModel = require("../models/progress");
// const LessonModel = require("../models/lesson");
// const ErrorHandler = require("../utils/errorHandler");

// exports.startProgress = async (req, res, next) => {
//     try {
//         const { lessonId, videoLessonId, currentDuration } = req.body;
//         const userId = req.user.id; // Assumed from authentication middleware

//         // Fetch the lesson to get the videoLesson and its duration
//         const lesson = await LessonModel.findById(lessonId);
//         if (!lesson) {
//             return next(new ErrorHandler("Lesson not found!", 404));
//         }

//         // Find the video within the videoLesson array that matches the videoLessonId
//         const videoLessonEntry = lesson.videoLesson.find(v => v._id.toString() === videoLessonId);

//         if (!videoLessonEntry) {
//             return next(new ErrorHandler("Video not found in the lesson!", 404));
//         }

//         // Extract the totalDuration from the videoLesson
//         const totalDuration = videoLessonEntry.video.duration || { hours: 0, minutes: 0, seconds: 0 };

//         // Check if progress already exists for this user, lesson, and videoLessonId
//         let progress = await ProgressModel.findOne({ userId, lessonId, videoLessonId });

//         if (!progress) {
//             // Create new progress if none exists
//             progress = new ProgressModel({
//                 userId,
//                 lessonId,
//                 videoLessonId,
//                 currentDuration: {
//                     hours: currentDuration.hours || 0,
//                     minutes: currentDuration.minutes || 0,
//                     seconds: currentDuration.seconds || 0,
//                 },
//                 totalDuration: {
//                     hours: totalDuration.hours || 0,
//                     minutes: totalDuration.minutes || 0,
//                     seconds: totalDuration.seconds || 0,
//                 },
//                 lastWatchedAt: new Date(),
//             });
//         } else {
//             // Update existing progress
//             progress.currentDuration = {
//                 hours: currentDuration.hours || progress.currentDuration.hours,
//                 minutes: currentDuration.minutes || progress.currentDuration.minutes,
//                 seconds: currentDuration.seconds || progress.currentDuration.seconds,
//             };
//             progress.lastWatchedAt = new Date();
//         }

//         // Save the progress
//         await progress.save();

//         res.status(200).json({
//             success: true,
//             progress,
//         });
//     } catch (error) {
//         next(new ErrorHandler(error.message || "Failed to update progress", 500));
//     }
// };

//** Latest working without isFisnished */
// const ProgressModel = require("../models/progress");
// const LessonModel = require("../models/lesson");
// const ErrorHandler = require("../utils/errorHandler");

// exports.startProgress = async (req, res, next) => {
//     try {
//         const { lessonId, videoLessonId, currentDuration } = req.body;
//         const userId = req.user.id; // Assumed from authentication middleware

//         // Fetch the lesson to get the videoLesson and its duration
//         const lesson = await LessonModel.findById(lessonId);
//         if (!lesson) {
//             return next(new ErrorHandler("Lesson not found!", 404));
//         }

//         // Find the video within the videoLesson array that matches the videoLessonId
//         const videoLessonEntry = lesson.videoLesson.find(v => v._id.toString() === videoLessonId);

//         if (!videoLessonEntry) {
//             return next(new ErrorHandler("Video not found in the lesson!", 404));
//         }

//         // Extract the totalDuration from the videoLesson
//         const totalDuration = videoLessonEntry.video.duration || { hours: 0, minutes: 0, seconds: 0 };

//         // Find or create the user's progress record for this lesson
//         let progress = await ProgressModel.findOne({ userId, lessonId });

//         if (!progress) {
//             // Create new progress record if none exists
//             progress = new ProgressModel({
//                 userId,
//                 lessonId,
//                 videoProgress: [{
//                     videoLessonId,
//                     currentDuration: {
//                         hours: currentDuration.hours || 0,
//                         minutes: currentDuration.minutes || 0,
//                         seconds: currentDuration.seconds || 0,
//                     },
//                     totalDuration: {
//                         hours: totalDuration.hours || 0,
//                         minutes: totalDuration.minutes || 0,
//                         seconds: totalDuration.seconds || 0,
//                     },
//                     lastWatchedAt: new Date(),
//                 }],
//             });
//         } else {
//             // Update existing progress
//             const videoProgressEntry = progress.videoProgress.find(vp => vp.videoLessonId.toString() === videoLessonId);

//             if (videoProgressEntry) {
//                 // Update existing video progress
//                 videoProgressEntry.currentDuration = {
//                     hours: currentDuration.hours || videoProgressEntry.currentDuration.hours,
//                     minutes: currentDuration.minutes || videoProgressEntry.currentDuration.minutes,
//                     seconds: currentDuration.seconds || videoProgressEntry.currentDuration.seconds,
//                 };
//                 videoProgressEntry.lastWatchedAt = new Date();
//             } else {
//                 // Add new video progress entry
//                 progress.videoProgress.push({
//                     videoLessonId,
//                     currentDuration: {
//                         hours: currentDuration.hours || 0,
//                         minutes: currentDuration.minutes || 0,
//                         seconds: currentDuration.seconds || 0,
//                     },
//                     totalDuration: {
//                         hours: totalDuration.hours || 0,
//                         minutes: totalDuration.minutes || 0,
//                         seconds: totalDuration.seconds || 0,
//                     },
//                     lastWatchedAt: new Date(),
//                 });
//             }
//         }

//         // Save the progress
//         await progress.save();

//         res.status(200).json({
//             success: true,
//             progress,
//         });
//     } catch (error) {
//         next(new ErrorHandler(error.message || "Failed to update progress", 500));
//     }
// };

//** Latest working with isFisnished */
// const ProgressModel = require("../models/progress");
// const LessonModel = require("../models/lesson");
// const ErrorHandler = require("../utils/errorHandler");

// exports.startProgress = async (req, res, next) => {
//     try {
//         const { lessonId, videoLessonId, currentDuration } = req.body;
//         const userId = req.user.id; // Assumed from authentication middleware

//         // Fetch the lesson to get the videoLesson and its duration
//         const lesson = await LessonModel.findById(lessonId);
//         if (!lesson) {
//             return next(new ErrorHandler("Lesson not found!", 404));
//         }

//         // Find the video within the videoLesson array that matches the videoLessonId
//         const videoLessonEntry = lesson.videoLesson.find(v => v._id.toString() === videoLessonId);

//         if (!videoLessonEntry) {
//             return next(new ErrorHandler("Video not found in the lesson!", 404));
//         }

//         // Extract the totalDuration from the videoLesson
//         const totalDuration = videoLessonEntry.video.duration || { hours: 0, minutes: 0, seconds: 0 };

//         // Helper function to check if video is finished
//         const isFinished = (currentDuration, totalDuration) => {
//             return (currentDuration.hours > totalDuration.hours) ||
//                 (currentDuration.hours === totalDuration.hours && currentDuration.minutes > totalDuration.minutes) ||
//                 (currentDuration.hours === totalDuration.hours && currentDuration.minutes === totalDuration.minutes && currentDuration.seconds >= totalDuration.seconds);
//         };

//         // Find or create the user's progress record for this lesson
//         let progress = await ProgressModel.findOne({ userId, lessonId });

//         if (!progress) {
//             // Create new progress record if none exists
//             progress = new ProgressModel({
//                 userId,
//                 lessonId,
//                 videoProgress: [{
//                     videoLessonId,
//                     currentDuration: {
//                         hours: currentDuration.hours || 0,
//                         minutes: currentDuration.minutes || 0,
//                         seconds: currentDuration.seconds || 0,
//                     },
//                     totalDuration: {
//                         hours: totalDuration.hours || 0,
//                         minutes: totalDuration.minutes || 0,
//                         seconds: totalDuration.seconds || 0,
//                     },
//                     isFinished: isFinished(currentDuration, totalDuration),
//                     lastWatchedAt: new Date(),
//                 }],
//             });
//         } else {
//             // Update existing progress
//             const videoProgressEntry = progress.videoProgress.find(vp => vp.videoLessonId.toString() === videoLessonId);

//             if (videoProgressEntry) {
//                 // Update existing video progress
//                 videoProgressEntry.currentDuration = {
//                     hours: currentDuration.hours || videoProgressEntry.currentDuration.hours,
//                     minutes: currentDuration.minutes || videoProgressEntry.currentDuration.minutes,
//                     seconds: currentDuration.seconds || videoProgressEntry.currentDuration.seconds,
//                 };
//                 videoProgressEntry.isFinished = isFinished(videoProgressEntry.currentDuration, videoProgressEntry.totalDuration);
//                 videoProgressEntry.lastWatchedAt = new Date();
//             } else {
//                 // Add new video progress entry
//                 progress.videoProgress.push({
//                     videoLessonId,
//                     currentDuration: {
//                         hours: currentDuration.hours || 0,
//                         minutes: currentDuration.minutes || 0,
//                         seconds: currentDuration.seconds || 0,
//                     },
//                     totalDuration: {
//                         hours: totalDuration.hours || 0,
//                         minutes: totalDuration.minutes || 0,
//                         seconds: totalDuration.seconds || 0,
//                     },
//                     isFinished: isFinished(currentDuration, totalDuration),
//                     lastWatchedAt: new Date(),
//                 });
//             }
//         }

//         // Save the progress
//         await progress.save();

//         res.status(200).json({
//             success: true,
//             progress,
//         });
//     } catch (error) {
//         next(new ErrorHandler(error.message || "Failed to update progress", 500));
//     }
// };


const ProgressModel = require("../models/progress");
const LessonModel = require("../models/lesson");
const ErrorHandler = require("../utils/errorHandler");

exports.startProgress = async (req, res, next) => {
    try {
        const { lessonId, videoLessonId, currentDuration } = req.body;
        const userId = req.user.id;

        const lesson = await LessonModel.findById(lessonId);
        if (!lesson) {
            return next(new ErrorHandler("Lesson not found!", 404));
        }

        const videoLessonEntry = lesson.videoLesson.find(v => v._id.toString() === videoLessonId);
        if (!videoLessonEntry) {
            return next(new ErrorHandler("Video not found in the lesson!", 404));
        }

        const totalDuration = videoLessonEntry.video.duration || { hours: 0, minutes: 0, seconds: 0 };

        const isFinished = (currentDuration, totalDuration) => {
            return (currentDuration.hours > totalDuration.hours) ||
                (currentDuration.hours === totalDuration.hours && currentDuration.minutes > totalDuration.minutes) ||
                (currentDuration.hours === totalDuration.hours && currentDuration.minutes === totalDuration.minutes && currentDuration.seconds >= totalDuration.seconds);
        };

        let progress = await ProgressModel.findOne({ userId, lessonId });

        if (!progress) {
            progress = new ProgressModel({
                userId,
                lessonId,
                videoProgress: [{
                    videoLessonId,
                    currentDuration: {
                        hours: currentDuration.hours || 0,
                        minutes: currentDuration.minutes || 0,
                        seconds: currentDuration.seconds || 0,
                    },
                    totalDuration: {
                        hours: totalDuration.hours || 0,
                        minutes: totalDuration.minutes || 0,
                        seconds: totalDuration.seconds || 0,
                    },
                    isFinished: isFinished(currentDuration, totalDuration),
                    lastWatchedAt: new Date(),
                }],
            });
        } else {

            const currentVideoIndex = lesson.videoLesson.findIndex(v => v._id.toString() === videoLessonId);

            if (currentVideoIndex > 0) {
                const previousVideoId = lesson.videoLesson[currentVideoIndex - 1]._id.toString();
                const previousVideoProgress = progress.videoProgress.find(vp => vp.videoLessonId.toString() === previousVideoId);

                if (!previousVideoProgress || !previousVideoProgress.isFinished) {
                    return next(new ErrorHandler(`Finish previous video to to unlock`, 400));
                }
            }

            const videoProgressEntry = progress.videoProgress.find(vp => vp.videoLessonId.toString() === videoLessonId);

            if (videoProgressEntry) {

                videoProgressEntry.currentDuration = {
                    hours: currentDuration.hours || videoProgressEntry.currentDuration.hours,
                    minutes: currentDuration.minutes || videoProgressEntry.currentDuration.minutes,
                    seconds: currentDuration.seconds || videoProgressEntry.currentDuration.seconds,
                };
                videoProgressEntry.isFinished = isFinished(videoProgressEntry.currentDuration, videoProgressEntry.totalDuration);
                videoProgressEntry.lastWatchedAt = new Date();
            } else {

                progress.videoProgress.push({
                    videoLessonId,
                    currentDuration: {
                        hours: currentDuration.hours || 0,
                        minutes: currentDuration.minutes || 0,
                        seconds: currentDuration.seconds || 0,
                    },
                    totalDuration: {
                        hours: totalDuration.hours || 0,
                        minutes: totalDuration.minutes || 0,
                        seconds: totalDuration.seconds || 0,
                    },
                    isFinished: isFinished(currentDuration, totalDuration),
                    lastWatchedAt: new Date(),
                });
            }
        }

        const allVideosFinished = progress.videoProgress.every(vp => vp.isFinished);
        progress.watchCompleted = allVideosFinished;

        await progress.save();

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