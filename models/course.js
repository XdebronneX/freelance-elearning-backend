const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    madeBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    visibility: {
        status: {
            type: String,
            enum: ["unlisted", "public"],
            default: "unlisted" 
        },
        datePublished: {
            type: Date,
        },
    },
    conditions: {
        subscribeMonths: {
            type: Number,
        },
        requiredFinish: {
            courseAssign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            },
        },
    },
    title: {
        type: String,
        required: [true, "Please enter the title"],
        unique: true
    },
    description: {
        type: String,
        required: [true, "Please enter the description"],
    },
    author: {
        type: String,
        required: [true, "Please enter the author"],
    },
    workBook: {
        type: String,
    },
    trailer: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    banner: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    totalDownload:{
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    softDelete: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model("Course", courseSchema);
