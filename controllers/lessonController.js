const LessonModel = require("../models/lesson");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;
const fs = require("fs")
// const uploadToCloudinary = async (
//   filePath,
//   folder,
//   fileName,
//   resourceType = "image"
// ) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder,
//       public_id: fileName,
//       resource_type: resourceType,
//     });
//     return { public_id: result.public_id, url: result.secure_url };
//   } catch (error) {
//     throw new ErrorHandler(
//       `Error uploading ${fileName}: ${error.message}`,
//       500
//     );
//   }
// };


// exports.createLesson = async (req, res, next) => {
//   try {
//     const { lessonTitle, assignCourse, videoLesson } = req.body;
//     const uploadedBy = req.user.id;

//     const existingMainTitle = await LessonModel.findOne({ lessonTitle });
//     const existingVideoTitle = await LessonModel.findOne({ 
//         "videoLesson.title": videoLesson.title 
//     });

//     if (existingMainTitle && existingVideoTitle) {
//         return next(
//           new ErrorHandler("Lesson title and Video title already exist!", 400)
//         );
//       }
//     if (existingMainTitle) {
//         return next(new ErrorHandler("Lesson title already exists!", 400));
//     }
    
//     if (existingVideoTitle) {
//         return next(new ErrorHandler("Video lesson title already exists!", 400));
//     }
    

//     const titleSlug = videoLesson.title
//       ? videoLesson.title.replace(/\s+/g, "_").toLowerCase()
//       : "default_title";

//     let uploadedVideo, uploadedBanner, uploadedThumbnail;
//     const uploadPromises = [];

//     if (req.files && req.files.video) {
//       const videoPath = req.files.video[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(
//           videoPath,
//           "lessons",
//           `${titleSlug}_video`,
//           "video"
//         ).then((result) => {
//           uploadedVideo = result;
//         })
//       );
//     }

//     if (req.files && req.files.banner) {
//       const bannerPath = req.files.banner[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(bannerPath, "lessons", `${titleSlug}_banner`).then(
//           (result) => {
//             uploadedBanner = result;
//           }
//         )
//       );
//     }

//     if (req.files && req.files.thumbnail) {
//       const thumbnailPath = req.files.thumbnail[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(
//           thumbnailPath,
//           "lessons",
//           `${titleSlug}_thumbnail`
//         ).then((result) => {
//           uploadedThumbnail = result;
//         })
//       );
//     }

//     // Wait for all uploads to complete
//     await Promise.all(uploadPromises);

//     const newLesson = await LessonModel.create({
//       assignCourse,
//       uploadedBy,
//       lessonTitle,
//       videoLesson: [
//         {
//           ...videoLesson,
//           video: uploadedVideo,
//           banner: uploadedBanner,
//           thumbnail: uploadedThumbnail,
//         },
//       ],
//     });

//     res.status(201).json({
//       success: true,
//       lesson: newLesson,
//     });
//   } catch (error) {
//     console.log(error);
//     next(new ErrorHandler(error.message || "Error creating lesson", 500));
//   }
// };

const uploadToCloudinary = async (filePath, folder, fileName, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: fileName,
      resource_type: resourceType,
    });

    // Convert duration from seconds to hr:min:sec format if it's a video
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
      duration: durationFormatted  // Return the formatted duration
    };
  } catch (error) {
    throw new ErrorHandler(`Error uploading ${fileName}: ${error.message}`, 500);
  }
};

// exports.createLesson = async (req, res, next) => {
//   try {
//     const { lessonTitle, assignCourse, videoLesson } = req.body;
//     const uploadedBy = req.user.id;
    
//     // Check for existing lesson titles
//     const existingLesson = await LessonModel.findOne({ lessonTitle });
//     if (existingLesson) {
//       return next(new ErrorHandler("Lesson title already exists!", 400));
//     }

//     const existingVideoLesson = await LessonModel.findOne({
//       "videoLesson.title": videoLesson.title
//     });
//     if (existingVideoLesson) {
//       return next(new ErrorHandler("Video lesson title already exists!", 400));
//     }

