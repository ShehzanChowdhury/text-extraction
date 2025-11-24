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

// API Documentation - serve dynamic spec to use the current host
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (req, res) => {
  const spec = JSON.parse(JSON.stringify(swaggerSpec));
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}/api/${API_VERSION}`;
  spec.servers = [
    {
      url: baseUrl,
      variables: {
        version: {
          default: API_VERSION,
          description: 'API version',
        },
      },
    },
  ];

  // Replace {baseUrl} placeholders in request body descriptions
  if (spec.components && spec.components.requestBodies) {
    Object.keys(spec.components.requestBodies).forEach((key) => {
      const rb = spec.components.requestBodies[key];
      if (rb && typeof rb.description === 'string') {
        rb.description = rb.description.split('{baseUrl}').join(baseUrl);
      }
    });
  }

  res.send(swaggerUi.generateHTML(spec));
});

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
});

module.exports = app;
