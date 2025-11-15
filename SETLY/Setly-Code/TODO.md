# Phone Number Verification with OTP Implementation

## Backend Changes
- [ ] Add User model to Prisma schema with phone_verified field
- [ ] Run prisma migrate to update database
- [ ] Create phone.service.ts for OTP sending/verification logic
- [ ] Create phone.controller.ts for API endpoints
- [ ] Add phone routes to routes/phone.routes.ts
- [ ] Integrate phone routes into server.ts

## Frontend Changes
- [ ] Update User interface to include phone_verified
- [ ] Modify profile-edit-form.component.ts to add phone verification flow
- [ ] Add confirmation modal component for phone number
- [ ] Add OTP input modal component
- [ ] Add phone validation logic (basic format check)
- [ ] Add OTP sending and verification service calls
- [ ] Update verification status component to show phone verified state
- [ ] Add green tick icon next to phone field when verified
- [ ] Handle phone number changes (reset verification on edit)

## Testing
- [ ] Test phone format validation
- [ ] Test confirmation modal flow
- [ ] Test OTP sending and verification
- [ ] Test error handling for invalid OTP
- [ ] Test resend OTP functionality
- [ ] Test phone number change resets verification
- [ ] Test Save button enabled only after verification
