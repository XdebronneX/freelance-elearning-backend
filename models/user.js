const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please enter your firstname'],
        minlength: [4, 'Firstname must be at least 4 characters long.'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    lastname: {
        type: String,
        required: [true, 'Please enter your lastname'],
        minlength: [4, 'Lastname must be at least 4 characters long.'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [8, 'Your password must be at least 8 characters long'],
        maxlength: [100, 'Your password must not exceed 100 characters'],
        select: false,
    },    
    mobileNumber: {
        type: String,
        required: [true, 'Please enter your mobile number'],
        unique: true,
    },
    // yyyy-mm-dd
    birthDate: {
        type: Date,
        required: [true, 'Please enter your birthdate'],
        validate: {
            validator: function (v) {
                return !isNaN(Date.parse(v));
            },
            message: 'Invalid date format!'
        }
    },
    gender: {
        type: String,
        required: [true, 'Please enter your gender'],
    },
    country: {
        type: String,
        required: [true, 'Please enter your country'],
    },
    province: {
        type: String,
        required: [true, 'Please enter your province'],
    },
    city: {
        type: String,
        required: [true, 'Please enter your city'],
    },
    address: {
        type: String,
        required: [true, 'Please enter your address'],
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    loginType: {
        type: String,
    },
    bio:{
        type: String,
        required: [true, 'Please enter your bio'],
    },
    metaData: {
        type: String,
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    otpCode: {
        code: {
          type: String,
          default: null,
        },
        createdAt: {
          type: Date,
          default: null,
        },
      },
      isVerified: {
        type: Boolean,
        default: false
      },
});

// JWT Token generation method
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

// Password hashing before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, parseInt(process.env.SALT_ROUNDS) || 10);
});

// Compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate reset password token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
}

// Export model
module.exports = mongoose.model('User', userSchema);
