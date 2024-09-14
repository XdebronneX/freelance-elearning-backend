const ProgressModel = require("../models/progress");
const CourseModel = require("../models/course");
const LessonModel = require("../models/lesson");
const UserModel = require("../models/user")
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;
const moment = require("moment");
const https = require('https');
const NotificationModel = require("../models/notification")

// exports.createCourse = async (req, res, next) => {
//   try {

//       const existingTitle = await CourseModel.findOne({ title: req.body.title });
//       if (existingTitle) {
//           return next(new ErrorHandler("Title already exists!", 400));
//       }

//       if (!req.files || !req.files.banner || !req.files.trailer) {
//           return next(new ErrorHandler("Missing required parameter - file", 400));
//       }

//       const { title, description, author, visibility, conditions } = req.body;
//       const madeBy = req.user.id;

//       const fileName = title.replace(/[^a-zA-Z0-9]/g, '_');

//       const bannerResult = await cloudinary.uploader.upload(req.files.banner[0].path, {
//           folder: `courses`,
//           public_id: `banner_${fileName}`,
//           width: 150,
//           crop: 'scale'
//       });

//       const trailerResult = await cloudinary.uploader.upload(req.files.trailer[0].path, {
//           resource_type: "video",
//           folder: `courses`,
//           public_id: `trailer_${fileName}`,
//           crop: 'fit'
//       });

//       let workbookResult;
//       if (req.files.workBook) {
//           workbookResult = await cloudinary.uploader.upload(req.files.workBook[0].path, {
//               resource_type: "raw",
//               folder: `courses`, 
//               public_id: `workbook_${fileName}` 
//           });
//       }

//       const courseData = {
//           title,
//           description,
//           author,
//           madeBy,
//           visibility,
//           conditions,
//           trailer: {
//               public_id: trailerResult.public_id,
//               url: trailerResult.secure_url,
//           },
//           banner: {
//               public_id: bannerResult.public_id,
//               url: bannerResult.secure_url,
//           },
//           workBook: workbookResult ? workbookResult.secure_url : undefined,
//       };

//       const newCourse = await CourseModel.create(courseData);

//       res.status(201).json({
//           success: true,
//           newCourse,
//       });
//   } catch (error) {
//       console.error('Error creating course:', error);
//       return next(new ErrorHandler(error.message || "Failed to create course", 500));
//   }
// };