//     const titleSlug = videoLesson.title ? videoLesson.title.replace(/\s+/g, '_').toLowerCase() : 'default_title';
    
//     // Handle media uploads
//     let uploadedVideo = {}, uploadedBanner = {}, uploadedThumbnail = {};
//     const uploadPromises = [];

//     if (req.files && req.files.video && req.files.video[0]) {
//       const videoPath = req.files.video[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(videoPath, "lessons", `${titleSlug}_video`, "video")
//           .then(result => { uploadedVideo = result; })
//       );
//     }

//     if (req.files && req.files.banner && req.files.banner[0]) {
//       const bannerPath = req.files.banner[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(bannerPath, "lessons", `${titleSlug}_banner`)
//           .then(result => { uploadedBanner = result; })
//       );
//     }

//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnailPath = req.files.thumbnail[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(thumbnailPath, "lessons", `${titleSlug}_thumbnail`)
//           .then(result => { uploadedThumbnail = result; })
//       );
//     }

//     // Wait for all uploads to complete
//     await Promise.all(uploadPromises);

//     // Parse the video duration string (e.g., "1h 20m 35s")
//     let hours = 0, minutes = 0, seconds = 0;
//     if (uploadedVideo.duration) {
//       const durationParts = uploadedVideo.duration.match(/(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
//       if (durationParts) {
//         hours = durationParts[1] ? parseInt(durationParts[1].replace('h', '')) : 0;
//         minutes = durationParts[2] ? parseInt(durationParts[2].replace('m', '')) : 0;
//         seconds = durationParts[3] ? parseInt(durationParts[3].replace('s', '')) : 0;
//       }
//     }

//     // Create the lesson document
//     const newLesson = await LessonModel.create({
//       assignCourse,
//       uploadedBy,
//       lessonTitle,
//       videoLesson: [{
//         ...videoLesson,
//         video: uploadedVideo.public_id ? {
//           public_id: uploadedVideo.public_id,
//           url: uploadedVideo.url,
//           duration: {
//             hours,
//             minutes,
//             seconds,
//           },
//         } : undefined,
//         banner: uploadedBanner.public_id ? uploadedBanner : undefined,
//         thumbnail: uploadedThumbnail.public_id ? uploadedThumbnail : undefined,
//       }],
//     });

//     res.status(201).json({
//       success: true,
//       lesson: newLesson,
//     });
//   } catch (error) {
//     console.log(error);
//     next(new ErrorHandler(error.message || "Error creating lesson", 500));
//   }
// };


//** with duration */
// exports.createLesson = async (req, res, next) => {
//   try {
//     const { lessonTitle, assignCourse, videoLesson } = req.body;
//     const uploadedBy = req.user.id;

//     // Check for existing lesson titles
//     const existingLesson = await LessonModel.findOne({ lessonTitle });
//     if (existingLesson) {
//       return next(new ErrorHandler("Lesson title already exists!", 400));
//     }

//     const existingVideoLesson = await LessonModel.findOne({
//       "videoLesson.title": videoLesson.title
//     });
//     if (existingVideoLesson) {
//       return next(new ErrorHandler("Video lesson title already exists!", 400));
//     }

//     const titleSlug = videoLesson.title ? videoLesson.title.replace(/\s+/g, '_').toLowerCase() : 'default_title';
    
//     // Handle media uploads
//     let uploadedVideo = {}, uploadedBanner = {}, uploadedThumbnail = {};
//     const uploadPromises = [];

//     if (req.files && req.files.video && req.files.video[0]) {
//       const videoPath = req.files.video[0].path;
//       uploadPromises.push(
//         cloudinary.uploader.upload(videoPath, {
//           resource_type: 'video',
//           folder: 'lessons',
//           eager: [
//             { streaming_profile: 'sd', format: 'm3u8' },
//             { streaming_profile: 'hd', format: 'm3u8' },
//             { streaming_profile: 'full_hd', format: 'm3u8' },
//             { streaming_profile: 'uhd', format: 'm3u8' }
//           ],
//           eager_async: true
//         })
//         .then(result => { uploadedVideo = result; })
//       );
//     }

