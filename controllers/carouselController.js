const CarouselModel = require("../models/carousel");
const cloudinary = require("cloudinary").v2;
const ErrorHandler = require("../utils/errorHandler");

exports.createCarousel = async (req, res, next) => {
    try {
        const images = [];

        if (!req.files || req.files.length === 0) {
            return next(new ErrorHandler("No images uploaded", 400));
        }

        // Iterate over the uploaded files and upload them to Cloudinary
        for (let file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "carousels",
            });

            images.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        // Save the images array in the database
        const carousel = await CarouselModel.create({ images });

        res.status(201).json({
            success: true,
            message: "Carousel images uploaded successfully",
            carousel,
        });
    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};

exports.updateCarousel = async (req, res, next) => {
    try {
        const { id } = req.params; 
        let carousel = await CarouselModel.findById(id);

        if (!carousel) {
            return next(new ErrorHandler("Carousel not found", 404));
        }

        const currentImages = carousel.images; 
        const newImages = [];

        for (let file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "carousels",
            });

            newImages.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        carousel.images = currentImages.concat(newImages);

        await carousel.save();

        res.status(200).json({
            success: true,
            message: "Carousel updated successfully",
            carousel,
        });
    } catch (error) {
        next(new ErrorHandler(error.message || "Failed to update images", 500));
    }
};

exports.getCarouselDetails = async (req, res, next) => {
    try {
        const carousel = await CarouselModel.findById(req.params.id);
  
        if (!carousel) {
            return next(
                new ErrorHandler(`Product not found with id: ${req.params.id}`)
            );
        }
        res.status(200).json({
            success: true,
            carousel,
        });
    } catch (error) {
        // Handle errors here
        console.log(error);
        return next(new ErrorHandler('Error while fetching carousel details'));
    }
  };

exports.reOrderingCarousel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { imageOrder } = req.body;

        // Find the carousel by ID
        let carousel = await CarouselModel.findById(id);

        if (!carousel) {
            return next(new ErrorHandler("Carousel not found", 404));
        }

        // Handle reordering of existing images based on imageOrder
        let updatedImages = [];
        if (imageOrder) {
            const imageOrderMap = new Map();

            // Create a map from existing images by their ID
            for (let image of carousel.images) {
                imageOrderMap.set(image._id.toString(), image);
            }

            // Reorder existing images according to the new order
            for (let id of imageOrder) {
                if (imageOrderMap.has(id)) {
                    updatedImages.push(imageOrderMap.get(id));
                }
            }
            const orderedImageIds = new Set(imageOrder);
            const existingImageIds = new Set(carousel.images.map(img => img._id.toString()));
            const missingImageIds = Array.from(existingImageIds).filter(id => !orderedImageIds.has(id));

            for (let id of missingImageIds) {
                updatedImages.push(imageOrderMap.get(id));
            }
        } else {
            updatedImages = carousel.images;
        }

        if (req.files && req.files.length > 0) {
            const newImages = [];
            for (let file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "carousels",
                });

                newImages.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }

            updatedImages = updatedImages.concat(newImages);
        }

        carousel.images = updatedImages;
        await carousel.save();

        res.status(200).json({
            success: true,
            message: "Carousel updated successfully",
            carousel,
        });
    } catch (error) {
        next(new ErrorHandler(error.message || "Failed to update carousel", 500));
    }
};

exports.setDefaultCarousel = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the carousel to be set as default
        const carouselToUpdate = await CarouselModel.findById(id);

        if (!carouselToUpdate) {
            return next(new ErrorHandler(`Carousel not found with id: ${id}`, 404));
        }

        // Set all other carousels to not default
        await CarouselModel.updateMany({ _id: { $ne: id } }, { isDefault: false });

        // Set the selected carousel as default
        carouselToUpdate.isDefault = true;
        await carouselToUpdate.save();

        return res.status(200).json({
            success: true,
            message: 'Carousel updated to default successfully',
            carousel: carouselToUpdate,
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler('Error while updating default carousel', 500));
    }
};

exports.getCarousel = async (req, res, next) => {
    try {
        const carousels = await CarouselModel.find({ isDefault: true });

        return res.status(200).json({
            success: true,
            carousels
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching carousel data',
        });
    }
};

