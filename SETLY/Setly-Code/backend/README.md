# Setly Backend

This backend powers media uploads and room listings. It supports AWS S3 (production) and a local filesystem fallback (development).

## Environment setup

1) AWS (optional for dev, required for production)
- Access key ID → `AWS_ACCESS_KEY_ID`
- Secret access key → `AWS_SECRET_ACCESS_KEY`

2) Create `.env` with at least:

```
AWS_REGION=us-east-1               # or your bucket's region
AWS_S3_BUCKET=your-bucket-name     # e.g. setly-uploads-dev
AWS_ACCESS_KEY_ID=AKIA...          # from CSV
AWS_SECRET_ACCESS_KEY=...          # from CSV

# Optional: Google Places API key for city/university/address autocomplete
GOOGLE_PLACES_API_KEY=AIza...      # https://developers.google.com/maps/documentation/places/web-service/get-api-key

# Optional for token verification
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

Security: never commit secrets. `.env` should be in .gitignore.

## Run locally

```
# In this folder
npm install
npm run dev
```

If AWS is not configured, uploads use the local fallback under `local-uploads/` and are served at `/uploads/local/...`.

### Dev tips: Firebase/Firestore fallbacks and logs

- If you don't have Firebase credentials locally, the Admin SDK is disabled and the API will fall back to:
	- Auth user directory (minimal) for `/api/users`
	- In-memory presence for `/api/presence/*`
	- Stubbed user objects for `GET/PUT /api/users/me`
- To explicitly disable Firebase Admin even when env vars are set (useful to silence NOT_FOUND errors in dev), set:

```
FIREBASE_DISABLE=1
```

- Presence can be forced to use in-memory only (no Firestore reads/writes) by setting:

```
PRESENCE_FORCE_MEMORY=1
```

- Logging is level-controlled via `LOG_LEVEL` (`debug` | `info` | `warn` | `error`). Default is `debug` in dev, `info` in prod. Repetitive warnings like Firestore NOT_FOUND are rate-limited.

## Health
- `GET /healthz` → `{ ok: true }`

## Profile snapshots to S3
When users update their profile via `PUT /api/users/me`, the backend stores the profile in Firestore and, if AWS is enabled, also uploads a JSON snapshot to S3 at `profiles/<authUid>.json`.

- Bucket: `AWS_S3_BUCKET`
- Region: `AWS_REGION`
- Public access: set `S3_PUBLIC_READ=1` to make the object publicly readable (ACL: `public-read`).
- Purpose: external consumption, analytics, or CDN caching of user profiles independent of Firestore.

This S3 write is best-effort; failures are logged and do not block the API response.

### Making `profiles/` publicly readable (bucket policy)
New S3 buckets often have ACLs disabled. If ACLs are disabled or you prefer a policy-based approach, add a bucket policy like below to allow public GET for the `profiles/` prefix:

```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadProfilesPrefix",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/profiles/*"
		}
	]
}
```

Replace `YOUR_BUCKET_NAME` with your bucket. Ensure Block Public Access settings allow public policies for this bucket if you intend objects to be public.

## Media uploads
- `POST /api/uploads/presign`
	- Body: `{ type: 'avatar' | 'room-photo' | 'room-video' | 'room-video-thumb', ext: 'jpg'|'png'|'webp'|'mp4'|'webm' }`
	- Response (AWS): `{ url, fields, key, contentType, publicUrl, expiresAt }`
	- Response (local dev): `{ url, fields: {}, key, contentType, publicUrl, expiresAt, local: true }`
	- Behavior:
		- Production (AWS configured): returns S3 POST policy; client POSTs FormData to `url` with `fields` and `file`.
		- Development (no AWS): returns a local PUT URL; client PUTs the raw file with `Content-Type`.
	- Allowed content types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`
	- Max size: 50MB

## Rooms API & Persistence
- `POST /api/rooms`
	- Create a listing. Body example:
		```json
		{
			"title": "Cozy Room",
			"description": "Near campus",
			"city": "Boston",
			"state": "MA",
			"price": 1200,
			"deposit": 200,
			"roomType": "private",
			"bath": "shared",
			"furnished": true,
			"photos": ["https://.../photo1.jpg", "https://.../photo2.jpg", "https://.../photo3.jpg"],
			"amenities": ["Wi‑Fi", "Heating"],
			"universityId": "1"
		}
		```
	- Requires at least 3 photos.
	- Returns the stored room including generated `id`.
- `GET /api/rooms` → `{ items: [...] }`
- `GET /api/rooms/:id` → room object

Persistence is backed by a SQLite database via Prisma. During development, if a database operation fails the service falls back to a small in-memory store (ensures room creation still works while iterating). Data in memory will be lost on restart.

### Database Setup

1. Ensure `DATABASE_URL` is set in `.env` (already defaults to `file:./dev.db`).
2. Run migrations:

```
npm run prisma:migrate
```

3. (Optional) Seed sample rooms:

```
npm run seed:rooms
```

4. Generate client after schema changes:

```
npm run prisma:generate
```

### Seed Script

`scripts/seed-db.js` creates a few example rooms with photos and amenities if the table is empty.

### Verification Script

`scripts/verify-db.js` posts a new room (using dev auth bypass) and then fetches it to confirm persistence.

Run:

```
npm run verify:db
```

If successful it logs the created ID and the fetched record.
