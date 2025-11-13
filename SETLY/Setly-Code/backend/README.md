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

## Health
- `GET /healthz` → `{ ok: true }`

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