exports.createCourse = async (req, res, next) => {
  try {
    // Check if the course title already exists
    const existingTitle = await CourseModel.findOne({ title: req.body.title });
    if (existingTitle) {
      return next(new ErrorHandler("Title already exists!", 400));
    }

    // Check for required files (banner and trailer)
    if (!req.files || !req.files.banner || !req.files.trailer) {
      return next(new ErrorHandler("Missing required parameter - file", 400));
    }

    const { title, description, author, visibility, conditions } = req.body;
    const madeBy = req.user.id;

    const fileName = title.replace(/[^a-zA-Z0-9]/g, '_');

    // Upload the banner to Cloudinary
    const bannerResult = await cloudinary.uploader.upload(req.files.banner[0].path, {
      folder: `courses`,
      public_id: `banner_${fileName}`,
      width: 150,
      crop: 'scale',
    });

    // Upload the trailer to Cloudinary
    const trailerResult = await cloudinary.uploader.upload(req.files.trailer[0].path, {
      resource_type: "video",
      folder: `courses`,
      public_id: `trailer_${fileName}`,
      crop: 'fit',
    });

    let workbookResult;
    if (req.files.workBook) {
      // Upload workbook if it exists
      workbookResult = await cloudinary.uploader.upload(req.files.workBook[0].path, {
        resource_type: "raw",
        folder: `courses`, 
        public_id: `workbook_${fileName}`, 
      });
    }

    // Create the course data object
    const courseData = {
      title,
      description,
      author,
      madeBy,
      visibility,
      conditions: conditions || {}, // Optional conditions field
      trailer: {
        public_id: trailerResult.public_id,
        url: trailerResult.secure_url,
      },
      banner: {
        public_id: bannerResult.public_id,
        url: bannerResult.secure_url,
      },
      workBook: workbookResult ? workbookResult.secure_url : undefined,
    };

    // Create the new course
    const newCourse = await CourseModel.create(courseData);

    res.status(201).json({
      success: true,
      newCourse,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return next(new ErrorHandler(error.message || "Failed to create course", 500));
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await CourseModel.findById(id);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    if (req.body.title && req.body.title !== course.title) {
      const existingTitle = await CourseModel.findOne({ title: req.body.title });
      if (existingTitle) {
        return next(new ErrorHandler("Title already exists!", 400));
      }
    }

    const { title, description, author, visibility, conditions } = req.body;

    const fileName = title.replace(/[^a-zA-Z0-9]/g, '_');

    if (req.files && req.files.banner) {
      if (course.banner.public_id) {
        await cloudinary.uploader.destroy(course.banner.public_id);
      }

      const bannerResult = await cloudinary.uploader.upload(req.files.banner[0].path, {
        folder: `courses`,
        public_id: `banner_${fileName}`,
        width: 150,
        crop: 'scale',
      });

      course.banner = {
        public_id: bannerResult.public_id,
        url: bannerResult.secure_url,
      };
    }

    if (req.files && req.files.trailer) {
      if (course.trailer.public_id) {
        await cloudinary.uploader.destroy(course.trailer.public_id, { resource_type: "video" });
      }

      const trailerResult = await cloudinary.uploader.upload(req.files.trailer[0].path, {
        resource_type: "video",
        folder: `courses`,
        public_id: `trailer_${fileName}`,
        crop: 'fit',
      });

      course.trailer = {
        public_id: trailerResult.public_id,
        url: trailerResult.secure_url,
      };
    }

    if (req.files && req.files.workBook) {
      if (course.workBook) {
        await cloudinary.uploader.destroy(course.workBook, { resource_type: "raw" });
      }

      const workbookResult = await cloudinary.uploader.upload(req.files.workBook[0].path, {
        resource_type: "raw",
        folder: `courses`,
        public_id: `workbook_${fileName}`,
      });

      course.workBook = workbookResult.secure_url;
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.author = author || course.author;
    course.visibility = visibility || course.visibility;
    course.conditions = conditions || course.conditions;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return next(new ErrorHandler(error.message || "Failed to update course", 500));
  }
};

exports.getCoursesPublic = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const courses = await CourseModel.find({ 'visibility.status': 'public', softDelete: false })
      .populate('madeBy', 'firstname lastname role')
      .sort({ createdAt: -1 });

    const totalCourses = await CourseModel.countDocuments({ 'visibility.status': 'public', softDelete: false });

    // Add countdown to each course
    const coursesWithCountdown = await Promise.all(courses.map(async (course) => {
      const conditions = course.conditions || {};
      const { subscribeMonths } = conditions;

      if (subscribeMonths) {
        const user = await UserModel.findById(userId);

        if (!user) {
          return next(new ErrorHandler("User not found", 404));
        }

        const userCreatedAt = moment(user.createdAt);
        const currentDate = moment();
        const monthsSinceCreation = currentDate.diff(userCreatedAt, 'months');

        // Calculate the required end date to view the course
        const requiredDate = userCreatedAt.add(subscribeMonths, 'months');
        const daysLeft = requiredDate.diff(currentDate, 'days');
        
        // If the user is not eligible to view the course, calculate the countdown
        if (monthsSinceCreation < subscribeMonths) {
          const countdown = {
            days: Math.max(daysLeft, 0),
            hours: Math.max(requiredDate.diff(currentDate, 'hours') % 24, 0),
            minutes: Math.max(requiredDate.diff(currentDate, 'minutes') % 60, 0),
            seconds: Math.max(requiredDate.diff(currentDate, 'seconds') % 60, 0)
          };

          return {
            ...course._doc,
            countdown
          };
        }
      }

      // No countdown needed or user meets the conditions
      return course;
    }));

    res.status(200).json({
      success: true,
      totalCourses,
      courses: coursesWithCountdown,
    });
  } catch (error) {
    console.log('Error fetching courses:', error);
    return next(new ErrorHandler(error.message || 'Failed to fetch courses', 500));
  }
};


exports.getAdminCourses = async (req, res, next) => {
  try {
    const courses = await CourseModel.find()
      .populate('madeBy', 'firstname lastname role')
      .sort({ createdAt: -1 });

    const totalCourses = await CourseModel.countDocuments();

    // Return the formatted responsed
    res.status(200).json({
      success: true,
      totalCourses,
      courses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return next(new ErrorHandler(error.message || 'Failed to fetch courses', 500));
  }
};

exports.getAdminSingleCourse = async (req, res, next) => {
  const { id } = req.params;

  try {
    const course = await CourseModel.findById(id).populate("madeBy", "firstname lastname");

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    return res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message || "Error fetching course", 500));
  }
};

// exports.getSingleCoursePublic = async (req, res, next) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   try {

//     const course = await CourseModel.findOne({ _id: id, 'visibility.status': 'public', softDelete: false })
//       .populate('madeBy', 'firstname lastname role')
//       .sort({ createdAt: -1 });

//     if (!course) {
//       return next(new ErrorHandler("Course not found", 404));
//     }

//     const conditions = course.conditions || {};
//     const { subscribeMonths } = conditions;

//     if (subscribeMonths) {
//       const user = await UserModel.findById(userId); 

//       if (!user) {
//         return next(new ErrorHandler("User not found", 404));
//       }

//       const userCreatedAt = moment(user.createdAt);
//       const currentDate = moment();
//       const monthsSinceCreation = currentDate.diff(userCreatedAt, 'months');

//       if (monthsSinceCreation < subscribeMonths) {
//         const requiredDate = userCreatedAt.clone().add(subscribeMonths, 'months');
//         const daysLeft = requiredDate.diff(currentDate, 'days');
//         const hoursLeft = requiredDate.diff(currentDate, 'hours') % 24;
//         const minutesLeft = requiredDate.diff(currentDate, 'minutes') % 60;
//         const secondsLeft = requiredDate.diff(currentDate, 'seconds') % 60;

//         const countdownMessage = `Unlock in ${daysLeft} day(s), ${hoursLeft} hour(s), ${minutesLeft} minute(s), ${secondsLeft} second(s)`;

//         return res.status(403).json({
//           success: false,
//           message: countdownMessage,
//         });
//       }
//     }

//     // Return the single course as a response
//     return res.status(200).json({
//       success: true,
//       course
//     });
//   } catch (error) {
//     console.log(error);
//     return next(new ErrorHandler(error.message || "Error fetching course", 500));
//   }
// };


//** old code  */
// exports.getSingleCoursePublic = async (req, res, next) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   try {
//     // Fetch the course with the required fields and populated references
//     const course = await CourseModel.findOne({ _id: id, 'visibility.status': 'public', softDelete: false })
//       .populate('madeBy', 'firstname lastname role')
//       .sort({ createdAt: -1 });

//     if (!course) {
//       return next(new ErrorHandler("Course not found", 404));
//     }

//     const conditions = course.conditions || {};
//     const { subscribeMonths, requiredFinish } = conditions;

//     if (requiredFinish) {
//       const requiredCourse = await CourseModel.findById(requiredFinish.courseAssign);
//       if (!requiredCourse) {
//         return next(new ErrorHandler("Required finish course not found", 404));
//       }

//       // Check if the user has completed the required course
//       const userProgress = await ProgressModel.findOne({ userId, lessonId: { $in: (await LessonModel.find({ assignCourse: requiredFinish.courseAssign })).map(lesson => lesson._id) } });

//       if (!userProgress) {
//         return next(new ErrorHandler("User progress not found", 404));
//       }

//       const isRequiredCourseCompleted = userProgress.watchCompleted;

//       if (!isRequiredCourseCompleted) {
//         return res.status(403).json({
//           success: false,
//           message: `Finish "${requiredCourse.title}" to unlock this course`,
//         });
//       }
//     }

//     // Handle subscription months logic
//     if (subscribeMonths) {
//       const user = await UserModel.findById(userId); 

//       if (!user) {
//         return next(new ErrorHandler("User not found", 404));
//       }

//       const userCreatedAt = moment(user.createdAt);
//       const currentDate = moment();
//       const monthsSinceCreation = currentDate.diff(userCreatedAt, 'months');

//       if (monthsSinceCreation < subscribeMonths) {
//         const requiredDate = userCreatedAt.clone().add(subscribeMonths, 'months');
//         const daysLeft = requiredDate.diff(currentDate, 'days');
//         const hoursLeft = requiredDate.diff(currentDate, 'hours') % 24;
//         const minutesLeft = requiredDate.diff(currentDate, 'minutes') % 60;
//         const secondsLeft = requiredDate.diff(currentDate, 'seconds') % 60;

//         const countdownMessage = `Unlock in ${daysLeft} day(s), ${hoursLeft} hour(s), ${minutesLeft} minute(s), ${secondsLeft} second(s)`;

//         return res.status(403).json({
//           success: false,
//           message: countdownMessage,
//         });
//       }
//     }

//     // Return the single course as a response
//     return res.status(200).json({
//       success: true,
//       course
//     });
//   } catch (error) {
//     console.log(error);
//     return next(new ErrorHandler(error.message || "Error fetching course", 500));
//   }
// };


exports.getSingleCoursePublic = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Fetch the course with the required fields and populated references
    const course = await CourseModel.findOne({
      _id: id,
      'visibility.status': 'public',
      softDelete: false
    })
      .populate('madeBy', 'firstname lastname role')
      .sort({ createdAt: -1 });

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    const conditions = course.conditions || {};
    const { subscribeMonths, requiredFinish } = conditions;

    // Check if there's a requiredFinish condition
    if (requiredFinish && requiredFinish.courseAssign) {
      const requiredCourse = await CourseModel.findById(requiredFinish.courseAssign);
      if (!requiredCourse) {
        return next(new ErrorHandler("Required finish course not found", 404));
      }

      // Check if the user has completed the required course
      const userProgress = await ProgressModel.findOne({
        userId,
        lessonId: { $in: (await LessonModel.find({ assignCourse: requiredFinish.courseAssign })).map(lesson => lesson._id) }
      });

      if (!userProgress) {
        return next(new ErrorHandler("User progress not found", 404));
      }

      const isRequiredCourseCompleted = userProgress.watchCompleted;

      if (!isRequiredCourseCompleted) {
        return res.status(403).json({
          success: false,
          message: `Finish "${requiredCourse.title}" to unlock this course`,
        });
      }
    }

    // Check for subscribeMonths condition
    if (subscribeMonths) {
      const user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const userCreatedAt = moment(user.createdAt);
      const currentDate = moment();
      const monthsSinceCreation = currentDate.diff(userCreatedAt, 'months');

      if (monthsSinceCreation < subscribeMonths) {
        const requiredDate = userCreatedAt.clone().add(subscribeMonths, 'months');
        const daysLeft = requiredDate.diff(currentDate, 'days');
        const hoursLeft = requiredDate.diff(currentDate, 'hours') % 24;
        const minutesLeft = requiredDate.diff(currentDate, 'minutes') % 60;
        const secondsLeft = requiredDate.diff(currentDate, 'seconds') % 60;

        const countdownMessage = `Unlock in ${daysLeft} day(s), ${hoursLeft} hour(s), ${minutesLeft} minute(s), ${secondsLeft} second(s)`;

        return res.status(403).json({
          success: false,
          message: countdownMessage,
        });
      }
    }

    return res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message || "Error fetching course", 500));
  }
};


