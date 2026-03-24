const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const sanitizeFilename = (originalName) => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  // Keep the extension! (e.g., .pdf, .png, .jpg)
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}${ext}`;
};

const createStorage = ({ folder, resourceType }) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const userId = req.user ? req.user.id : 'unknown';
      const timestamp = Date.now();
      const sanitized = sanitizeFilename(file.originalname);
      const publicId = `${userId}_${timestamp}_${sanitized}`;

      console.log('☁️ Cloudinary Upload Config:');
      console.log('  - Original filename:', file.originalname);
      console.log('  - Sanitized filename:', sanitized);
      console.log('  - Public ID:', publicId);
      console.log('  - Folder:', folder);
      console.log('  - Resource type:', resourceType);
      console.log('  - MIME type:', file.mimetype);

      return {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        use_filename: false,
        unique_filename: false
      };
    }
  });

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

// File filter for certificates (PDF or image)
const certificateFilter = (req, file, cb) => {
  const allowedExt = /pdf|jpeg|jpg|png/;
  const allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMime.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed for certificates'), false);
  }
};

// Configure multer for different upload types
const uploadPhoto = multer({
  storage: createStorage({
    folder: 'placement-system/photos',
    resourceType: 'image'
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: imageFilter
});

const uploadDocument = multer({
  storage: createStorage({
    folder: 'placement-system/documents',
    resourceType: 'raw'
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: documentFilter
});

const uploadResume = multer({
  storage: createStorage({
    folder: 'placement-system/resumes',
    resourceType: 'auto'
  }),
  limits: {
    fileSize: 1048576 // 1MB limit for resumes
  },
  fileFilter: documentFilter
});

const uploadCertificate = multer({
  storage: createStorage({
    folder: 'placement-system/certificates',
    resourceType: 'auto'
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: certificateFilter
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 1MB for resumes'
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
  uploadCertificate,
  handleUploadError
};
