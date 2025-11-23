const { HTTP_STATUS } = require('../utils/httpStatusCodes');
const { formatErrorResponse } = require('../utils/responseFormatter');

/**
 * 404 Not Found middleware
 */
const notFound = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json(
    formatErrorResponse(
      `Endpoint not found: ${req.method} ${req.originalUrl}.`,
      0,
      HTTP_STATUS.NOT_FOUND
    )
  );
};

module.exports = notFound;


