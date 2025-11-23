# OCR API - Google Cloud Run Serverless API

A serverless API built with Node.js and Express that accepts image uploads and extracts text using Google Cloud Vision API OCR capabilities.

## Features

- ✅ Accepts JPG/JPEG, PNG, and GIF image uploads via POST request
- ✅ Extracts text from images using Google Cloud Vision API
- ✅ Returns extracted text in JSON format with confidence scores
- ✅ Handles edge cases (no text found, invalid files, etc.)
- ✅ Batch processing endpoint for multiple images
- ✅ File size validation (10MB limit)
- ✅ Processing time tracking
- ✅ **API versioning** (`/api/v1/ocr`)
- ✅ **Swagger/OpenAPI documentation** (`/api-docs`)
- ✅ **RESTful design** with proper HTTP methods and status codes
- ✅ **Request/response validation** with clear error messages

## Prerequisites

- Node.js 18+ installed locally (for development)
- Google Cloud Platform account
- Google Cloud SDK (gcloud) installed and configured
- A GCP project with the following APIs enabled:
  - Cloud Run API
  - Cloud Build API
  - Container Registry API
  - Cloud Vision API

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and configure.

## Deployment to Google Cloud Run

This project uses GitHub Actions to build and deploy the service to Cloud Run automatically on pushes to the `main` branch. The workflow performs the build (using Cloud Build) and then deploys the produced image to Cloud Run.

- Workflow path: `.github/workflows/deploy-cloud-run.yml`

Required GitHub repository secrets (add these in your repository Settings → Secrets → Actions):

- `GCP_PROJECT` — your GCP project ID
- `GCP_REGION` — Cloud Run region (e.g. `us-central1`)
- `CLOUD_RUN_SERVICE` — desired Cloud Run service name (e.g. `ocr-api`)
- `GCP_SA_KEY` — JSON key contents for a GCP service account with deploy privileges (keep this secret)

Recommended IAM roles for the service account used by the workflow:

- `roles/run.admin` (Cloud Run Admin)
- `roles/iam.serviceAccountUser` (Allow using service accounts)
- `roles/cloudbuild.builds.editor` (Cloud Build access)
- `roles/storage.admin` (if pushing/pulling images from Container Registry)

How the workflow works:

- On push to `main`, the workflow authenticates with GCP using the provided service account key, runs `gcloud builds submit` to build and push the container image, then runs `gcloud run deploy` to update the Cloud Run service.

Set secrets via the GitHub UI or `gh` CLI. Example `gh` commands:

```bash
gh secret set GCP_PROJECT --body "your-gcp-project-id"
gh secret set GCP_REGION --body "us-central1"
gh secret set CLOUD_RUN_SERVICE --body "ocr-api"
gh secret set GCP_SA_KEY --body "$(cat path/to/service-account-key.json)"
```

If you need to run deployments manually (outside CI), you can still use `gcloud run deploy --source .` locally, but CI via GitHub Actions is the recommended path for repeatable deployments.

### Important Notes for Deployment

- **Service Account**: Cloud Run will use the default compute service account. Make sure it has the "Cloud Vision API User" role

- **Billing**: Cloud Vision API requires a billing account to be enabled on your GCP project.


## Example Usage

### Using cURL

```bash
curl -X POST \
  https://your-api-url.run.app/api/v1/ocr \
  -F "image=@test-image.jpg"
```

## Cost Considerations

- **Cloud Run**: Charges based on request count, CPU, and memory usage
- **Cloud Vision API**: Charges per image processed
  - First 1,000 units/month: Free
  - After that: $1.50 per 1,000 images

## Security Considerations

- The API is publicly accessible (unauthenticated) by default
- For production, consider:
  - Adding authentication (API keys, OAuth, etc.)
  - Adding request validation
  - Using Cloud Armor for DDoS protection

### Architecture Overview

- **Controllers**: Handle HTTP requests and responses, call services, format responses
- **Services**: Contain business logic, interact with external APIs (Vision API)
- **Routes**: Define API endpoints, apply middleware, connect to controllers
- **Middleware**: Handle cross-cutting concerns:
  - File uploads (Multer)
  - Input validation
  - Error handling
  - 404 handling
- **Utils**: Reusable utility functions:
  - HTTP status codes
  - Validation helpers
  - Response formatting
  - Confidence calculations
- **Config**: Configuration and client initialization (Vision API, Swagger)

## License

MIT

