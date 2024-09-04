const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
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
        // required: [true, "Please enter the work book"],
    },
    visibility: {
        status: {
            type: String,
            enum: ["unlisted", "public"],
            default: "unlisted" 
        },
        datePublished: {
            type: Date,
            // default: Date.now,
        },
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
    madeBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
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
