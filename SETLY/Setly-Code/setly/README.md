# Setly — Your Next Move

> **Start. Evolve. Thrive. Live — Your Way.**  
> Setly is a modern relocation and housing platform designed for students and newcomers to find rooms, roommates, and real communities anywhere.

---

## What is Setly?

Setly simplifies your *next move* by connecting people to verified rooms, like-minded roommates, and culturally familiar communities.  
It’s not just about finding a place — it’s about finding where you belong.

Whether you’re an international student landing in a new country or a professional relocating for work, Setly helps you:
- **Find rooms** near universities or workplaces  
- **Connect with roommates** who share your lifestyle  
- **Explore communities** that feel like home  

---

## Key Features (MVP-1)

| Category | Feature | Description |
|-----------|----------|-------------|
| **Search** | University-based listings | Find rooms near your university or city |
| **Discovery** | Smart filters | Vegetarian, Non-smoking, Pets OK, Budget, Furnished, etc. |
| **Messaging** | In-app chat (mock) | Connect safely with listers and roommates |
| **Listing Flow** | Multi-step “Post a Room” | Add photos, rules, and preferences |
| **Trust Layer** | Verification & privacy | Hide personal info until both parties connect |
| **Persistence** | Local storage + mock API | Smooth UX during MVP testing |
| **Design** | Minimal dark theme | Built with Tailwind + Angular Signals |
| **Media Uploads** | Reliable image + video | S3 presigned posts with local dev fallback & retry overlay |
| **Location Intelligence** | Unified Google Places input | Autocomplete + details + text search + fuzzy universities |
| **Performance** | Caching + abort | In-memory LRU + request cancellation prevents race conditions |
| **Accessibility** | ARIA-enhanced suggestions | Live region + listbox roles for screen readers |
| **Consistency** | Canonical roomId lifecycle | init UUID reused on publish for stable asset grouping |

---

## Tech Stack

