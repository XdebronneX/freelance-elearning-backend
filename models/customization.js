// const mongoose = require("mongoose");

// const customizationSchema = new mongoose.Schema({
//     design: [{
//         name: {
//             type: String,
//             required: true
//         },
//         singleImage: {
//             public_id: {
//                 type: String,
//             },
//             url: {
//                 type: String,
//             }
//         },
//         multiImages: [{
//             public_id: {
//                 type: String,
//             },
//             url: {
//                 type: String,
//             }
//         }],
//         singleVideo: {
//             public_id: {
//                 type: String,
//             },
//             url: {
//                 type: String,
//             }
//         },
//         textSection: {
//             text: {
//                 type: String,
//             },
//             style: {
//                 type: String
//             }
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now
//         }
//     }],
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// module.exports = mongoose.model("Customization", customizationSchema);

const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema({
  design: [
    {
      imgSec: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      imgTwo: [
        {
          public_id: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      ],
      singleVideo: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
      textSec: {
        text: {
          type: String,
        },
        style: {
          type: String,
        },
      },
      spaceSec: {
        type: String,
      },
      dividerSec: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Customization", customizationSchema);
