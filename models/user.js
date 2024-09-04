const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        required: true,
        validate: {
          validator: function (value) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
          },
          message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        }
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
      role: {
        type: String,
        default: "student"
    },
      isVerified: {
        type: Boolean,
        default: false
      },
});

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, parseInt(process.env.SALT_ROUNDS) || 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}



module.exports = mongoose.model('User', userSchema);
