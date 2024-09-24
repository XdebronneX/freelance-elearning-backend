const UserModel = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const NotificationModel = require("../models/notification")

exports.getAllStudents = async (req, res, next) => {
  try {
    // const students = await UserModel.find({role: "student"});
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

exports.getAllCompletedCourse = async (req, res, next) => {
  try {
    const totalCompleted = await NotificationModel.countDocuments({
      action: { $regex: /^Finish course/i }
      });
      return res.status(200).json({
        success: true,
        totalCompleted,
        });
        } catch (error) {
          console.error('Error fetching total completed courses:', error);
          return next(new ErrorHandler(error.message || 'Failed to fetch total completed courses', 500));
          }
}

// exports.getTotalActiveUsers = async (req, res, next) => {
//   try {
//     const activeUserIds = await NotificationModel.distinct("user");

//     const totalActive = activeUserIds.length;

//     return res.status(200).json({
//       success: true,
//       totalActive,
//     });
//   } catch (error) {
//     console.error('Error fetching total active users:', error);
//     return next(new ErrorHandler(error.message || 'Failed to fetch total active users', 500));
//   }
// };

// exports.getTotalActiveUsers = async (req, res, next) => {
//   try {

//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//     const activeUserIds = await NotificationModel.distinct("user", {
//       createdAt: { $gte: oneMonthAgo },
//     });

//     const activeUsers = await UserModel.find({ _id: { $in: activeUserIds }});

//     const totalActive = activeUsers.length;

//     return res.status(200).json({
//       success: true,
//       totalActive,
//       activeUsers,
//     });
//   } catch (error) {
//     console.error('Error fetching total active users:', error);
//     return next(new ErrorHandler(error.message || 'Failed to fetch total active users', 500));
//   }
// };

exports.getTotalActiveUsers = async (req, res, next) => {
  try {

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const activeUserIds = await NotificationModel.distinct("user", {
      createdAt: { $gte: oneMonthAgo },
    });

    const activeUsers = await UserModel.find({ _id: { $in: activeUserIds }});

    const activeUsersWithNotifications = await Promise.all(activeUsers.map(async (user) => {

      const latestNotification = await NotificationModel.findOne({ user: user._id })
        .sort({ createdAt: -1 })
        .select('user action createdAt');

      return {
        user,
        latestNotification: latestNotification ? {
          user: latestNotification.user,
          action: latestNotification.action,
          createdAt: latestNotification.createdAt,
        } : null,
      };
    }));

    const totalActive = activeUsersWithNotifications.length;

    return res.status(200).json({
      success: true,
      totalActive,
      activeUsers: activeUsersWithNotifications,
    });
  } catch (error) {
    console.error('Error fetching total active users:', error);
    return next(new ErrorHandler(error.message || 'Failed to fetch total active users', 500));
  }
};


exports.getTotalInactiveUsers = async (req, res, next) => {
  try {

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const activeUserIds = await NotificationModel.distinct("user", {
      createdAt: { $gte: oneMonthAgo },
    });

    const inactiveUsers = await UserModel.find({
      _id: { $nin: activeUserIds },
    }).select('-password -otpCode');

    const totalInactive = inactiveUsers.length;

    return res.status(200).json({
      success: true,
      totalInactive,
      inactiveUsers,
    });
  } catch (error) {
    console.error('Error fetching total inactive users:', error);
    return next(new ErrorHandler(error.message || 'Failed to fetch total inactive users', 500));
  }
};

