/**
 * Format successful OCR response
 * @param {string} text - Extracted text
 * @param {number} confidence - Confidence score
 * @param {number} processingTime - Processing time in milliseconds
 * @param {string} message - Optional message
 * @returns {Object} Formatted response
 */
function formatSuccessResponse(text, confidence, processingTime, message = null) {
  const response = {
    success: true,
    text: text || '',
    confidence: confidence,
    processing_time_ms: processingTime,
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * Format error response
 * @param {string} error - Error message
 * @param {number} processingTime - Processing time in milliseconds
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error, processingTime = 0, statusCode = 500) {
  return {
    success: false,
    error: error,
    processing_time_ms: processingTime,
  };
}

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
};


