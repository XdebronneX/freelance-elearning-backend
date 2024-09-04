const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema({
    images: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ],
    isDefault:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Carousel", carouselSchema);
