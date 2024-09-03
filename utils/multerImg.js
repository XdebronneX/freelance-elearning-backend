const multer = require("multer");
const path = require("path");
const ErrorHandler = require("./errorHandler");

// Change storage to memory storage
const storage = multer.memoryStorage(); 

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".mp4"].includes(ext)) {
    cb(new ErrorHandler("Unsupported file type!"), false);
    return;
  }
  cb(null, true);
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter 
});

module.exports = upload;

