const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  assignCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lessonTitle: {
    type: String,
    required: true,
    unique: true,
  },
  videoLesson: [
    {
      visibility: {
        status: {
          type: String,
          enum: ["unlisted", "public"],
          default: "unlisted",
        },
        datePublished: {
          type: Date,
        },
      },
      title: {
        type: String,
        required: true,
        unique: true
      },
      author: {
        type: String,
      },
      description: {
        type: String,
      },
      transcription: {
        type: String,
      },
      video: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
        duration: {
          seconds: {
            type: Number,
            default: 0,
          },
        },
      },
      banner: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      thumbnail: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
      softDelete: {
        type: Boolean,
        default: false
    },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mainDelete: {
    type: Boolean,
    default: false
},
});

module.exports = mongoose.model("Lesson", lessonSchema);
