# Dev Tools (Dummy Data)

This repo is designed so local development and Playwright E2E never depend on real backend data.

## Requirements

- Works only when `environment.featureFlags.useDummyData=true`.
- Never available in production builds (`environment.production=true`).
- Does **not** touch the real Lambda/MongoDB/S3 backend.

## Open the Dev Tools page

In dev (or E2E), open:

- `http://localhost:4200/dev-tools`

You’ll see a single action:

- **Reset demo data** — clears dummy rooms, rides, marketplace items, and users, then reseeds:
  - 50 users
  - 30 rooms
  - 30 rides
  - 20 marketplace items

## Console helper

A global helper is registered in dev/dummy mode:

- `window.setlyResetDummyData()`

Optional:

- `window.setlyResetDummyData({ reload: false })` (default is `reload: true`)

## Implementation notes

- Route: `src/app/app.routes.ts` (`/dev-tools`, guarded by `DevOnlyGuard`)
- UI: `src/app/features/dev-tools/dev-tools.page.ts`
- Reset orchestrator: `src/app/core/services/demo-data-reset.service.ts`
