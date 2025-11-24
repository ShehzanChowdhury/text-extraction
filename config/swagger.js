const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OCR API',
      version: process.env.API_VERSION || 'v1',
      description: 'Serverless OCR API using Google Cloud Run and Vision API.',
      contact: {
        name: 'API Support',
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'OCR',
        description: 'Optical Character Recognition endpoints',
      },
    ],
    paths: {
      '/ocr': {
        post: {
          summary: 'Extract text from a single image',
          tags: ['OCR'],
          requestBody: {
            $ref: '#/components/requestBodies/SingleImageUpload',
          },
          // No query parameters
          responses: {
            '200': {
              description: 'Text extracted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '413': { $ref: '#/components/responses/PayloadTooLarge' },
            '415': { $ref: '#/components/responses/UnsupportedMediaType' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/ocr/batch': {
        post: {
          summary: 'Extract text from multiple images',
          tags: ['OCR'],
          requestBody: { $ref: '#/components/requestBodies/BatchImagesUpload' },
          responses: {
            '200': {
              description: 'Text extracted from all images',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BatchResponse' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '413': { $ref: '#/components/responses/PayloadTooLarge' },
            '415': { $ref: '#/components/responses/UnsupportedMediaType' },
            '500': { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
    },
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            text: {
              type: 'string',
              description: 'Extracted text from the image',
              example: 'Hello World',
            },
            confidence: {
              type: 'number',
              format: 'float',
              description: 'Confidence score (0-1)',
              example: 0.95,
            },
            processing_time_ms: {
              type: 'integer',
              description: 'Processing time in milliseconds',
              example: 1234,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.',
            },
            processing_time_ms: {
              type: 'integer',
              description: 'Processing time in milliseconds',
              example: 0,
            },
          },
        },
        BatchResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: {
                    type: 'string',
                    example: 'image.jpg',
                  },
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  text: {
                    type: 'string',
                    example: 'Extracted text',
                  },
                  confidence: {
                    type: 'number',
                    format: 'float',
                    example: 0.95,
                  },
                },
              },
            },
            total_images: {
              type: 'integer',
              example: 2,
            },
            processing_time_ms: {
              type: 'integer',
              example: 2345,
            },
          },
        },
      },
      requestBodies: {
        SingleImageUpload: {
          description: 'Using cURL\n\n- Single image (OCR):\n\n```bash\ncurl -X POST {baseUrl}/ocr -F "image=@test-image.jpg"\n```',
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (JPG, JPEG, PNG, GIF) - Max 10MB',
                  },
                },
              },
            },
          },
          required: true,
        },
        BatchImagesUpload: {
          description: 'Using cURL\n\n- Batch (multiple images):\n\n```bash\ncurl -X POST {baseUrl}/ocr/batch -F "images=@test-image-1.jpg" -F "images=@test-image-2.jpg"\n```',
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['images'],
                properties: {
                  images: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary',
                    },
                    description: 'Array of image files (JPG, JPEG, PNG, GIF) - Max 10MB each, Max 10 files',
                  },
                },
              },
            },
          },
          required: true,
        },
      },
      // query parameter components removed — endpoints do not accept query params
      responses: {
        BadRequest: {
          description: 'Bad request - Invalid input',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        UnsupportedMediaType: {
          description: 'Unsupported media type - Invalid file format',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        PayloadTooLarge: {
          description: 'Payload too large - File exceeds size limit',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

