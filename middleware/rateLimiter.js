const rateLimit = require('express-rate-limit');
const { formatErrorResponse } = require('../utils/responseFormatter');

// Global limiter
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    const body = formatErrorResponse('Too many requests. Please try again later.', 0, 429);
    res.set('Retry-After', String(60));
    res.status(429).json(body);
  }
});

// OCR-specific limiter
const ocrLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // maximum 30 OCR requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const body = formatErrorResponse('Too many OCR requests. Slow down and retry later.', 0, 429);
    res.set('Retry-After', String(60));
    res.status(429).json(body);
  }
});

module.exports = {
  globalLimiter,
  ocrLimiter,
};
