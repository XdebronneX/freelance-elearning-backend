const CustomizationModel = require("../models/customization");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;

//** Old code */
// exports.createCustomization = async (req, res, next) => {
//   try {
//     const data = req.body;

//     const processedData = {
//       design: data.map((item) => {
//         const designItem = {
//           imgSec: item.imgSec || undefined,
//           singleVideo: item.singleVideo || undefined,
//           textSec: item.textSec || undefined,
//           spaceSec: item.spaceSec || undefined,
//           dividerSec: item.dividerSec || undefined,
//         };

//         if (item.imgTwo && item.imgTwo.length > 0) {
//           designItem.imgTwo = item.imgTwo;
//         }

//         return designItem;
//       }),
//     };

//     const newCustomization = new CustomizationModel(processedData);

//     await newCustomization.save();

//     res
//       .status(201)
//       .json({
//         message: "Customization created successfully",
//         data: newCustomization,
//       });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// };

exports.createCustomization = async (req, res, next) => {
  try {
    const data = req.body;

    const processedData = {
      design: data.map((item) => {
        return {
          imgSec: {
            public_id: item.imgSec ? "placeholder_public_id" : "",
            url: item.imgSec || "",
          },
          imgTwo: item.imgTwo.map((img) => ({
            public_id: img ? "placeholder_public_id" : "",
            url: img || "",
          })),
          singleVideo: {
            public_id: item.singleVideo ? "placeholder_public_id" : "",
            url: item.singleVideo || "",
          },
          textSec: {
            text: item.textSec?.text || "",
            style: item.textSec?.style || "",
          },
          spaceSec: item.spaceSec || "",
          dividerSec: item.dividerSec || "",
        };
      }),
    };

    const newCustomization = new CustomizationModel(processedData);

    await newCustomization.save();

    res.status(201).json({
      message: "Customization created successfully with empty placeholders",
      data: newCustomization,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

exports.getCustomDesign = async (req, res, next) => {
  try {
    const customs = await CustomizationModel.find();

    return res.status(200).json({
      success: true,
      customs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching customs data",
    });
  }
};

exports.updateCustomization = async (req, res, next) => {
  try {
    const { newOrder } = req.body;

    // Validate that `newOrder` exists and is an array
    if (!newOrder || !Array.isArray(newOrder)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format. 'newOrder' should be an array.",
      });
    }

    // Fetch the customization entry by ID
    const customization = await CustomizationModel.findById(req.params.id);

    if (!customization) {
      return res.status(404).json({ success: false, message: "Customization not found." });
    }

    // Loop through the design and update only the fields in `newOrder`
    customization.design = customization.design.map((existingSection, index) => {
      const sectionUpdate = newOrder[index];

      if (sectionUpdate) {
        // Merge the existing fields with the new data
        return {
          ...existingSection, // Preserve the existing data
          imgSec: sectionUpdate.imgSec ? {
            public_id: sectionUpdate.imgSec.public_id || "",
            url: sectionUpdate.imgSec.url || "",
          } : existingSection.imgSec,

          imgTwo: sectionUpdate.imgTwo ? sectionUpdate.imgTwo.map((img) => ({
            public_id: img.public_id || "",
            url: img.url || "",
          })) : existingSection.imgTwo,

          singleVideo: sectionUpdate.singleVideo ? {
            public_id: sectionUpdate.singleVideo.public_id || "",
            url: sectionUpdate.singleVideo.url || "",
          } : existingSection.singleVideo,

          textSec: {
            ...existingSection.textSec,
            text: sectionUpdate.textSec?.text || "",
            style: sectionUpdate.textSec?.style || "",
          },
          spaceSec: sectionUpdate.spaceSec !== undefined ? sectionUpdate.spaceSec : existingSection.spaceSec,
          dividerSec: sectionUpdate.dividerSec !== undefined ? sectionUpdate.dividerSec : existingSection.dividerSec,
        };
      }

      return existingSection;
    });

    await customization.save();

    res.status(200).json({
      success: true,
      data: customization,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// exports.updateCustomization = async (req, res, next) => {
//   try {
//     const { newOrder } = req.body;

//     // Validate that `newOrder` exists and is an array
//     if (!newOrder || !Array.isArray(newOrder)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data format. 'newOrder' should be an array.",
//       });
//     }

//     // Fetch the customization entry by ID
//     const customization = await CustomizationModel.findById(req.params.id);

//     if (!customization) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Customization not found." });
//     }

//     const updatedDesign = newOrder.map((sectionUpdate, index) => {
//       const existingSection = customization.design[index] || {};

//       return {
//         imgSec: sectionUpdate.imgSec || existingSection.imgSec || {},
//         imgTwo: sectionUpdate.imgTwo
//           ? sectionUpdate.imgTwo.map((img, i) => ({
//               public_id: img.public_id || existingSection.imgTwo[i]?.public_id || "",
//               url: img.url || existingSection.imgTwo[i]?.url || "",
//             }))
//           : existingSection.imgTwo || [],

//         singleVideo: sectionUpdate.singleVideo || existingSection.singleVideo || {},
//         textSec: sectionUpdate.textSec || existingSection.textSec || {},
//         spaceSec: sectionUpdate.spaceSec || existingSection.spaceSec || "",
//         dividerSec: sectionUpdate.dividerSec || existingSection.dividerSec || "",
//       };
//     });

//     // If newOrder has more sections than existing design, add them
//     if (newOrder.length > customization.design.length) {
//       const additionalSections = newOrder.slice(customization.design.length);
//       updatedDesign.push(...additionalSections);
//     }

//     // Update the design field with the new data
//     customization.design = updatedDesign;

//     // Save the updated customization document
//     await customization.save();

//     // Respond with success
//     res.status(200).json({
//       success: true,
//       data: customization,
//     });
//   } catch (error) {
//     console.error("Error:", error); // Log the error
//     return next(new ErrorHandler(error.message, 500));
//   }
// };

exports.reOrderingCustomization = async (req, res, next) => {
  try {
      const { id } = req.params;
      const data = req.body;

      console.log(data, "dataa")
      const customization = await CustomizationModel.findById(id);

      if (!customization) {
          return next(new ErrorHandler("Customization not found", 404));
      }

      // Ensure data.design is an array
      // const designArray = Array.isArray(data.design) ? data.design : [];

      const updateData = {
        design: data.map((item) => {
            const updateItem = {
                imgSec: item.imgSec || undefined,
                singleVideo: item.singleVideo || undefined,
                textSec: item.textSec || undefined,
                spaceSec: item.spaceSec || undefined,
                dividerSec: item.dividerSec || undefined,
            };
    
            if (item.imgTwo && item.imgTwo.length > 0) {
                updateItem.imgTwo = item.imgTwo;
            } else {
                delete updateItem.imgTwo;
            }
    
            return updateItem;
        }),
    };
    

      await CustomizationModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

      res.status(200).json({
          message: "Customization updated successfully",
          data: await CustomizationModel.findById(id),
      });
  } catch (error) {
      return next(new ErrorHandler(error.message, 500));
  }

};


// exports.reOrderingCustomization = async (req, res, next) => {
//   try {
//     const { newOrder } = req.body; 

//     // Check if 'newOrder' is an array before mapping
//     if (!Array.isArray(newOrder)) {
//       return res.status(400).json({
//         success: false,
//         message: "'newOrder' should be an array.",
//       });
//     }

//     const processedData = {
//       design: newOrder.map((item) => {
//         return {
//           imgSec: {
//             public_id: item.imgSec?.public_id || "placeholder_public_id",
//             url: item.imgSec?.url || "",
//           },
//           imgTwo: item.imgTwo.map((img) => ({
//             public_id: img.public_id || "placeholder_public_id",
//             url: img.url || "",
//           })),
//           singleVideo: {
//             public_id: item.singleVideo?.public_id || "placeholder_public_id",
//             url: item.singleVideo?.url || "",
//           },
//           textSec: {
//             text: item.textSec?.text || "",
//             style: item.textSec?.style || "",
//           },
//           spaceSec: item.spaceSec || "",
//           dividerSec: item.dividerSec || "",
//         };
//       }),
//     };

//     // Update the customization with the new data
//     const updatedCustomization = await CustomizationModel.findByIdAndUpdate(
//       req.params.id,
//       { $set: processedData },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: updatedCustomization,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// };