//     if (req.files && req.files.banner && req.files.banner[0]) {
//       const bannerPath = req.files.banner[0].path;
//       uploadPromises.push(
//         cloudinary.uploader.upload(bannerPath, {
//           folder: 'lessons',
//           width: 150,
//           crop: 'scale',
//         })
//         .then(result => { uploadedBanner = result; })
//       );
//     }

//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnailPath = req.files.thumbnail[0].path;
//       uploadPromises.push(
//         cloudinary.uploader.upload(thumbnailPath, {
//           folder: 'lessons',
//           width: 150,
//           crop: 'scale',
//         })
//         .then(result => { uploadedThumbnail = result; })
//       );
//     }

//     // Wait for all uploads to complete
//     await Promise.all(uploadPromises);

//     // Poll Cloudinary to check if the HLS transformations are completed
//     let videoDetails;
//     let hlsUrl = null;
//     const maxRetries = 10;
//     const retryInterval = 5000;

//     for (let i = 0; i < maxRetries; i++) {
//       videoDetails = await cloudinary.api.resource(uploadedVideo.public_id, {
//         resource_type: 'video',
//       });

//       console.log('Video Details:', videoDetails); // Log video details for debugging

//       if (videoDetails.eager) {
//         hlsUrl = videoDetails.eager.find((format) => format.format === 'm3u8');
//       }

//       if (!hlsUrl && videoDetails.derived) {
//         hlsUrl = videoDetails.derived.find((format) => format.format === 'm3u8');
//       }

//       if (hlsUrl) {
//         break; // Exit the loop if HLS URL is found
//       }

//       await new Promise((resolve) => setTimeout(resolve, retryInterval)); // Wait before retrying
//     }

//     if (!hlsUrl) {
//       return next(new ErrorHandler('HLS stream URL not found.', 500));
//     }

//     // Convert duration string to seconds and then to hours, minutes, and seconds
//     let hours = 0, minutes = 0, seconds = 0;
//     if (uploadedVideo.duration) {
//       const durationSeconds = uploadedVideo.duration; // Assuming this is in seconds
//       hours = Math.floor(durationSeconds / 3600);
//       minutes = Math.floor((durationSeconds % 3600) / 60);
//       seconds = Math.floor(durationSeconds % 60);
//     }

//     // Create the lesson document
//     const newLesson = await LessonModel.create({
//       assignCourse,
//       uploadedBy,
//       lessonTitle,
//       videoLesson: [{
//         ...videoLesson,
//         video: {
//           public_id: uploadedVideo.public_id,
//           url: hlsUrl.secure_url, // Use the HLS URL here
//           duration: {
//             hours,
//             minutes,
//             seconds,
//           },
//         },
//         banner: uploadedBanner.public_id ? uploadedBanner : undefined,
//         thumbnail: uploadedThumbnail.public_id ? uploadedThumbnail : undefined,
//       }],
//     });

//     res.status(201).json({
//       success: true,
//       lesson: newLesson,
//     });

//     // Clean up temporary files if needed
//     fs.unlinkSync(req.files.video[0].path);
//     fs.unlinkSync(req.files.banner[0].path);
//     fs.unlinkSync(req.files.thumbnail[0].path);

//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler(error.message || "Error creating lesson", 500));
//   }
// };

// exports.updateLesson = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { videoLesson } = req.body;

//     let lesson = await LessonModel.findById(id);

//     if (!lesson) {
//         return next(new ErrorHandler("Lesson not found", 404));
//       }

//     const existingVideoTitle = await LessonModel.findOne({ 
//         "videoLesson.title": videoLesson.title 
//     });
    
//     if (existingVideoTitle) {
//         return next(new ErrorHandler("Video lesson title already exists!", 400));
//     }

//     const titleSlug = videoLesson.title
//       ? videoLesson.title.replace(/\s+/g, "_").toLowerCase()
//       : "default_title";

//     let uploadedVideo, uploadedBanner, uploadedThumbnail;
//     const uploadPromises = [];