**Frontend:**  
- [Angular 17](https://angular.dev) (Standalone Components + Signals)  
- [TailwindCSS](https://tailwindcss.com)  
- [TypeScript](https://www.typescriptlang.org)  
- Google Places API (proxied backend)  

**Backend (Planned for MVP-2):**  
- Node.js + Express or NestJS  
- MongoDB / Firebase (cloud-hosted data layer)  
- Prisma + PostgreSQL prototype  
- AWS S3 (media uploads)  

**Other Tools:**  
- Stripe (for reservation payments — Beta)  
- AWS / Vercel (deployment)  
- Figma (UI design)  

---

## Project Structure
src/
┣ app/
┃ ┣ core/              # models, services, stores
┃ ┣ pages/             # home, browse, post, messages, profile
┃ ┣ shared/            # reusable UI components
┃ ┗ layout/            # navbar, footer, global layout
┣ assets/branding/     # logo + icons
┗ environments/

---

## Roadmap

### MVP-1 (Now)
- Landing page (Hero + search + filters)
- Browse + filters + mock data
- Post a Room (multi-step form)
- Auth mock + local persistence

### MVP-2 (Next)
- Real database + API integration  
- Live chat with notifications  
- Reservation flow with Stripe integration  
- Recommendation engine (match roommates)
- Video thumbnail pipeline (ffmpeg + Lambda trigger)  
- Institution geocode enrichment endpoint  
- Server-side media validation (limit + type enforcement)  

### MVP-3 (Future)
- Move-in services (Wi-Fi, utilities, movers)  
- Partner onboarding (universities, housing networks)  
- Global expansion for student relocation  
- Predictive search ranking (semantic + popularity weighting)  

---

## Contributing

Setly is at an early stage (MVP-1).  
If you’re a developer, designer, or student who wants to be part of the journey — feel free to:
1. Fork the repo  
2. Create a feature branch  
3. Submit a pull request  

We believe in community-driven growth — just like our users. 🌱  

---
## Location & Search Architecture

### Overview
All address / place fields use a single Angular component: `GooglePlaceInputComponent`.

### Flow
1. User types → debounced (325ms) input.
2. Component calls backend `/api/places/autocomplete` (session token passed).
3. If sparse (<3) or university intent, backend injects fuzzy institution predictions (Levenshtein over `us_institutions.json`).
4. If still empty, component triggers fallback `/api/places/textsearch` and synthesizes predictions.
5. On selection, component optionally calls `/api/places/details` for precise lat/lng then resets session & clears caches.

### Performance
- Abortable requests: new query unsubscribes prior observable to avoid stale overwrites.
- LRU caches (max 50) for autocomplete/text search minimize repeat upstream calls.

### Accessibility
- ARIA roles: `combobox`, `listbox`, `option`; live region announces count or absence of suggestions.
- Keyboard: Arrow keys cycle; Enter selects; Escape closes.

### Canonical Room ID Lifecycle
- `POST /api/rooms/init` issues UUID used in S3 object keys.
- Publish reuses same ID ensuring stable grouping & easy diff updates.

### Media Upload Reliability
- Local dev fallback (no AWS): direct local endpoints replace presigned posts.
- Validation codes (e.g. `min-photos`, `too-many-videos`) provide granular UI feedback.
- Video uploads gated by feature flag; server enforces max count & type (mp4/webm).

### Fuzzy Institution Endpoint
- `/api/places/institution?name=` pipeline: exact | fuzzy | Google text search | synthetic fallback.
- Deterministic pseudo coordinates generated when dataset lacks lat/lng.

### Future Enhancements
- Semantic ranking (popularity, recency, distance weighting).
- Persistent cache keyed by normalized query + session.
- Real institution geocodes pre-seeded.
- Background video thumbnail generation on finalize.

### Feature Flags
- `enableRoomVideo` – toggles video UI.
- `forceLocalUploads` – forces local storage uploads.
- Amenity suggestions flag – conditional chips UI.

### Testing Strategy (Planned)
- Unit: caching abort logic, fuzzy institution injection, canonical roomId reuse.
- E2E: Playwright covers assistant widget, listing creation, permissions.
---

---

## Vision

> “To make relocation effortless — helping people *start, evolve, and thrive* wherever life takes them.”

Setly isn’t about *settling down*.  
It’s about empowering individuals to live their next chapter — confidently and connected.  

---

## About the Name

**S**tart · **E**volve · **T**hrive · **L**ive · **Y**our way.  
Each letter in **Setly** represents progress — from the moment you start a new journey to building the life you dream of.  

---

## Live Preview (coming soon)
> 🔗 [setly.in](https://setly.in) &nbsp;&nbsp;|&nbsp;&nbsp; [setly.net](https://setly.net)

---

## Auth (Google) — Local Dev Guide

Prereqs
- Create or use a Firebase project (the repo currently points to `setly-fire`).
- In Firebase Console → Authentication → Sign-in method, enable Google.
- Add Authorized domains: `localhost` and your local IP if needed.

Frontend setup
- Ensure `src/environments/environment.development.ts` has valid `firebase` config and `featureFlags.softDisableAuth: false`.
- Start the app:

	```bash
	cd SETLY/Setly-Code/setly
	npm install
	npm start
	```

Usage
- Visit http://localhost:4200/auth/sign-in
- Click “Continue with Google”
- On first sign-in, a Firestore user document is auto-created; you’ll be redirected to the home page.

Backend API (optional; for protected endpoints)
- Requires Firebase ID token (added automatically by the app via interceptor).
- Requires AWS env vars for uploads route: `AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME`.
- Run:

	```bash
	cd SETLY/Setly-Code/backend
	npm install
	npm run dev
	```

Troubleshooting
- “Popup blocked”: Allow popups for localhost in your browser.
- “Firebase not configured”: Check `environment.development.ts` has `firebase.apiKey` etc.
- “Invalid token” (backend): Ensure the frontend attached Authorization header (check DevTools → Network). If missing, sign out/in.
- Playwright E2E doesn’t perform real Google OAuth. Tests check UI and guard redirects. A mocked or emulator-based flow can be added next.

---

## Screenshots

| Landing | Browse | Post a Room | Messages |
|----------|---------|--------------|-----------|
| ![Landing](assets/screenshots/landing.png) | ![Browse](assets/screenshots/browse.png) | ![Post](assets/screenshots/post.png) | ![Messages](assets/screenshots/messages.png) |

---

## 👨‍💻 Built by
**Kiran Revally**  
Founder, **Setly HQ**  
🌐 [LinkedIn](https://www.linkedin.com/company/setlyhq/) · [GitHub](https://github.com/setlyhq)

---

## License
© 2025 Setly HQ. All rights reserved.  
This project is licensed under the [MIT License](LICENSE).

---

### TL;DR
Setly helps you **find where you belong** — one move at a time.  
*Your Next Move Starts Here.*
