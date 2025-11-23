const HTTP_STATUS = require('./httpStatusCodes').HTTP_STATUS;

/**
 * Validate file type
 * @param {string} mimetype - File MIME type
 * @returns {Object} Validation result
 */
function validateFileType(mimetype) {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (!mimetype) {
    return {
      valid: false,
      error: 'File type is required.',
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  if (!allowedMimes.includes(mimetype.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type: ${mimetype}. Only JPG, JPEG, PNG, and GIF are allowed.`,
      statusCode: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {Object} Validation result
 */
function validateFileSize(fileSize, maxSize) {
  if (!fileSize || fileSize === 0) {
    return {
      valid: false,
      error: 'File is empty.',
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB.`,
      statusCode: HTTP_STATUS.PAYLOAD_TOO_LARGE,
    };
  }

  return { valid: true };
}

/**
 * Validate file presence
 * @param {Object} file - File object
 * @param {string} fieldName - Expected field name
 * @returns {Object} Validation result
 */
function validateFilePresence(file, fieldName = 'image') {
  if (!file) {
    return {
      valid: false,
      error: `No file provided. Please upload a file using the "${fieldName}" field.`,
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files
 * @param {Array} files - Array of file objects
 * @param {string} fieldName - Expected field name
 * @param {number} maxCount - Maximum number of files
 * @returns {Object} Validation result
 */
function validateFilesPresence(files, fieldName = 'images', maxCount = 10) {
  if (!files || files.length === 0) {
    return {
      valid: false,
      error: `No files provided. Please upload files using the "${fieldName}" field.`,
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  if (files.length > maxCount) {
    return {
      valid: false,
      error: `Too many files. Maximum ${maxCount} files allowed, received ${files.length}.`,
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  return { valid: true };
}

/**
 * Validate image buffer
 * @param {Buffer} buffer - Image buffer
 * @returns {Object} Validation result
 */
function validateImageBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    return {
      valid: false,
      error: 'Invalid image data. File buffer is empty.',
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  // Check for image magic bytes
  const magicBytes = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46, 0x38],
  };

  const firstBytes = Array.from(buffer.slice(0, 4));
  const isValidImage = Object.values(magicBytes).some(magic => 
    magic.every((byte, index) => firstBytes[index] === byte)
  );

  if (!isValidImage) {
    return {
      valid: false,
      error: 'Invalid image format. File does not appear to be a valid image.',
      statusCode: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
    };
  }

  return { valid: true };
}

/**
 * Validate query parameters
 * @param {Object} query - Query parameters object
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
// Query parameter validation removed — not used in the project currently.

module.exports = {
  validateFileType,
  validateFileSize,
  validateFilePresence,
  validateFilesPresence,
  validateImageBuffer,
};

