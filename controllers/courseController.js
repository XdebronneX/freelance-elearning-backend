const CourseModel = require("../models/course");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;


exports.createCourse = async (req, res, next) => {
    try {

      const existingTitle = await CourseModel.findOne({ title: req.body.title });
      if (existingTitle) {
        return next(new ErrorHandler("Title already exists!", 400));
      }

      if (!req.files || !req.files.banner || !req.files.trailer) {
        return next(new ErrorHandler("Missing required parameter - file", 400));
      }

      const { title, description, author, visibility } = req.body;
      const madeBy = req.user.id;
  
      const bannerResult = await cloudinary.uploader.upload(req.files.banner[0].path, {
        folder: 'courses',
        width: 150,
        crop: 'scale'
      });
  
      const trailerResult = await cloudinary.uploader.upload(req.files.trailer[0].path, {
        resource_type: "video",
        folder: 'courses',
        crop: 'fit'
      });
  
      const courseData = {
        title,
        description,
        author,
        madeBy,
        visibility,
        trailer: {
          public_id: trailerResult.public_id,
          url: trailerResult.secure_url,
        },
        banner: {
          public_id: bannerResult.public_id,
          url: bannerResult.secure_url,
        },
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

exports.getCoursesPublic = async (req, res, next) => {
  try {

    const courses = await CourseModel.find({ 'visibility.status': 'public', softDelete: false })
      .populate('madeBy', 'firstname lastname role')
      .sort({ createdAt: -1 });

    const totalCourses = await CourseModel.countDocuments({ 'visibility.status': 'public', softDelete: false });

    res.status(200).json({
      success: true,
      totalCourses,
      courses,
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

exports.getSingleCourse = async (req, res, next) => {
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

exports.deactivateCourse = async (req, res, next) => {
    try {
      const course = await CourseModel.findByIdAndUpdate(
        req.params.id,
        { softDelete: true },
        { new: true }
      );
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Deactivated Success!",
        course,
      });
    } catch (error) {
      console.log(error);
      return next(
        new ErrorHandler("An error occurred while disabling the course", 500)
      );
    }
};

exports.reactivateCourse = async (req, res, next) => {
    try {
      const course = await CourseModel.findByIdAndUpdate(
        req.params.id,
        { softDelete: false },
        { new: true }
      );
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Reactivate Success!",
        course,
      });
    } catch (error) {
      console.log(error);
      return next(
        new ErrorHandler("An error occurred while disabling the course", 500)
      );
    }
};