//     if (req.files && req.files.video) {
//       const videoPath = req.files.video[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(
//           videoPath,
//           "lessons",
//           `${titleSlug}_video`,
//           "video"
//         ).then((result) => {
//           uploadedVideo = result;
//         })
//       );
//     }

//     if (req.files && req.files.banner) {
//       const bannerPath = req.files.banner[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(bannerPath, "lessons", `${titleSlug}_banner`).then(
//           (result) => {
//             uploadedBanner = result;
//           }
//         )
//       );
//     }

//     if (req.files && req.files.thumbnail) {
//       const thumbnailPath = req.files.thumbnail[0].path;
//       uploadPromises.push(
//         uploadToCloudinary(
//           thumbnailPath,
//           "lessons",
//           `${titleSlug}_thumbnail`
//         ).then((result) => {
//           uploadedThumbnail = result;
//         })
//       );
//     }

//     // Wait for all uploads to complete
//     await Promise.all(uploadPromises);

//     // Construct the new videoLesson object
//     const newVideoLesson = {
//       ...videoLesson,
//       video: uploadedVideo,
//       banner: uploadedBanner,
//       thumbnail: uploadedThumbnail,
//       addedAt: new Date(),
//     };

//     // Add the new video lesson to the existing array
//     lesson.videoLesson.push(newVideoLesson);

//     // Save the updated lesson
//     await lesson.save();

//     res.status(200).json({
//       success: true,
//       message: "New lesson added successfully",
//       lesson,
//     });
//   } catch (error) {
//     next(new ErrorHandler(error.message || "Failed to update lesson", 500));
//   }
// };


//** latest  */

// exports.createLesson = async (req, res, next) => {
//   try {
//     const { lessonTitle, assignCourse, videoLesson } = req.body;
//     const uploadedBy = req.user.id;

//     // Check for existing lesson titles
//     const existingLesson = await LessonModel.findOne({ lessonTitle });
//     if (existingLesson) {
//       return next(new ErrorHandler("Lesson title already exists!", 400));
//     }

//     const existingVideoLesson = await LessonModel.findOne({
//       "videoLesson.title": videoLesson.title
//     });
//     if (existingVideoLesson) {
//       return next(new ErrorHandler("Video lesson title already exists!", 400));
//     }

//     const titleSlug = videoLesson.title ? videoLesson.title.replace(/\s+/g, '_').toLowerCase() : 'default_title';
    
//     // Handle media uploads
//     let uploadedVideo = {}, uploadedBanner = {}, uploadedThumbnail = {};
//     const uploadPromises = [];

//     if (req.files && req.files.video && req.files.video[0]) {
//       const videoPath = req.files.video[0].path;
//       uploadPromises.push(
//         cloudinary.uploader.upload(videoPath, {
//           resource_type: 'video',
//           folder: 'lessons',
//           eager: [
//             { format: 'm3u8', streaming_profile: 'sd' },    // Standard definition (640x360)
//             { format: 'm3u8', streaming_profile: 'hd' },    // High definition (1280x720)
//             { format: 'm3u8', streaming_profile: 'full_hd' }, // Full HD (1920x1080)
//             { format: 'm3u8', streaming_profile: '4k' }     // Ultra High Definition (3840x2160)
//           ],
//           eager_async: true
//         })        
//         .then(result => { uploadedVideo = result; })
//         .catch(err => {
//           console.error("Error uploading video:", err);
//           throw new Error("Error uploading video");
//         })
//       );
//     }

//     if (req.files && req.files.banner && req.files.banner[0]) {
//       const bannerPath = req.files.banner[0].path;
//       uploadPromises.push(
//         cloudinary.uploader.upload(bannerPath, {
//           folder: 'lessons',
//           width: 150,
//           crop: 'scale',
//         })
//         .then(result => { uploadedBanner = result; })
//         .catch(err => {
//           console.error("Error uploading banner:", err);
//           throw new Error("Error uploading banner");
//         })
//       );
//     }

