## Post Room Flow & S3 Uploads (Dev + Prod)

This doc explains how the Post Room feature stores listing data and uploads photos either locally (dev) or to S3 (prod / opt‑in dev).

### 1. Overview
Flow: User fills 3 steps (details → photos → pricing). On first photo selection the client generates a `roomId` (`r_<random>`). Each photo upload requests a presign including that `roomId`; backend returns either a local upload target or S3 presigned POST. On publish we POST `/api/rooms` with validated fields + photo URLs.

### 2. Dev vs Prod Upload Modes
Environment flags (in `environment.development.ts` → `featureFlags`):

| Flag | Default (dev/prod) | Effect |
|------|--------------------|--------|
| `forceLocalUploads` | true / false | Forces local PUT uploads to backend (`/uploads/local/...`). |
| `enableS3Dev` | false / n/a | When true and `forceLocalUploads` is false, presigns target S3 (requires AWS + CORS). |
| `enableRoomVideo` | false / false | Enables experimental room video uploads (UI coming). |
| `enableAmenitySuggestions` | true / true | Shows amenity suggestion chips in details step. |

Prod builds ignore these and always target S3 (unless AWS env vars missing → graceful local fallback).

### 3. Switching to Real S3 in Dev
1. Ensure backend `.env` contains: `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
2. Run CORS setup (only once unless changing origins):
```bash
node SETLY/Setly-Code/backend/scripts/configure-s3-cors.mjs
```
3. Edit `environment.development.ts`:
```ts
featureFlags: {
  forceLocalUploads: false,
  enableS3Dev: true,
  // other flags...
}
```
4. Restart backend & `ng serve`.
5. Upload a photo; Network panel should show a POST to your S3 bucket and **no** CORS errors.

### 4. S3 Key Convention
Photos for a listing: `rooms/{roomId}/{uuid}.jpg` (or png/webp/heic). The `roomId` is generated client‑side early so all assets stay grouped. If a presign request lacks a valid `roomId`, backend falls back to `rooms/{userUid}/...`.

### 5. Backend Validation (RoomsController.create)
The following must be present or a 400 is returned with a friendly error code:
- `title` (error: `title-required`)
- `address` (error: `address-required`)
- `city` (error: `city-required`)
- `roomType` (error: `roomType-required`)
- `price > 0` (error: `price-invalid`)
- `amenities.length >= 1` (error: `amenities-required`)
- `photos.length >= 3` (error: `min-photos`)

### 6. Frontend Publish UX
`PostRoomPage.publishRoom()` disables the button, shows a toast on success (“Room posted. It’s now visible…”), and maps backend error codes to friendly messages.

### 7. Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| CORS errors on S3 POST | Missing/incorrect bucket CORS | Re-run configure-s3-cors script; verify bucket name & region. |
| Photos stuck uploading | S3 blocked & fallback disabled | Ensure `forceLocalUploads: true` OR enable proper CORS + set `enableS3Dev`. |
| Room not visible after refresh | Backend create failed; fallback stored only in memory | Check Network tab for 4xx/5xx; verify validation errors; inspect backend logs. |
| Photos saved under user UID folder | `roomId` not generated (no first photo) | Ensure at least one photo was added before others; refresh and retry. |

### 8. Next Enhancements (Optional)
- Retry button implemented (failed photo shows Retry).
- Video uploads gated by `enableRoomVideo` (UI to be added later).
- Amenity suggestions enabled by default; toggle with `enableAmenitySuggestions`.
- Server supports roomId grouping; future improvement: canonical backend id mapping if asset rename needed.

---
Last updated: Nov 20, 2025