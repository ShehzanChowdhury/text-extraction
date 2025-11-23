const { HTTP_STATUS } = require('../utils/httpStatusCodes');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: OCR API
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
const healthCheck = (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    service: 'OCR API',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
  });
};

module.exports = {
  healthCheck,
};


