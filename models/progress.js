const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    videoProgress: [{
        videoLessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson.videoLesson',
            required: true,
        },
        currentDuration: {
            hours: {
                type: Number,
                default: 0,
            },
            minutes: {
                type: Number,
                default: 0,
            },
            seconds: {
                type: Number,
                default: 0,
            },
        },
        totalDuration: {
            hours: {
                type: Number,
                required: true,
            },
            minutes: {
                type: Number,
                required: true,
            },
            seconds: {
                type: Number,
                required: true,
            },
        },
        isFinished: {
            type: Boolean,
            default: false,
        },
        lastWatchedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    watchCompleted:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('UserProgress', progressSchema);