exports.deactivateCourses = async (req, res, next) => {
  try {
      const { courseIds } = req.body;

      // Ensure courseIds is an array and has elements
      if (!Array.isArray(courseIds) || courseIds.length === 0) {
          return res.status(400).json({
              success: false,
              message: "Please provide an array of course IDs to deactivate.",
          });
      }

      // Deactivate courses
      const result = await CourseModel.updateMany(
          { _id: { $in: courseIds } },
          { $set: { softDelete: true } }
      );

      if (!result.matchedCount) {
          return res.status(404).json({
              success: false,
              message: "No courses found with the provided IDs.",
          });
      }

      res.status(200).json({
          success: true,
          message: `${result.modifiedCount} courses deactivated successfully!`,
      });
  } catch (error) {
      console.log(error);
      return next(new ErrorHandler("An error occurred while deactivating the courses", 500));
  }
};

exports.reactivateCourses = async (req, res, next) => {
  try {
      const { courseIds } = req.body;

      if (!Array.isArray(courseIds) || courseIds.length === 0) {
          return res.status(400).json({
              success: false,
              message: "Please provide an array of course IDs to reactivate.",
          });
      }

      const result = await CourseModel.updateMany(
          { _id: { $in: courseIds } },
          { $set: { softDelete: false } }
      );

      if (!result.matchedCount) {
          return res.status(404).json({
              success: false,
              message: "No courses found with the provided IDs.",
          });
      }

      res.status(200).json({
          success: true,
          message: `${result.modifiedCount} courses reactivated successfully!`,
      });
  } catch (error) {
      console.log(error);
      return next(new ErrorHandler("An error occurred while reactivating the courses", 500));
  }
};