//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnailPath = req.files.thumbnail[0].path;
//       uploadPromises.push(
//         cloudinary.uploader.upload(thumbnailPath, {
//           folder: 'lessons',
//           width: 150,
//           crop: 'scale',
//         })
//         .then(result => { uploadedThumbnail = result; })
//         .catch(err => {
//           console.error("Error uploading thumbnail:", err);
//           throw new Error("Error uploading thumbnail");
//         })
//       );
//     }

//     // Wait for all uploads to complete
//     await Promise.all(uploadPromises);

//     // Poll Cloudinary to check if the HLS transformations are completed
//     let videoDetails;
//     let hlsUrl = null;
//     const maxRetries = 10;
//     const retryInterval = 5000;

//     for (let i = 0; i < maxRetries; i++) {
//       videoDetails = await cloudinary.api.resource(uploadedVideo.public_id, {
//         resource_type: 'video',
//       });

//       console.log('Video Details:', videoDetails); // Log video details for debugging

//       // Check if `eager` and `derived` exist before accessing them
//       if (videoDetails.eager) {
//         hlsUrl = videoDetails.eager.find((format) => format.format === 'm3u8');
//       }

//       if (!hlsUrl && videoDetails.derived) {
//         hlsUrl = videoDetails.derived.find((format) => format.format === 'm3u8');
//       }

//       if (hlsUrl) {
//         break; // Exit the loop if HLS URL is found
//       }

//       await new Promise((resolve) => setTimeout(resolve, retryInterval)); // Wait before retrying
//     }

//     if (!hlsUrl) {
//       return next(new ErrorHandler('HLS stream URL not found.', 500));
//     }

//     // Extract bandwidths and resolutions
//     const { bandwidths = [], resolutions = [] } = hlsUrl || {};

//     // Convert duration string to seconds and then to hours, minutes, and seconds
//     let hours = 0, minutes = 0, seconds = 0;
//     if (uploadedVideo.duration) {
//       const durationSeconds = uploadedVideo.duration; // Assuming this is in seconds
//       hours = Math.floor(durationSeconds / 3600);
//       minutes = Math.floor((durationSeconds % 3600) / 60);
//       seconds = Math.floor(durationSeconds % 60);
//     }

//     // Create the lesson document
//     const newLesson = await LessonModel.create({
//       assignCourse,
//       uploadedBy,
//       lessonTitle,
//       videoLesson: [{
//         ...videoLesson,
//         video: {
//           public_id: uploadedVideo.public_id,
//           url: hlsUrl.secure_url, // Use the HLS URL here
//           duration: {
//             hours,
//             minutes,
//             seconds,
//           },
//           bandwidths, // Use the extracted bandwidths
//           resolutions // Use the extracted resolutions
//         },
//         banner: uploadedBanner.public_id ? uploadedBanner : undefined,
//         thumbnail: uploadedThumbnail.public_id ? uploadedThumbnail : undefined,
//       }],
//     });

//     res.status(201).json({
//       success: true,
//       lesson: newLesson,
//     });

//     // Clean up temporary files if needed
//     if (req.files.video) fs.unlinkSync(req.files.video[0].path);
//     if (req.files.banner) fs.unlinkSync(req.files.banner[0].path);
//     if (req.files.thumbnail) fs.unlinkSync(req.files.thumbnail[0].path);

//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler(error.message || "Error creating lesson", 500));
//   }
// };




//** working as of sept 12 */
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


//** without duration saving video into m3u8 format */
// exports.createLesson = async (req, res, next) => {
//   try {
//     const { lessonTitle, assignCourse, videoLesson } = req.body;
//     const uploadedBy = req.user.id;

//     const existingLesson = await LessonModel.findOne({ lessonTitle });
//     if (existingLesson) {
//       return next(new ErrorHandler("Lesson title already exists!", 400));
//     }

//     const existingVideoLesson = await LessonModel.findOne({
//       "videoLesson.title": videoLesson.title
//     });
//     if (existingVideoLesson) {
//       return next(new ErrorHandler("Video lesson title already exists!", 400));
//     }

