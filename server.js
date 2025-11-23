require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const healthRoutes = require('./routes/healthRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const { globalLimiter, ocrLimiter } = require('./middleware/rateLimiter');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 8080;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check unthrottled for monitoring
app.use('/', healthRoutes);

app.use(globalLimiter);

// API Routes
app.use(`/api/${API_VERSION}`, ocrLimiter, ocrRoutes);

// Error handling middleware
app.use(errorHandler);

// 404
app.use(notFound);

// Start server
app.listen(PORT, () => {
  console.log(`OCR API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Version: ${API_VERSION}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`OCR endpoint: http://localhost:${PORT}/api/${API_VERSION}/ocr`);
});

module.exports = app;
