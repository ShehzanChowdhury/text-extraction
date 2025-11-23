const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.'), false);
  }
};

// Single file upload middleware
const uploadSingle = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: fileFilter,
}).single('image');

// Multiple files upload middleware
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: fileFilter,
}).array('images', parseInt(process.env.MAX_BATCH_SIZE || '10'));

module.exports = {
  uploadSingle,
  uploadMultiple,
};


