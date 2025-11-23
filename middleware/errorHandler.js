const multer = require('multer');
const { formatErrorResponse } = require('../utils/responseFormatter');
const { HTTP_STATUS, getStatusMessage } = require('../utils/httpStatusCodes');

/**
 * Error handling middleware with proper HTTP status codes
 */
const errorHandler = (error, req, res, next) => {
  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTP_STATUS.PAYLOAD_TOO_LARGE).json(
        formatErrorResponse(
          'File size exceeds the maximum allowed limit.',
          0,
          HTTP_STATUS.PAYLOAD_TOO_LARGE
        )
      );
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatErrorResponse(
          'Too many files. Maximum allowed files exceeded.',
          0,
          HTTP_STATUS.BAD_REQUEST
        )
      );
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatErrorResponse(
          `Unexpected field: ${error.field}. Please use the correct field name.`,
          0,
          HTTP_STATUS.BAD_REQUEST
        )
      );
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatErrorResponse(error.message, 0, HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Handle validation errors
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE).json(
      formatErrorResponse(error.message, 0, HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE)
    );
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatErrorResponse('Invalid JSON in request body.', 0, HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Handle 404 errors
  if (error.status === HTTP_STATUS.NOT_FOUND) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatErrorResponse(error.message || 'Resource not found.', 0, HTTP_STATUS.NOT_FOUND)
    );
  }

  // Handle server errors (default to 500)
  console.error('Unhandled Error:', error);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    formatErrorResponse(
      error.message || 'An internal server error occurred.',
      0,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  );
};

module.exports = errorHandler;


