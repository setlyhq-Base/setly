# Firebase & Google OAuth Configuration - Action Required

## 🔥 Issue #3: Google Sign-In / Firebase OAuth Domain Authorization

Your Google Sign-In is failing because `setly.in` and `www.setly.in` are not authorized in your Firebase/Google Cloud project.

### Steps to Fix:

#### 1. **Firebase Console - Authorized Domains**
1. Go to: https://console.firebase.google.com/project/setly-fire/authentication/settings
2. Click the **"Authorized domains"** tab
3. Click **"Add domain"** and add each of these:
   ```
   setly.in
   www.setly.in
   feat-monorepo-setup.deqnp4pj84hzp.amplifyapp.com
   ```
4. Click **"Save"**

#### 2. **Google Cloud Console - OAuth Consent Screen**
1. Go to: https://console.cloud.google.com/apis/credentials/consent?authuser=2&project=setly-fire
2. Under **"Authorized domains"**, add:
   ```
   setly.in
   ```
3. Update these fields if not already set:
   - **Application home page**: `https://setly.in`
   - **Application privacy policy link**: `https://setly.in/privacy`
   - **Application terms of service link**: `https://setly.in/terms`
4. Click **"Save"**

#### 3. **Google Cloud Console - OAuth 2.0 Client IDs**
1. Go to: https://console.cloud.google.com/apis/credentials?authuser=2&project=setly-fire
2. Find your **Web client** OAuth 2.0 Client ID (should be linked to Firebase)
3. Click **"Edit"** (pencil icon)
4. Under **"Authorized JavaScript origins"**, add:
   ```
   https://setly.in
   https://www.setly.in
   https://feat-monorepo-setup.deqnp4pj84hzp.amplifyapp.com
   ```
5. Under **"Authorized redirect URIs"**, add:
   ```
   https://setly.in/__/auth/handler
   https://www.setly.in/__/auth/handler
   https://feat-monorepo-setup.deqnp4pj84hzp.amplifyapp.com/__/auth/handler
   ```
6. Click **"Save"**

### Why This Matters:
- Google OAuth requires all domains to be explicitly whitelisted for security
- Firebase uses the `/__/auth/handler` path for OAuth callbacks
- Without these settings, users will see: **"Sign-in not enabled for this domain"**

### Verification:
After adding these domains, test Google Sign-In at:
- https://setly.in
- https://www.setly.in

The OAuth flow should work without domain errors.

---

## ✅ Issues Already Fixed in Code (Deployed Automatically)

### Issue #1: Service Worker (FIXED ✅)
- **Problem**: Service worker was trying to load but file didn't exist, causing infinite 404 loop
- **Solution**: Disabled service worker registration in `main.ts` (commented out)
- **Status**: Will be re-enabled once we add proper PWA build configuration
- **Commit**: 9a7a206

### Issue #2: API Base URL (FIXED ✅)
- **Problem**: Frontend was calling `/api/users/me` on `setly.in` domain, returning 404
- **Solution**: Created `ApiBaseUrlInterceptor` that rewrites all `/api/*` calls to `https://api.setly.com/v1/*`
- **How it works**:
  - Development: `/api/users/me` → Proxy to `localhost:3000/api/users/me`
  - Production: `/api/users/me` → `https://api.setly.com/v1/users/me`
- **Status**: Deployed - will take effect on next Amplify build
- **Commit**: 2f36b15

### Issue #4: Google Maps Async Warning (ALREADY CORRECT ✅)
- **Problem**: Warning about Maps script loading without async
- **Current State**: Script in `index.html` already has `async defer` attributes:
  ```html
  <script async defer src="https://maps.googleapis.com/maps/api/js?..."></script>
  ```
- **Status**: No action needed - warning is non-critical and script is already optimized
- **Note**: This is a Google Maps API informational warning, not an error

---

## 📋 Summary

**Manual Actions Required (You must do these):**
- [ ] Add `setly.in` and `www.setly.in` to Firebase Authorized Domains
- [ ] Add domains to Google Cloud OAuth Consent Screen
- [ ] Add JavaScript origins and redirect URIs to OAuth Client ID

**Automatic Fixes (Already deployed via git push):**
- [x] Service worker disabled to stop 404 loop
- [x] API base URL interceptor created to fix `/api/*` calls
- [x] Google Maps script already using async/defer

**Expected Result After Manual Steps:**
- ✅ No more 404 errors in console
- ✅ Google Sign-In works on setly.in
- ✅ API calls go to https://api.setly.com/v1
- ✅ Console is clean and app functions normally

---

## 🚀 Next Steps

1. Complete the manual Firebase/Google OAuth configuration above
2. Wait for Amplify to complete the current deployment (commit 2f36b15)
3. Test at https://setly.in - all errors should be resolved
4. If API backend is not running, `/api/users/me` will still return errors but from the correct URL

**Questions?** Let me know once you've completed the Firebase setup!
