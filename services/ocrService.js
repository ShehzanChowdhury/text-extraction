const visionClient = require('../config/vision');
const { calculateConfidence, roundConfidence } = require('../utils/confidenceCalculator');
const { HTTP_STATUS } = require('../utils/httpStatusCodes');

/**
 * Extract text from image using Google Cloud Vision API
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<Object>} OCR result with text and detections
 */
async function extractText(imageBuffer) {
  const [result] = await visionClient.documentTextDetection({
    image: { content: imageBuffer },
  });

  return result;
}

/**
 * Process OCR result and extract text with confidence
 * @param {Object} result - Vision API result
 * @returns {Object} Processed OCR data
 */
function processOCRResult(result) {
  const detections = result.textAnnotations;
  const fullTextAnnotation = result.fullTextAnnotation;

  // No text found
  if (!detections || detections.length === 0) {
    return {
      text: '',
      confidence: 0,
      hasText: false,
    };
  }

  // Extract full text (first detection contains all text)
  const fullText = detections[0].description || '';
  const confidence = calculateConfidence(fullTextAnnotation);

  return {
    text: fullText.trim(),
    confidence: roundConfidence(confidence),
    hasText: fullText.trim().length > 0,
  };
}

/**
 * Process multiple images for batch OCR
 * @param {Array} files - Array of file objects with buffer property
 * @returns {Promise<Array>} Array of OCR results
 */
async function processBatchOCR(files) {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const result = await extractText(file.buffer);
        const processed = processOCRResult(result);

        return {
          filename: file.originalname,
          success: true,
          text: processed.text,
          confidence: processed.confidence,
        };
      } catch (error) {
        return {
          filename: file.originalname,
          success: false,
          error: error.message,
        };
      }
    })
  );

  return results;
}

/**
 * Handle Vision API errors and convert to user-friendly messages
 * @param {Error} error - Error object from Vision API
 * @returns {Object} Error details with status code and message
 */
function handleVisionAPIError(error) {
  // Invalid image error
  if (error.code === 3 || error.message?.includes('Invalid image')) {
    return {
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: 'Invalid or corrupted image file.',
    };
  }

  // Authentication/permission error
  if (error.code === 7 || error.message?.includes('permission')) {
    return {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Google Cloud Vision API authentication failed. Please check your credentials.',
    };
  }

  // Generic error
  return {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: error.message || 'An error occurred while processing the image.',
  };
}

module.exports = {
  extractText,
  processOCRResult,
  processBatchOCR,
  handleVisionAPIError,
};


