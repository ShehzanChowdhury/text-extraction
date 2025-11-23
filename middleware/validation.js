/**
 * Validation middleware for request validation
 */

const { validateFileType, validateFileSize, validateFilePresence, validateFilesPresence, validateImageBuffer } = require('../utils/validation');
const { formatErrorResponse } = require('../utils/responseFormatter');
const HTTP_STATUS = require('../utils/httpStatusCodes').HTTP_STATUS;

/**
 * Validate single file upload
 */
const validateSingleFile = (req, res, next) => {
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

  // Check file presence
  const presenceCheck = validateFilePresence(req.file, 'image');
  if (!presenceCheck.valid) {
    return res.status(presenceCheck.statusCode).json(
      formatErrorResponse(presenceCheck.error, 0, presenceCheck.statusCode)
    );
  }

  // Validate file type
  const typeCheck = validateFileType(req.file.mimetype);
  if (!typeCheck.valid) {
    return res.status(typeCheck.statusCode).json(
      formatErrorResponse(typeCheck.error, 0, typeCheck.statusCode)
    );
  }

  // Validate file size
  const sizeCheck = validateFileSize(req.file.size, maxFileSize);
  if (!sizeCheck.valid) {
    return res.status(sizeCheck.statusCode).json(
      formatErrorResponse(sizeCheck.error, 0, sizeCheck.statusCode)
    );
  }

  // Validate image buffer
  const bufferCheck = validateImageBuffer(req.file.buffer);
  if (!bufferCheck.valid) {
    return res.status(bufferCheck.statusCode).json(
      formatErrorResponse(bufferCheck.error, 0, bufferCheck.statusCode)
    );
  }

  next();
};

/**
 * Validate multiple file uploads
 */
const validateMultipleFiles = (req, res, next) => {
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
  const maxBatchSize = parseInt(process.env.MAX_BATCH_SIZE || '10');

  // Check files presence
  const presenceCheck = validateFilesPresence(req.files, 'images', maxBatchSize);
  if (!presenceCheck.valid) {
    return res.status(presenceCheck.statusCode).json(
      formatErrorResponse(presenceCheck.error, 0, presenceCheck.statusCode)
    );
  }

  // Validate each file
  for (const file of req.files) {
    // Validate file type
    const typeCheck = validateFileType(file.mimetype);
    if (!typeCheck.valid) {
      return res.status(typeCheck.statusCode).json(
        formatErrorResponse(`${file.originalname}: ${typeCheck.error}`, 0, typeCheck.statusCode)
      );
    }

    // Validate file size
    const sizeCheck = validateFileSize(file.size, maxFileSize);
    if (!sizeCheck.valid) {
      return res.status(sizeCheck.statusCode).json(
        formatErrorResponse(`${file.originalname}: ${sizeCheck.error}`, 0, sizeCheck.statusCode)
      );
    }

    // Validate image buffer
    const bufferCheck = validateImageBuffer(file.buffer);
    if (!bufferCheck.valid) {
      return res.status(bufferCheck.statusCode).json(
        formatErrorResponse(`${file.originalname}: ${bufferCheck.error}`, 0, bufferCheck.statusCode)
      );
    }
  }

  next();
};

module.exports = {
  validateSingleFile,
  validateMultipleFiles,
};

