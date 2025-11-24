const { HTTP_STATUS } = require('../utils/httpStatusCodes');

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


