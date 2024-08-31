const UserModel = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcryptjs");

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    // Check if the OTP is correct and has not expired (assuming expiration is 5 minutes)
    const isOTPValid =
      user.otpCode.code === otpCode &&
      new Date() - user.otpCode.createdAt <= 5 * 60 * 1000;

    if (!isOTPValid) {
      return res.status(400).send({ message: "Invalid or expired OTP" });
    }

    // Update user verification status
    user.isVerified = true;
    user.otpCode = { code: null, createdAt: null }; // Clear OTP after successful verification
    await user.save();

    return res
      .status(200)
      .send({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    // Check if an OTP was recently sent (within the last 5 minutes)
    if (
      user.otpCode.createdAt &&
      new Date() - user.otpCode.createdAt < 5 * 60 * 1000
    ) {
      return res.status(400).send({
        message:
          "Please wait 5 minutes before requesting a new verification code",
      });
    }

    const generateRandomCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Generate a random OTP code
    const code = generateRandomCode();

    const emailContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center;">
            <h1 style="font-size: 28px; color: #333333; margin-bottom: 20px;">Email Verification Request</h1>
            <p style="font-size: 16px; color: #333333; margin-bottom: 15px;">Hello <strong>${user.firstname}</strong>,</p>
            <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">Thank you for signing up with Go Virtuals. To complete your registration, please verify your email address using the OTP code below:</p>
            <div style="font-size: 26px; color: #007bff; font-weight: bold; background-color: #f0f8ff; padding: 15px; border-radius: 5px; display: inline-block; margin-bottom: 20px;">${code}</div>
            <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">If you did not request this, you can safely ignore this email.</p>
            <p style="font-size: 14px; color: #888888; margin-bottom: 20px; line-height: 1.5;">Please note: Your security is important to us. We will never ask you to share your password or other sensitive information via email.</p>
            <p style="font-size: 16px; color: #555555;">Best regards,<br><strong>Go Virtuals</strong></p>
          </div>
        </div>
      `;


    await sendMail(email, "Go Virtuals - OTP", emailContent, true);

    // Update user's OTP code and creation time
    user.otpCode.code = code;
    user.otpCode.createdAt = new Date();
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const existingEmailUser = await UserModel.findOne({
      email: req.body.email,
    });
    const existingPhoneUser = await UserModel.findOne({
      phone: req.body.mobileNumber,
    });

    if (existingEmailUser && existingPhoneUser) {
      return next(
        new ErrorHandler("Email and mobile number already exist!", 400)
      );
    }

    if (existingEmailUser) {
      return next(new ErrorHandler("Email address already exists!", 400));
    }

    if (existingPhoneUser) {
      return next(new ErrorHandler("Mobile number already taken!", 400));
    }

    const {
      firstname,
      lastname,
      email,
      password,
      mobileNumber,
      birthDate,
      gender,
      country,
      province,
      city,
      address,
    } = req.body;

    // Create the user without setting isVerified to true
    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      password,
      mobileNumber,
      birthDate,
      gender,
      country,
      province,
      city,
      address,
      isVerified: false,
    });

    // Send OTP for verification using the created user
    req.body.email = user.email; // Set the email in req.body to match the newly created user's email
    await exports.sendOTP(req, res, next);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "User registration failed" });
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 400));
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    return sendToken(user, 200, res);
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Failed to get user profile", 500));
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // Find user by ID
    const user = await UserModel.findById(req.user.id).select("password");

    // Check if user exists
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Check if the old password is correct
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }

    // Update password
    user.password = req.body.password;
    await user.save();

    // Send success response
    sendToken(user, 200, res);
  } catch (error) {
    console.error(error.message);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const existingPhoneUser = await UserModel.findOne({
      phone: req.body.mobileNumber,
    });
    if (existingPhoneUser) {
      return next(new ErrorHandler("Mobile number already taken!", 400));
    }

    const newUserData = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      phone: req.body.phone,
      region: req.body.region,
      province: req.body.province,
      city: req.body.city,
      barangay: req.body.barangay,
      postalcode: req.body.postalcode,
      address: req.body.address,
    };

    /** Update Avatar */
    if (req.body.avatar !== "") {
      const user = await UserModel.findById(req.user.id);

      // Check if the user has an existing avatar
      if (user.avatar && user.avatar.public_id) {
        const image_id = user.avatar.public_id;

        // Destroy the previous avatar
        await cloudinary.v2.uploader.destroy(image_id);
      }

      // Upload the new avatar
      const uploadResult = await cloudinary.v2.uploader.upload(
        req.body.avatar,
        {
          folder: "avatars",
          width: 150,
          crop: "scale",
        }
      );

      newUserData.avatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    // Update the user profile
    const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
    try {
      const { email, otpCode } = req.body;
      const user = await UserModel.findOne({ email });
  
      if (!user) {
        return next(new ErrorHandler("User not found with this email", 400));
      }
  
      // Check if the user is verified
      if (!user.isVerified) {
        return next(new ErrorHandler("You don't have access!", 403));
      }
  
      // Verify OTP if provided
      if (otpCode) {
        const isOTPValid =
          user.otpCode.code === otpCode &&
          new Date() - user.otpCode.createdAt <= 5 * 60 * 1000; // 5 minutes validity
  
        if (!isOTPValid) {
          return next(new ErrorHandler("Invalid or expired OTP", 400));
        }
  
        // Clear OTP after successful verification
        user.otpCode = { code: null, createdAt: null };
        await user.save();
  
        return res
          .status(200)
          .json({ success: true, message: "OTP verified successfully" });
  
      } else {

        const generateRandomCode = () => {
          return Math.floor(100000 + Math.random() * 900000).toString();
        };
  
        const code = generateRandomCode();
  
        const emailContent = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center;">
                <h1 style="font-size: 28px; color: #333333; margin-bottom: 20px;">Password Reset Request</h1>
                <p style="font-size: 16px; color: #333333; margin-bottom: 15px;">Hello <strong>${user.firstname}</strong>,</p>
                <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">You have requested to reset your password. Use the OTP code below to proceed with the password reset:</p>
                <div style="font-size: 26px; color: #007bff; font-weight: bold; background-color: #f0f8ff; padding: 15px; border-radius: 5px; display: inline-block; margin-bottom: 20px;">${code}</div>
                <p style="font-size: 16px; color: #555555; margin-bottom: 20px;">If you didn't request this, you can safely ignore this email.</p>
                <p style="font-size: 14px; color: #888888; margin-bottom: 20px; line-height: 1.5;">Please note: Your security is important to us. We will never ask you to share your password or other sensitive information via email.</p>
                <p style="font-size: 16px; color: #555555;">Best regards,<br><strong>Go Virtuals</strong></p>
              </div>
            </div>
          `;
  
        try {
          await sendMail(
            user.email,
            "Go Virtuals - OTP for Password Reset",
            emailContent,
            true
          );
  
          // Update user's OTP code and creation time
          user.otpCode.code = code;
          user.otpCode.createdAt = new Date();
          await user.save();
  
          return res
            .status(200)
            .json({ success: true, message: "OTP sent successfully" });
        } catch (emailError) {
          // Handle email sending error
          user.otpCode = { code: null, createdAt: null };
          await user.save({ validateBeforeSave: false });
          return next(
            new ErrorHandler("There was an error sending the OTP email", 500)
          );
        }
      }
    } catch (error) {
      console.log(error);
      return next(
        new ErrorHandler("An error occurred while processing your request", 500)
      );
    }
};
  

exports.resetPassword = async (req, res, next) => {
    const { otpCode, password, confirmPassword } = req.body;
  
    if (!otpCode) {
      return next(new ErrorHandler("OTP is missing", 400));
    }
  
    try {
      const user = await UserModel.findOne({
        "otpCode.code": otpCode,
        "otpCode.createdAt": { $gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes validity
      });
  
      if (!user) {
        return next(new ErrorHandler("Invalid or expired OTP", 400));
      }
  
      if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
      }
  
      user.password = password;
      user.otpCode = { code: null, createdAt: null }; // Clear OTP
      await user.save();
  
      res.status(200).json({ success: true, message: "Password reset successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  };
  
  

exports.logoutUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return next(
      new ErrorHandler("Logout failed. Please try again later.", 500)
    );
  }
};
