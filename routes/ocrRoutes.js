const express = require('express');
const router = express.Router();
const { processOCR, processBatchOCR } = require('../controllers/ocrController');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { validateSingleFile, validateMultipleFiles } = require('../middleware/validation');

router.post('/ocr', uploadSingle, validateSingleFile, processOCR);

router.post('/ocr/batch', uploadMultiple, validateMultipleFiles, processBatchOCR);

module.exports = router;


