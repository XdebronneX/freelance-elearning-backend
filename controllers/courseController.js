const CourseModel = require("../models/course");
const UserModel = require("../models/user")
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;
const moment = require("moment");

exports.createCourse = async (req, res, next) => {
  try {

      const existingTitle = await CourseModel.findOne({ title: req.body.title });
      if (existingTitle) {
          return next(new ErrorHandler("Title already exists!", 400));
      }

      if (!req.files || !req.files.banner || !req.files.trailer) {
          return next(new ErrorHandler("Missing required parameter - file", 400));
      }

      const { title, description, author, visibility, conditions } = req.body;
      const madeBy = req.user.id;

      const fileName = title.replace(/[^a-zA-Z0-9]/g, '_');

      // Upload banner image
      const bannerResult = await cloudinary.uploader.upload(req.files.banner[0].path, {
          folder: `courses`,
          public_id: `banner_${fileName}`,
          width: 150,
          crop: 'scale'
      });

      // Upload trailer video
      const trailerResult = await cloudinary.uploader.upload(req.files.trailer[0].path, {
          resource_type: "video",
          folder: `courses`,
          public_id: `trailer_${fileName}`,
          crop: 'fit'
      });

      // Upload file (pdf)
      let workbookResult;
      if (req.files.workBook) {
          workbookResult = await cloudinary.uploader.upload(req.files.workBook[0].path, {
              resource_type: "raw",
              folder: `courses`, 
              public_id: `workbook_${fileName}` 
          });
      }

      const courseData = {
          title,
          description,
          author,
          madeBy,
          visibility,
          conditions,
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

      // Create a new course
      const newCourse = await CourseModel.create(courseData);

      // Send success response
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

    // Check if the course exists
    const course = await CourseModel.findById(id);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    // Prevent updating the title if it's a duplicate
    if (req.body.title && req.body.title !== course.title) {
      const existingTitle = await CourseModel.findOne({ title: req.body.title });
      if (existingTitle) {
        return next(new ErrorHandler("Title already exists!", 400));
      }
    }

    // Fields to update
    const { title, description, author, visibility, conditions } = req.body;

    const fileName = title.replace(/[^a-zA-Z0-9]/g, '_');

    // Handling banner file update
    if (req.files && req.files.banner) {
      // Delete old banner if it exists
      if (course.banner.public_id) {
        await cloudinary.uploader.destroy(course.banner.public_id);
      }

      // Upload new banner
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

    // Handling trailer file update
    if (req.files && req.files.trailer) {
      // Delete old trailer if it exists
      if (course.trailer.public_id) {
        await cloudinary.uploader.destroy(course.trailer.public_id, { resource_type: "video" });
      }

      // Upload new trailer
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

    // Handling workbook update (optional)
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

    // Update the course fields
    course.title = title || course.title;
    course.description = description || course.description;
    course.author = author || course.author;
    course.visibility = visibility || course.visibility;
    course.conditions = conditions || course.conditions;

    // Save the updated course
    await course.save();

    // Send success response
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

    // Fetch all public courses
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

exports.getSingleCoursePublic = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {

    const course = await CourseModel.findOne({ _id: id, 'visibility.status': 'public', softDelete: false })
      .populate('madeBy', 'firstname lastname role')
      .sort({ createdAt: -1 });

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

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

    // Return the single course as a response
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
