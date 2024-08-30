const UserModel = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendMail");
const TokenModel = require("../models/token");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });

    if (!user) return res.status(400).send({ message: "Invalid Link" });

    let token = await TokenModel.findOne({ verifyUser: user._id });

    // Check if the token has expired
    if (token.verificationTokenExpire < Date.now()) {
      return res.status(400).send({ message: "Token expired" });
    }

    // If a token exists for the user, update it; otherwise, create a new one
    if (token) {
      token.token = req.params.token;
      await token.save();
    } else {
      token = new TokenModel({
        verifyUser: user._id,
        token: req.params.token,
      });
      await token.save();
    }

    await UserModel.updateOne(
      { _id: req.params.id },
      { $set: { verified: true } }
    );

    // Delete the token after successful verification
    await TokenModel.deleteOne({ verifyUser: user._id });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
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
      return next(new ErrorHandler("Email address already exist!", 400));
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

    // Create the user
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
    });

    // Generate a verification token
    const token = await new TokenModel({
      verifyUser: user._id,
      token: crypto.randomBytes(32).toString("hex"),
      verificationTokenExpire: new Date(Date.now() + 2 * 60 * 1000),
    }).save();

    const emailVerification = `${process.env.FRONTEND_URL}/verify/email/${token.token}/${user._id}`;

    // Email content
    const emailContent = `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 15px; justify-content: center; align-items: center; height: 40vh;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;">
                    <h1 style="font-size: 24px; color: #333;">Email Verification Request</h1>
                    <p style="font-size: 16px; color: #555;">Hello ${user.firstname},</p>
                    <p style="font-size: 16px; color: #555;">Thank you for signing up with Go Virtuals. To complete your registration, please verify your email address by clicking the button below:</p>
                    <p style="text-align: center;">
                        <a href="${emailVerification}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 16px;" target="_blank">Verify Email</a>
                    </p>
                    <p style="font-size: 16px; color: #555;">If you did not request this, you can safely ignore this email.</p>
                    <p style="font-size: 16px; color: #555;">Please note: Your security is important to us. We will never ask you to share your password or other sensitive information via email.</p>
                    <p style="font-size: 16px; color: #555;">Best regards,<br>Go Virtuals</p>
                </div>
            </div>
        `;

    // Send email
    await sendMail(user.email, "Go Virtual - Verify Email", emailContent, true);

    // Respond to the client
    res
      .status(200)
      .json({
        success: true,
        message: `Email sent to: ${user.email}. Please check your inbox.`,
      });
  } catch (error) {
    console.error(error);
    res
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

    if (!user.verified) {
      let token = await TokenModel.findOne({ verifyUser: user._id });

      if (!token || token.verificationTokenExpire < Date.now()) {
        token = await TokenModel.findOneAndUpdate(
          { verifyUser: user._id },
          {
            token: crypto.randomBytes(32).toString("hex"),
            verificationTokenExpire: Date.now() + 2 * 60 * 1000,
          },
          { new: true, upsert: true }
        );

        const emailVerification = `${process.env.FRONTEND_URL}/verify/email/${token.token}/${user._id}`;

        const emailContent = `
                    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 15px; justify-content: center; align-items: center; height: 40vh;">
                        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;">
                            <h1 style="font-size: 24px; color: #333;">Email Verification Request</h1>
                            <p style="font-size: 16px; color: #555;">Hello ${user.firstname},</p>
                            <p style="font-size: 16px; color: #555;">Thank you for signing up with Go Virtuals. To complete your registration, please verify your email address by clicking the button below:</p>
                            <p style="text-align: center;">
                                <a href="${emailVerification}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 16px;" target="_blank">Verify Email</a>
                            </p>
                            <p style="font-size: 16px; color: #555;">If you did not request this, you can safely ignore this email.</p>
                            <p style="font-size: 16px; color: #555;">Please note: Your security is important to us. We will never ask you to share your password or other sensitive information via email.</p>
                            <p style="font-size: 16px; color: #555;">Best regards,<br>Go Virtuals</p>
                        </div>
                    </div>
                `;

        await sendMail(
          user.email,
          "Go Virtuals - Verify Email",
          emailContent,
          true
        );

        return res.status(403).json({
          success: false,
          message: "Token expired! A new one has been sent to your email.",
        });
      } else {
        return next(
          new ErrorHandler(
            "Please check your email for the verification link.",
            403
          )
        );
      }
    } else {
      return sendToken(user, 200, res);
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHandler("User not found with this email", 400));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    // HTML content for the email
    const emailContent = `
          <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 15px; justify-content: center; align-items: center; height: 40vh;">
              <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;">
                  <h1 style="font-size: 24px; color: #333;">Password Reset Request</h1>
                  <p style="font-size: 16px; color: #555;">Hello ${user.firstname},</p>
                  <p style="font-size: 16px; color: #555;">You have requested to reset your password. To proceed, please click the button below:</p>
                  <p style="text-align: center;">
                      <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 16px;" target="_blank">Reset Password</a>
                  </p>
                  <p style="font-size: 16px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
                  <p style="font-size: 16px; color: #555;">Best regards,<br>Go Virtuals</p>
              </div>
          </div>
      `;

    try {
      await sendMail(
        user.email,
        "Go Virtuals- Password Recovery",
        emailContent,
        true
      );

      res
        .status(200)
        .json({ success: true, message: `Email sent to: ${user.email}` });
    } catch (emailError) {
      // Handle email sending error
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });
      return next(
        new ErrorHandler("There was an error sending the email", 500)
      );
    }
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler("An error occurred while processing your request", 500)
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  // Hash URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Password reset token is invalid or has been expired",
          400
        )
      );
    }

    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (newPassword !== confirmPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Setup new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
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
