const multer = require("multer");
const path = require("path");
const ErrorHandler = require("./errorHandler");

module.exports = multer({
    limits: { fieldSize: 100 * 1024 * 1024 },
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".mp4" && ext !== ".pdf") {
            cb(new ErrorHandler("Unsupported file type!"), false);
            return;
        }
        cb(null, true);
    },
});

