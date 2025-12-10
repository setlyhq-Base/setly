# API Keys Setup Guide

## Required API Keys for Explore Page

### 1. Google Maps API Key (Already Configured ✅)
**Status**: Active  
**Key**: `AIzaSyCFLTEaQ9rLghZ4hUG6LPXSkS7SEka5vYY`  
**Used For**:
- Place autocomplete (city search)
- Nearby search (restaurants, places, activities, nightlife)
- Place details (coordinates, photos)
- Geocoding (reverse lookup)

**Permissions Required**:
- Places API
- Geocoding API
- Maps JavaScript API

---

### 2. Ticketmaster API Key (Optional - Recommended)
**Status**: Not configured  
**Get Your Key**: https://developer.ticketmaster.com/

#### Setup Steps:
1. Go to https://developer.ticketmaster.com/
2. Click "Get Your API Key" or "Sign Up"
3. Create an account (free)
4. Create a new app:
   - App Name: "Setly Events"
   - Description: "Event discovery for college students"
5. Copy your API Key (Consumer Key)
6. Add to `backend/.env`:
   ```
   TICKETMASTER_API_KEY=your_consumer_key_here
   ```

#### API Limits (Free Tier):
- 5,000 API calls per day
- Rate limit: 5 requests per second
- Sufficient for development and small-scale production

#### What It Provides:
- Live concerts and shows
- Sports events
- Theater performances
- Festivals and fairs
- Comedy shows
- Family events
- Official ticket links
- Venue information
- Pricing details

---

### 3. Eventbrite API Key (Optional - Recommended)
**Status**: Not configured  
**Get Your Key**: https://www.eventbrite.com/platform/

#### Setup Steps:
1. Go to https://www.eventbrite.com/platform/
2. Sign up or log in
3. Go to Account Settings → App Management
4. Click "Create New App"
   - Application URL: `http://localhost:4200` (for dev)
   - OAuth Redirect URI: `http://localhost:4200/callback` (can be dummy)
5. Copy your "Private Token"
6. Add to `backend/.env`:
   ```
   EVENTBRITE_API_KEY=your_private_token_here
   ```

#### API Limits (Free Tier):
- 1,000 API calls per hour
- No daily limit on free public event searches
- Sufficient for most use cases

#### What It Provides:
- Community events
- Workshops and classes
- Networking events
- Fundraisers
- Student organization events
- Free events
- Paid events with registration links

---

## Fallback Strategy (No API Keys Needed)

If you don't configure Ticketmaster or Eventbrite, the system **automatically falls back** to Google Places API for events. The Explore page will still work, you'll just see:

**With APIs**:
- 20-50 events from Ticketmaster
- 20-50 events from Eventbrite
- Total: 40-100 events per search

**Without APIs (Fallback)**:
- 10-20 event venues from Google Places (stadiums, theaters, etc.)
- Still functional, just fewer events

---

## Testing Without Keys

You can test the entire Explore page without Ticketmaster/Eventbrite:

1. **City Search**: Works (uses Google Places Autocomplete)
2. **Restaurants**: Works (uses Google Places)
3. **Places**: Works (uses Google Places)
4. **Activities**: Works (uses Google Places)
5. **Nightlife**: Works (uses Google Places)
6. **Events**: Works with fallback (uses Google Places for venues)

**Only difference**: Events section will show venues instead of specific events.

---

## Backend Configuration

Edit `backend/.env`:

```dotenv
# Google Maps API Key (Already configured ✅)
GOOGLE_MAPS_API_KEY=AIzaSyCFLTEaQ9rLghZ4hUG6LPXSkS7SEka5vYY

# Event APIs (Optional but recommended)
TICKETMASTER_API_KEY=your_key_here
EVENTBRITE_API_KEY=your_token_here
```

After adding keys:
1. Restart the backend server
2. Check logs for API initialization messages
3. Test the Events tab in Explore page

---

## Checking If APIs Are Working

### In Browser Console:
Look for these logs when loading Events:

**With APIs**:
```
[Events] Found 45 unique events (25 from Ticketmaster, 20 from Eventbrite)
```

**Without APIs (Fallback)**:
```
[Events] Ticketmaster API key not configured
[Events] Eventbrite API key not configured
[Explore] Falling back to Google Places for events
```

### In Backend Terminal:
```
[API] Ticketmaster API configured ✓
[API] Eventbrite API configured ✓
[Events] Fetching events for location: 42.7654, -71.4676
```

---

## Cost Breakdown

### Google Maps API
**Current Usage**: Moderate (autocomplete + nearby searches)  
**Estimated Cost**: $0-50/month (with current traffic)  
**Free Tier**: $200 credit per month  

### Ticketmaster API
**Cost**: FREE  
**Limits**: 5,000 calls/day  
**Estimated Usage**: 100-500 calls/day  

### Eventbrite API
**Cost**: FREE  
**Limits**: 1,000 calls/hour  
**Estimated Usage**: 50-200 calls/hour (peak)  

**Total Monthly Cost**: ~$0-50 (only if Google Maps exceeds free tier)

---

## Security Best Practices

✅ **API Keys in .env File**:
- Never commit `.env` to Git
- Already in `.gitignore`
- Use environment variables in production

✅ **Backend Proxy**:
- All API keys stay on backend
- Frontend never sees API keys
- Prevents key theft from client-side

✅ **Rate Limiting**:
- Backend implements rate limiting
- Prevents abuse and excessive costs
- 300 requests per minute per IP

✅ **Error Handling**:
- Graceful fallbacks if APIs fail
- User never sees API errors
- Logs for debugging

---

## Quick Start (Development)

### Option 1: Full Setup (Recommended)
1. Get all three API keys
2. Add to `backend/.env`
3. Restart backend: `cd backend && npm run dev`
4. Test Explore page with full features

### Option 2: Minimal Setup (Fastest)
1. Use existing Google Maps API key (already configured)
2. Skip Ticketmaster and Eventbrite
3. Use fallback mode for events
4. Still 90% functional

---

## Production Checklist

Before deploying to production:

- [ ] Google Maps API key configured
- [ ] Google Maps billing enabled (to avoid quota errors)
- [ ] Ticketmaster API key configured (optional)
- [ ] Eventbrite API key configured (optional)
- [ ] All keys in production `.env` file
- [ ] Backend environment variables set on hosting platform
- [ ] API keys secured (not in Git)
- [ ] Rate limiting enabled
- [ ] Error monitoring configured

---

## Support

If you encounter issues:

1. Check backend logs for API errors
2. Verify API keys are correct in `.env`
3. Restart backend server after adding keys
4. Check browser console for frontend errors
5. Verify API quotas haven't been exceeded

Need help? Check the API documentation:
- **Google Maps**: https://developers.google.com/maps/documentation
- **Ticketmaster**: https://developer.ticketmaster.com/products-and-docs/apis/getting-started/
- **Eventbrite**: https://www.eventbrite.com/platform/api

---

**Ready to Go!** 🚀

The Explore page is configured to work immediately with Google Places. Add Ticketmaster and Eventbrite keys for the full experience with real events.