//     if (!req.files || !req.files.video || !req.files.video[0]) {
//       throw new Error('No video file provided');
//     }

//     const videoUploadResult = await cloudinary.uploader.upload(req.files.video[0].path, {
//       resource_type: 'video',
//       folder: 'lessons',
//       format: 'm3u8',
//       transformation: [
//         { width: 640, height: 360, crop: 'scale', bitrate: 800, audio_codec: 'aac', format: 'm3u8' },
//         { width: 842, height: 480, crop: 'scale', bitrate: 1400, audio_codec: 'aac', format: 'm3u8' },
//         { width: 1280, height: 720, crop: 'scale', bitrate: 2800, audio_codec: 'aac', format: 'm3u8' }, 
//         { width: 1920, height: 1080, crop: 'scale', bitrate: 5000, audio_codec: 'aac', format: 'm3u8' } 
//       ]
//     });

//     const videoUrl = videoUploadResult.secure_url; 

//     let uploadedBanner = {}, uploadedThumbnail = {};

//     if (req.files && req.files.banner && req.files.banner[0]) {
//       const bannerUploadResult = await cloudinary.uploader.upload(req.files.banner[0].path, {
//         folder: 'lessons',
//         width: 150,
//         crop: 'scale',
//       });
//       uploadedBanner = bannerUploadResult;
//     }

//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnailUploadResult = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
//         folder: 'lessons',
//         width: 150,
//         crop: 'scale',
//       });
//       uploadedThumbnail = thumbnailUploadResult;
//     }

//     let hours = 0, minutes = 0, seconds = 0;
//     if (uploadedVideo.duration) {
//       const durationParts = uploadedVideo.duration.match(/(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
//       if (durationParts) {
//         hours = durationParts[1] ? parseInt(durationParts[1].replace('h', '')) : 0;
//         minutes = durationParts[2] ? parseInt(durationParts[2].replace('m', '')) : 0;
//         seconds = durationParts[3] ? parseInt(durationParts[3].replace('s', '')) : 0;
//       }
//     }

//     const newLesson = await LessonModel.create({
//       assignCourse,
//       uploadedBy,
//       lessonTitle,
//       videoLesson: [{
//         ...videoLesson,
//         video: {
//           public_id: videoUploadResult.public_id,
//           url: videoUrl,
//         },
//         banner: uploadedBanner.public_id ? uploadedBanner : undefined,
//         thumbnail: uploadedThumbnail.public_id ? uploadedThumbnail : undefined,
//       }],
//     });

//     res.status(201).json({
//       success: true,
//       lesson: newLesson,
//     });

//   } catch (error) {
//     console.error(error);
//     next(new ErrorHandler(error.message || "Error creating lesson", 500));
//   }
// }


exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { videoLesson } = req.body;

    // Find the lesson by ID
    let lesson = await LessonModel.findById(id);

    if (!lesson) {
      return next(new ErrorHandler("Lesson not found", 404));
    }

    // Check for existing video lesson title
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

    // Handle video upload
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

    // Handle banner upload
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

    // Handle thumbnail upload
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

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    // Parse the video duration string (e.g., "1h 20m 35s")
    let hours = 0, minutes = 0, seconds = 0;
    if (uploadedVideo.duration) {
      const durationParts = uploadedVideo.duration.match(/(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
      if (durationParts) {
        hours = durationParts[1] ? parseInt(durationParts[1].replace('h', '')) : 0;
        minutes = durationParts[2] ? parseInt(durationParts[2].replace('m', '')) : 0;
        seconds = durationParts[3] ? parseInt(durationParts[3].replace('s', '')) : 0;
      }
    }

    // Construct the new videoLesson object
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

    // Add the new video lesson to the existing array
    lesson.videoLesson.push(newVideoLesson);

    // Save the updated lesson
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
      // Find the lesson based on conditions
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
  
      // If no lesson is found
      if (!lesson) {
        return next(new ErrorHandler("Lesson not found or not publicly available", 404));
      }
  
      // Filter video lessons to only include public and non-soft-deleted ones
      const filteredLessons = lesson.videoLesson.filter(
        lesson => lesson.visibility.status === 'public' && !lesson.softDelete
      );
  
      // Overwrite the lesson's videoLesson array with the filtered lessons
      lesson.videoLesson = filteredLessons;
  
      // Send the response with the filtered lesson
      return res.status(200).json({
        success: true,
        lesson
      });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      return next(new ErrorHandler(error.message || "Error fetching lesson", 500));
    }
};

