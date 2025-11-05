# Firebase Authentication Migration TODO

## Phase 1: Models and Core Services ✅
- [x] Update `src/app/core/models/user.model.ts` to include all required fields (role, university, program, startDate, endDate, graduated, gradYear, company, title, domainVerified, domainType, createdAt, updatedAt)
- [x] Create `src/app/core/auth/firebase-auth.service.ts` to wrap Firebase SDK methods
- [x] Create `src/app/core/user/current-user.service.ts` with signals for merged user data
- [x] Update `src/app/core/services/auth.service.ts` to integrate new services

## Phase 2: Guards and Routing ✅
- [x] Update `src/app/core/guards/auth.guard.ts` for new logic
- [x] Create `src/app/core/guards/profile.guard.ts`
- [x] Update `src/app/app.routes.ts` to use `/auth` with guards on protected routes

## Phase 3: Auth UI Components ✅
- [x] Create `src/app/features/auth/auth.page.ts` with two-pane layout and tabs
- [x] Create `src/app/features/auth/social-buttons.component.ts`
- [x] Create `src/app/features/auth/email-signin.component.ts`
- [x] Create `src/app/features/auth/verify-code.component.ts`
- [x] Create `src/app/features/auth/profile-wizard.component.ts`

## Phase 4: Environment and Config ✅
- [x] Update `src/environments/environment.development.ts` and `environment.ts` with additional configs

## Phase 5: Backend (Cloud Functions) ✅
- [x] Create Cloud Functions: `startEmailVerification`, `confirmEmailVerification`, `upsertUserProfile`
- [x] Create Firestore Rules file

## Phase 6: Testing and Docs ✅
- [x] Update Playwright tests for auth flows
- [x] Create README with provider setup instructions
- [x] Ensure Chat Widget z-index remains high

## Phase 7: Verification and Deployment
- [ ] Install any missing dependencies
- [ ] Deploy functions and set up Firestore rules
- [ ] Run Playwright tests
- [ ] Manual testing of auth flows
