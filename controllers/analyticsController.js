const UserModel = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await UserModel.find({ role: "student" }).select("-password");
    const totalStudents = await UserModel.countDocuments({ role: "student" });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }

    return res.status(200).json({
      success: true,
      totalStudents,
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return next(new ErrorHandler(error.message || 'Failed to fetch students', 500));
  }
};