// exports.getSingleLessonPublic = async (req, res, next) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   try {
//     // Find the lesson and course it's part of
//     const lesson = await LessonModel.findOne({
//       _id: id,
//       mainDelete: false,
//       videoLesson: {
//         $elemMatch: {
//           'visibility.status': 'public',
//           'softDelete': false
//         }
//       }
//     })
//     .populate('uploadedBy', 'firstname lastname role')
//     .populate('assignCourse', 'title')
//     .sort({ createdAt: -1 });

//     if (!lesson) {
//       return next(new ErrorHandler("Lesson not found or not publicly available", 404));
//     }

//     // Get all lessons in the course
//     const allLessons = await LessonModel.find({ 
//       assignCourse: lesson.assignCourse._id,
//       mainDelete: false
//     }).sort({ createdAt: 1 });

//     // Find the index of the current lesson in the course
//     const currentLessonIndex = allLessons.findIndex(l => l._id.toString() === id);

//     if (currentLessonIndex === -1) {
//       return next(new ErrorHandler("Lesson is not part of the course", 404));
//     }

//     // Fetch user's progress for the entire course
//     const courseProgress = await ProgressModel.findOne({ 
//       userId, 
//       courseId: lesson.assignCourse._id 
//     });

//     if (!courseProgress) {
//       return res.status(403).json({
//         success: false,
//         message: `You need to start and complete the previous lesson before accessing "${lesson.lessonTitle}".`,
//       });
//     }

//     // Ensure the current lesson is accessible based on previous lessons
//     if (currentLessonIndex > 0) {
//       const previousLesson = allLessons[currentLessonIndex - 1];
//       const previousLessonProgress = await ProgressModel.findOne({ 
//         userId, 
//         lessonId: previousLesson._id 
//       });

//       if (!previousLessonProgress || !previousLessonProgress.watchCompleted) {
//         return res.status(403).json({
//           success: false,
//           message: `You need to complete "${previousLesson.lessonTitle}" before accessing this lesson.`,
//         });
//       }
//     }

//     // Fetch user's progress for the current lesson
//     let progress = await ProgressModel.findOne({ userId, lessonId: id });

//     if (!progress) {
//       progress = new ProgressModel({
//         userId,
//         lessonId: id,
//         videoProgress: []
//       });
//       await progress.save(); // Save the new progress record
//     }

//     // Filter video lessons to only include public and non-soft-deleted ones
//     const filteredLessons = lesson.videoLesson.filter(
//       videoLesson => videoLesson.visibility.status === 'public' && !videoLesson.softDelete
//     );

//     // Check progress for each video lesson
//     const updatedLessons = filteredLessons.map((videoLesson, index) => {
//       // Check if the current lesson is accessible
//       if (index > 0) {
//         const previousVideoId = filteredLessons[index - 1]._id.toString();
//         const previousProgressEntry = progress.videoProgress.find(vp => vp.videoLessonId.toString() === previousVideoId);

//         // Check if previous video is completed
//         if (!previousProgressEntry || !previousProgressEntry.isFinished) {
//           // Hide the video lesson if the previous one is not finished
//           return null; // Skip adding this videoLesson to the list
//         }
//       }

//       return videoLesson;
//     }).filter(Boolean); // Remove any null entries

//     // Overwrite the lesson's videoLesson array with the updated lessons
//     lesson.videoLesson = updatedLessons;

//     return res.status(200).json({
//       success: true,
//       lesson
//     });
//   } catch (error) {
//     console.error('Error fetching lesson:', error);
//     return next(new ErrorHandler(error.message || "Error fetching lesson", 500));
//   }
// };



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