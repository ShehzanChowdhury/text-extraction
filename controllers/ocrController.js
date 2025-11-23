const ocrService = require('../services/ocrService');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');
const { HTTP_STATUS } = require('../utils/httpStatusCodes');

/**
 * Process single image OCR
 */
const processOCR = async (req, res) => {
  const startTime = Date.now();

  try {
    // Extract text from image
    const result = await ocrService.extractText(req.file.buffer);
    const processed = ocrService.processOCRResult(result);
    const processingTime = Date.now() - startTime;

    if (!processed.hasText) {
      return res.status(HTTP_STATUS.OK).json(
        formatSuccessResponse(
          '',
          0,
          processingTime,
          'No text found in the image.'
        )
      );
    }

    res.status(HTTP_STATUS.OK).json(
      formatSuccessResponse(
        processed.text,
        processed.confidence,
        processingTime
      )
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('OCR Error:', error);

    const errorDetails = ocrService.handleVisionAPIError(error);
    
    res.status(errorDetails.statusCode).json(
      formatErrorResponse(
        errorDetails.message,
        processingTime,
        errorDetails.statusCode
      )
    );
  }
};

/**
 * Process batch OCR for multiple images
 */
const processBatchOCR = async (req, res) => {
  const startTime = Date.now();

  try {
    // Process all images
    const results = await ocrService.processBatchOCR(req.files);
    const processingTime = Date.now() - startTime;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      results: results,
      total_images: req.files.length,
      processing_time_ms: processingTime,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Batch OCR Error:', error);

    const errorDetails = ocrService.handleVisionAPIError(error);
    
    res.status(errorDetails.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatErrorResponse(
        errorDetails.message || error.message || 'An error occurred while processing the images.',
        processingTime,
        errorDetails.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports = {
  processOCR,
  processBatchOCR,
};


