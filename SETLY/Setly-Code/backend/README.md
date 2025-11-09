# Setly Backend

This backend exposes protected routes (e.g., S3 uploads). It supports optional AWS S3 and Firebase Admin integration. If env vars are missing, features are disabled gracefully (returns 503).

## Environment setup

1) From an AWS credentials CSV (like the one you shared), map the columns:
- Access key ID → `AWS_ACCESS_KEY_ID`
- Secret access key → `AWS_SECRET_ACCESS_KEY`

2) Create a `.env` file (copy from `.env.example`) and fill:

```
AWS_REGION=us-east-1               # or your bucket's region
AWS_S3_BUCKET=your-bucket-name     # e.g. setly-uploads-dev
AWS_ACCESS_KEY_ID=AKIA...          # from CSV
AWS_SECRET_ACCESS_KEY=...          # from CSV

# Optional for token verification
FIREBASE_PROJECT_ID=setly-fire
FIREBASE_CLIENT_EMAIL=...@...gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

Security: never commit secrets. `.env` should be in .gitignore.

## Run locally

```
# In this folder
npm install
npm run dev
```

If AWS or Firebase env vars are missing, related routes will return 503 with a clear error.

## Health & Uploads
- Health endpoint: (add one if needed)
- Uploads: `POST /api/uploads/sign` (requires Firebase token via `Authorization: Bearer <idToken>` and AWS configured)
