**Implementation Explanation**

This document explains how OCR is implemented in this repository, how file uploads and validation are handled, and the recommended deployment strategy (GitHub Actions for CI and Google Cloud Run for hosting).

**OCR Library / Service**:
- **Library / SDK**: Uses the official Google Cloud client library `@google-cloud/vision` (see `config/vision.js`).
- **Client initialization**: `config/vision.js` creates an `ImageAnnotatorClient` which uses Application Default Credentials (ADC). At runtime, authenticate by setting the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to a service account JSON key or by using Workload Identity when running on GCP.
- **API used**: `services/ocrService.js` calls `documentTextDetection` on the Vision client with an image buffer (`image: { content: imageBuffer }`) to extract OCR text.
- **Result processing**: The service reads `textAnnotations` and `fullTextAnnotation` to build the final extracted text. Confidence is calculated by `utils/confidenceCalculator.js`, which traverses the Vision API's annotation tree (pages → blocks → paragraphs → words → symbols) and averages the `confidence` values.
- **Error handling**: `services/ocrService.js` contains `handleVisionAPIError` to map common Vision API errors (invalid image, authentication/permission errors) to user-friendly messages and HTTP status codes.

**File Uploads and Validation**:
- **Upload handling**: Uses `multer` with `memoryStorage` in `middleware/upload.js` so uploaded files are available in-memory as `Buffer` objects (`req.file` and `req.files`). There are two middlewares exported:
  - `uploadSingle`: handles a single file field `image` via `.single('image')`.
  - `uploadMultiple`: handles batch uploads via `.array('images', <max>)` where `<max>` defaults to `10` and can be configured via `MAX_BATCH_SIZE`.
- **MIME types and limits**: `upload.js` restricts MIME types to `image/jpeg`, `image/jpg`, `image/png`, and `image/gif`. File size limit is configurable via `MAX_FILE_SIZE` (defaults to 10MB) and enforced in `multer`.
- **Validation middleware**: `middleware/validation.js` performs server-side validation after `multer` runs:
  - Presence checks: ensures `req.file` or `req.files` exists.
  - Type checks: uses `utils/validation.js` to verify allowed MIME types.
  - Size checks: ensures file sizes do not exceed `MAX_FILE_SIZE`.
  - Buffer checks: `utils/validation.js` includes `validateImageBuffer` which checks that the file buffer is non-empty and has correct image magic bytes (JPEG/PNG/GIF signatures) to detect corrupted or mislabelled files.
- **Request flow**:
  - Single image: `POST /ocr` → `uploadSingle` → `validateSingleFile` → `controllers/ocrController.processOCR`.
  - Batch images: `POST /ocr/batch` → `uploadMultiple` → `validateMultipleFiles` → `controllers/ocrController.processBatchOCR`.
- **Why memoryStorage**: Using memory storage simplifies passing the image directly to Vision API without writing to disk. This is efficient for small-to-moderate file sizes; ensure `MAX_FILE_SIZE` limits are appropriate for available memory in the runtime.


**Deployment Strategy (CI + Cloud Run)**:
This repository uses GitHub Actions for CI (build/test) and to deploy container images to Google Cloud and then to Cloud Run.

- **CI (GitHub Actions) - high level**:
  - Trigger: push to `main` (protect `main` with PRs if desired).
  - Jobs:
    1. **lint**: run any linters (ESLint) and fail fast on format/style issues.
    2. **test**: run the test suite (if present). If there are no automated tests, this step can run smoke checks or be omitted.
    3. **build-and-publish**: build the Docker image, run basic container checks, and push to Google Container Registry (GCR) or Artifact Registry.
  - Secrets required in GitHub repo settings:
    - `GCP_PROJECT_ID` — Google Cloud project id.
    - `GCP_SA_KEY` — base64-encoded service account JSON key (or use OpenID Connect for short-lived tokens).
    - (Optional) `IMAGE_NAME`, `IMAGE_TAG`.

- **Deployment to Cloud Run - high level**:
  - After pushing the image to GCR/Artifact Registry, use `gcloud` or the Cloud Run API to deploy the image:
    - `gcloud run deploy <service-name> --image gcr.io/$GCP_PROJECT_ID/$IMAGE_NAME:$IMAGE_TAG --region <region> --platform managed --allow-unauthenticated` (adjust `--no-allow-unauthenticated` if auth is required).
  - Ensure the service account used for deployment has roles:
    - `roles/run.admin` (or suitable Cloud Run deploy permissions)
    - `roles/iam.serviceAccountUser` (if deploying with a SA)
    - `roles/storage.admin` or repository push permissions if pushing images to GCR/Artifact Registry


**Security and operational notes**:
- Monitor Vision API usage and set quota/billing alerts to avoid unexpected costs.
- Consider streaming or temporary cloud storage for very large images instead of `memoryStorage` if we expect big files or large concurrent uploads.
- Enable HTTPS and consider requiring authentication on Cloud Run if the API should not be publicly accessible.

