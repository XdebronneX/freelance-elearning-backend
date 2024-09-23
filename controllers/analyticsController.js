const UserModel = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const NotificationModel = require("../models/notification")

exports.getAllStudents = async (req, res, next) => {
  try {
    const totalStudents = await UserModel.countDocuments({ role: "student" });

    return res.status(200).json({
      success: true,
      totalStudents,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return next(new ErrorHandler(error.message || 'Failed to fetch students', 500));
  }
};


exports.getTotalDownloadedWorkbook = async (req, res, next) => {
  try {
    const totalDownloaded = await NotificationModel.countDocuments({
      action: { $regex: /^Downloaded workbook for course/i }
    });

    return res.status(200).json({
      success: true,
      totalDownloaded,
    });
  } catch (error) {
    console.error('Error fetching total downloaded workbooks:', error);
    return next(new ErrorHandler(error.message || 'Failed to fetch total downloads', 500));
  }
};
