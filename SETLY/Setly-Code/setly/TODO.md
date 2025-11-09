# Post Room Wizard Implementation TODO

## Services Updates
- [x] Add `create()` method to RoomsService
- [x] Add draft persistence methods (`saveDraft`, `loadDraft`) to RoomStoreService

## Step Components Creation
- [x] Create `room-details-step.component.ts` (Step 1: title, description, location, university, room type, amenities)
- [x] Create `photos-step.component.ts` (Step 2: photo upload using S3UploadService)
- [x] Create `pricing-step.component.ts` (Step 3: price, submit)

## Main Page Refactor
- [x] Refactor `post-room.page.ts` to wizard logic with signals (`currentStep`, `formData`)
- [x] Implement draft loading/saving to localStorage
- [x] Update progress indicator to be dynamic based on `currentStep`
- [x] Add step navigation with validation
- [x] Add analytics tracking for step changes, photo uploads, publish

## Validation and UX
- [x] Implement form validation with inline helper text
- [x] Ensure responsive design
- [x] Add accessibility features (ARIA labels, keyboard navigation, focus management)

## Testing
- [ ] Test wizard flow, draft persistence, publish functionality
- [ ] Ensure no console errors
