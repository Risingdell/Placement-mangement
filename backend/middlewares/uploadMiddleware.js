const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage for different file types
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', 'uploads', folder);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Create unique filename: userId_timestamp_originalname
      const userId = req.user ? req.user.id : 'unknown';
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${userId}_${timestamp}_${sanitizedName}${ext}`);
    }
  });
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG images are allowed'), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX documents are allowed'), false);
  }
};

// Configure multer for different upload types
const uploadPhoto = multer({
  storage: createStorage('photos'),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: imageFilter
});

const uploadDocument = multer({
  storage: createStorage('documents'),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: documentFilter
});

const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: documentFilter
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  uploadPhoto,
  uploadDocument,
  uploadResume,
  handleUploadError
};