//** with  https*/
exports.downloadworkBook = async (req, res, next) => {
  const { id } = req.params;
  try {

    const course = await CourseModel.findById(id);

    if (!course || !course.workBook) {
      return next(new ErrorHandler("Workbook not found", 404));
    }

    const fileUrl = course.workBook;
    const fileName = `workbook_${course.title}.pdf`; 

    course.totalDownload += 1;

    let notification = new NotificationModel({
      // user: req.user.id,
      user: null,
      action: `Downloaded workbook for course ${course.title}`,
    });

    await course.save();
    await notification.save();

    https.get(fileUrl, (fileRes) => {
      if (fileRes.statusCode !== 200) {
        return next(new ErrorHandler("Failed to download the workbook", 500));
      }

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/pdf');

      fileRes.pipe(res);

    }).on('error', (err) => {
      console.log('Download error:', err);
      return next(new ErrorHandler("Error downloading the workbook", 500));
    });

  } catch (error) {
    console.log('Internal server error:', error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

/** without https */
// exports.downloadworkBook = async (req, res, next) => {
//   const { id } = req.params;

//   try {

//     const course = await CourseModel.findById(id);

//     if (!course || !course.workBook) {
//       return next(new ErrorHandler("Workbook not found", 404));
//     }

//     const fileUrl = course.workBook;

//     course.totalDownload += 1;

//     let notification = new NotificationModel({
//       user: req.user.id,
//       action: `Downloaded workbook for course ${course.title}`,
//     });

//     await course.save();
//     await notification.save();

//     res.setHeader('Content-Disposition', `attachment; filename="workbook_${course.title}.pdf"`);
//     res.redirect(fileUrl);

//   } catch (error) {
//     console.log('Internal server error:', error);
//     return next(new ErrorHandler("Internal server error", 500));
//   }
// };
