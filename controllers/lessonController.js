const LessonModel = require("../models/lesson");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;
const fs = require("fs")

const uploadToCloudinary = async (filePath, folder, fileName, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: fileName,
      resource_type: resourceType,
    });

    let durationFormatted = null;
    if (resourceType === "video" && result.duration) {
      const duration = result.duration;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);

      durationFormatted = `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""}${seconds}s`;
    }

    return { 
      public_id: result.public_id, 
      url: result.secure_url,
      duration: durationFormatted 
    };
  } catch (error) {
    throw new ErrorHandler(`Error uploading ${fileName}: ${error.message}`, 500);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const { lessonTitle, assignCourse, videoLesson } = req.body;
    const uploadedBy = req.user.id;

    const existingLesson = await LessonModel.findOne({ lessonTitle });
    if (existingLesson) {
      return next(new ErrorHandler("Lesson title already exists!", 400));
    }

    const existingVideoLesson = await LessonModel.findOne({
      "videoLesson.title": videoLesson.title
    });
    if (existingVideoLesson) {
      return next(new ErrorHandler("Video lesson title already exists!", 400));
    }

    const titleSlug = videoLesson.title ? videoLesson.title.replace(/\s+/g, '_').toLowerCase() : 'default_title';

    let uploadedVideo = {}, uploadedBanner = {}, uploadedThumbnail = {};
    const uploadPromises = [];

    if (req.files && req.files.video && req.files.video[0]) {
      const videoPath = req.files.video[0].path;
      uploadPromises.push(
        cloudinary.uploader.upload(videoPath, {
          resource_type: 'video',
          folder: 'lessons',
          streaming_profile: 'adaptive',
          eager: [
            { format: 'm3u8' }
          ],
          eager_async: true
        })
        .then(result => {
          uploadedVideo = result;
          console.log('Uploaded video details:', uploadedVideo);
        })
      );
    }

    if (req.files && req.files.banner && req.files.banner[0]) {
      const bannerPath = req.files.banner[0].path;
      uploadPromises.push(
        cloudinary.uploader.upload(bannerPath, {
          folder: 'lessons',
          width: 150,
          crop: 'scale',
        })
        .then(result => { 
          uploadedBanner = result; 
          console.log('Uploaded banner details:', uploadedBanner);
        })
      );
    }

    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnailPath = req.files.thumbnail[0].path;
      uploadPromises.push(
        cloudinary.uploader.upload(thumbnailPath, {
          folder: 'lessons',
          width: 150,
          crop: 'scale',
        })
        .then(result => { 
          uploadedThumbnail = result; 
          console.log('Uploaded thumbnail details:', uploadedThumbnail);
        })
      );
    }

    await Promise.all(uploadPromises);

    let hlsUrl = null;
    const maxRetries = 10;
    const retryInterval = 5000;

    for (let i = 0; i < maxRetries; i++) {
      const videoDetails = await cloudinary.api.resource(uploadedVideo.public_id, {
        resource_type: 'video',
      });

      console.log('Checking video details:', videoDetails);

      if (videoDetails.eager) {
        const hlsFormat = videoDetails.eager.find((format) => format.format === 'm3u8');
        if (hlsFormat) {
          hlsUrl = hlsFormat.secure_url;
          break;
        }
      }

      if (videoDetails.derived) {
        const hlsFormat = videoDetails.derived.find((format) => format.format === 'm3u8');
        if (hlsFormat) {
          hlsUrl = hlsFormat.secure_url;
          break;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }

    if (!hlsUrl) {
      return next(new ErrorHandler('HLS stream URL not found.', 500));
    }

    let hours = 0, minutes = 0, seconds = 0;
    if (uploadedVideo.duration) {
      const durationSeconds = uploadedVideo.duration; 
      hours = Math.floor(durationSeconds / 3600);
      minutes = Math.floor((durationSeconds % 3600) / 60);
      seconds = Math.floor(durationSeconds % 60);
    }

    const newLesson = await LessonModel.create({
      assignCourse,
      uploadedBy,
      lessonTitle,
      videoLesson: [{
        ...videoLesson,
        video: {
          public_id: uploadedVideo.public_id,
          url: hlsUrl,
          duration: {
            hours,
            minutes,
            seconds,
          },
        },
        banner: uploadedBanner.public_id ? uploadedBanner : undefined,
        thumbnail: uploadedThumbnail.public_id ? uploadedThumbnail : undefined,
      }],
    });

    res.status(201).json({
      success: true,
      lesson: newLesson,
    });

    fs.unlinkSync(req.files.video[0].path);
    fs.unlinkSync(req.files.banner[0].path);
    fs.unlinkSync(req.files.thumbnail[0].path);

  } catch (error) {
    console.error('Error creating lesson:', error);
    next(new ErrorHandler(error.message || "Error creating lesson", 500));
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { videoLesson } = req.body;

    let lesson = await LessonModel.findById(id);

    if (!lesson) {
      return next(new ErrorHandler("Lesson not found", 404));
    }

    const existingVideoTitle = await LessonModel.findOne({
      "videoLesson.title": videoLesson.title,
    });

    if (existingVideoTitle) {
      return next(new ErrorHandler("Video lesson title already exists!", 400));
    }

    const titleSlug = videoLesson.title
      ? videoLesson.title.replace(/\s+/g, "_").toLowerCase()
      : "default_title";

    let uploadedVideo = {}, uploadedBanner = {}, uploadedThumbnail = {};
    const uploadPromises = [];

    if (req.files && req.files.video) {
      const videoPath = req.files.video[0].path;
      uploadPromises.push(
        uploadToCloudinary(videoPath, "lessons", `${titleSlug}_video`, "video").then(
          (result) => {
            uploadedVideo = result;
          }
        )
      );
    }

    if (req.files && req.files.banner) {
      const bannerPath = req.files.banner[0].path;
      uploadPromises.push(
        uploadToCloudinary(bannerPath, "lessons", `${titleSlug}_banner`).then(
          (result) => {
            uploadedBanner = result;
          }
        )
      );
    }

    if (req.files && req.files.thumbnail) {
      const thumbnailPath = req.files.thumbnail[0].path;
      uploadPromises.push(
        uploadToCloudinary(thumbnailPath, "lessons", `${titleSlug}_thumbnail`).then(
          (result) => {
            uploadedThumbnail = result;
          }
        )
      );
    }

    await Promise.all(uploadPromises);

    let hours = 0, minutes = 0, seconds = 0;
    if (uploadedVideo.duration) {
      const durationParts = uploadedVideo.duration.match(/(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
      if (durationParts) {
        hours = durationParts[1] ? parseInt(durationParts[1].replace('h', '')) : 0;
        minutes = durationParts[2] ? parseInt(durationParts[2].replace('m', '')) : 0;
        seconds = durationParts[3] ? parseInt(durationParts[3].replace('s', '')) : 0;
      }
    }

    const newVideoLesson = {
      ...videoLesson,
      video: uploadedVideo.public_id
        ? {
            public_id: uploadedVideo.public_id,
            url: uploadedVideo.url,
            duration: {
              hours,
              minutes,
              seconds,
            },
          }
        : undefined,
      banner: uploadedBanner.public_id ? uploadedBanner : undefined,
      thumbnail: uploadedThumbnail.public_id ? uploadedThumbnail : undefined,
      addedAt: new Date(),
    };

    lesson.videoLesson.push(newVideoLesson);

    await lesson.save();

    res.status(200).json({
      success: true,
      message: "New video lesson added successfully",
      lesson,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to update lesson", 500));
  }
};

exports.getAdminLessons = async (req, res, next) => {
    try {
      const lessons = await LessonModel.find().sort({ createdAt: -1 });
  
      const totalLessons = await LessonModel.countDocuments();
  
      res.status(200).json({
        success: true,
        totalLessons,
        lessons,
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      return next(new ErrorHandler(error.message || 'Failed to fetch lessons', 500));
    }
};

exports.getAdminSingleLesson = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const lesson = await LessonModel.findById(id);
  
      if (!lesson) {
        return next(new ErrorHandler("Lesson not found", 404));
      }
  
      return res.status(200).json({
        success: true,
        lesson
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message || "Error fetching course", 500));
    }
};

exports.getLessonsPublic = async (req, res, next) => {
    try {
      const lessons = await LessonModel.aggregate([
        { $match: { mainDelete: false } },
        { $unwind: '$videoLesson' },
        { $match: { 'videoLesson.visibility.status': 'public', 'videoLesson.softDelete': false } },
        {
          $group: {
            _id: '$_id',
            assignCourse: { $first: '$assignCourse' },
            uploadedBy: { $first: '$uploadedBy' },
            lessonTitle: { $first: '$lessonTitle' },
            videoLesson: { $push: '$videoLesson' },
            mainDelete: { $first: '$mainDelete' },
            createdAt: { $first: '$createdAt' }
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
  
      const totalLessons = await LessonModel.countDocuments({
        videoLesson: {
          $elemMatch: {
            'visibility.status': 'public',
            'softDelete': false
          }
        },
        mainDelete: false
      });
  
      res.status(200).json({
        success: true,
        totalLessons,
        lessons
      });
    } catch (error) {
      console.log('Error fetching lessons:', error);
      return next(new ErrorHandler(error.message || 'Failed to fetch lessons', 500));
    }
};

exports.getSingleLessonPublic = async (req, res, next) => {
    const { id } = req.params;
  
    try {

      const lesson = await LessonModel.findOne({
        _id: id,
        mainDelete: false,
        videoLesson: {
          $elemMatch: {
            'visibility.status': 'public',
            'softDelete': false
          }
        }
      })
      .populate('uploadedBy', 'firstname lastname role')
      .populate('assignCourse', 'title')
      .sort({ createdAt: -1 });
  
      if (!lesson) {
        return next(new ErrorHandler("Lesson not found or not publicly available", 404));
      }
  
      const filteredLessons = lesson.videoLesson.filter(
        lesson => lesson.visibility.status === 'public' && !lesson.softDelete
      );
  
      lesson.videoLesson = filteredLessons;
  
      return res.status(200).json({
        success: true,
        lesson
      });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      return next(new ErrorHandler(error.message || "Error fetching lesson", 500));
    }
};

exports.deactivateLessons = async (req, res, next) => {
    try {
        const { lessonIds } = req.body;
  
        if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of course IDs to deactivate.",
            });
        }
  
        // Deactivate courses
        const result = await LessonModel.updateMany(
            { _id: { $in: lessonIds } },
            { $set: { mainDelete: true } }
        );
  
        if (!result.matchedCount) {
            return res.status(404).json({
                success: false,
                message: "No lessons found with the provided IDs.",
            });
        }
  
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} lessons deactivated successfully!`,
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler("An error occurred while deactivating the lessons", 500));
    }
};
  
exports.reactivateCourses = async (req, res, next) => {
    try {
        const { lessonIds } = req.body;
  
        if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of lesson IDs to reactivate.",
            });
        }
  
        const result = await LessonModel.updateMany(
            { _id: { $in: lessonIds } },
            { $set: { mainDelete: false } }
        );
  
        if (!result.matchedCount) {
            return res.status(404).json({
                success: false,
                message: "No lessons found with the provided IDs.",
            });
        }
  
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} lessons reactivated successfully!`,
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler("An error occurred while reactivating the lessons", 500));
    }
};