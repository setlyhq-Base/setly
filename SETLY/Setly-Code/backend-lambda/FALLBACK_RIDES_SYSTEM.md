# 🚗 Fallback Rides System - Complete Guide

## 📋 Overview

The Fallback Rides system ensures the Setly Explore page always feels active and full of content, even when there are no real user-generated posts. This creates a premium, Airbnb-like experience for new users.

## 🎯 Purpose

✅ **Never show empty Explore pages** - New users see activity immediately
✅ **Professional appearance** - Sample data looks identical to real posts
✅ **Categorized content** - Rides are tagged for Explore sections (nearby, today, shared, airport, top-rated)
✅ **Seamless blending** - Real user posts take priority; fallback fills gaps
✅ **Future-proof** - As real posts increase, fallback naturally phases out

## 🗂️ System Components

### 1. Database Schema Updates
**File**: `src/db/models/Ride.ts`

```typescript
interface IRide {
  type: 'driver' | 'seeker';        // Post type
  tags: string[];                    // nearby, today, shared, airport, top-rated
  isFallback: boolean;               // Mark as sample data
  user: {
    name: string;
    avatar?: string;
    online?: boolean;
  };
  departureTime: string;             // Pickup time
  arrivalTime?: string;              // Drop-off time (driver only)
  // ... other ride fields
}
```

**New Indexes**:
- `{ type: 1, status: 1 }` - Filter by driver/seeker
- `{ tags: 1, status: 1 }` - Category-based queries
- `{ isFallback: 1, status: 1 }` - Separate real from fallback

### 2. Fallback Data
**File**: `src/data/fallback-rides.json`

- **20 sample rides** with realistic New Jersey locations
- **Mix of driver (13) and seeker (7) posts**
- **Proper categorization**:
  - 📍 Nearby: 11 rides
  - 📅 Today: 9 rides
  - 💺 Shared: 10 rides
  - ✈️ Airport: 7 rides
  - ⭐ Top Rated: 4 rides

**Sample Ride Structure**:
```json
{
  "rideId": "fallback-ride-1",
  "type": "driver",
  "pickupAddress": "Newark Penn Station, Newark, NJ",
  "dropoffAddress": "Newark Liberty International Airport (EWR)",
  "departureTime": "6:00 AM",
  "arrivalTime": "6:25 AM",
  "seatsAvailable": 3,
  "tags": ["airport", "shared", "today"],
  "isFallback": true,
  "user": {
    "name": "Michael Chen",
    "avatar": "https://i.pravatar.cc/150?img=12",
    "online": true
  }
}
```

### 3. Seeding Script
**File**: `src/scripts/seed-fallback-rides.ts`

**Features**:
- Deletes old fallback data before inserting new
- **Dynamic dates**: Distributes rides across today + next 7 days
- **Auto-updates tags**: Adds/removes 'today' tag based on date
- Displays category breakdown after seeding

**Run Command**:
```bash
cd backend-lambda
npx tsx src/scripts/seed-fallback-rides.ts
```

**Expected Output**:
```
🚀 Starting fallback rides seeding...
✅ Connected to MongoDB
🗑️  Deleted 20 existing fallback rides
✅ Inserted 20 fallback rides

📊 Category Breakdown:
   - Nearby: 11 rides
   - Today: 9 rides
   - Shared: 10 rides
   - Airport: 7 rides
   - Top Rated: 4 rides
   - Driver Posts: 13
   - Seeker Posts: 7

✅ Fallback rides seeding complete!
```

### 4. Updated API Logic
**File**: `src/services/database.service.ts` → `searchRides()`

**Intelligent Blending Algorithm**:
```typescript
1. Fetch real user rides (limit: 50)
2. If real rides < 10 AND includeFallback = true:
   - Fetch fallback rides to fill gap (at least 20)
3. Blend: [real rides first, then fallback rides]
4. Limit total to 100 rides
5. Return with proper field mapping
```

**New Filter Options**:
- `tag` - Filter by category (nearby, today, shared, airport, top-rated)
- `includeFallback` - Whether to include sample data (default: true)

**Field Mapping** (backend → frontend):
```typescript
{
  from: pickupAddress,
  to: dropoffAddress,
  postType: type,
  driver: type === 'driver' ? user : undefined,
  author: type === 'seeker' ? user : undefined,
}
```

### 5. API Routes
**File**: `src/routes/rides.routes.ts`

**Updated Endpoint**:
```
GET /api/rides?tag=nearby&includeFallback=true
```

**Response**:
```json
{
  "count": 15,
  "rides": [...],
  "hasFallback": true
}
```

## 🖼️ Image System

### S3 Folder Structure
```
s3://setly-s3-bucket/fallback/rides/
├── airport-ride-1.jpg (5 total)
├── city-ride-1.jpg (3 total)
├── campus-ride-1.jpg (2 total)
├── shopping-ride-1.jpg
├── long-distance-1.jpg
└── fun-ride-1.jpg
```

### Avatar Images
- Uses **Pravatar.cc** CDN: `https://i.pravatar.cc/150?img={1-70}`
- Reliable, free, and diverse avatar collection
- No S3 storage needed for user avatars

### Setup Guide
See: `src/scripts/FALLBACK_RIDE_IMAGES_SETUP.ts`

**Quick Upload** (AWS CLI):
```bash
aws s3 cp ./ride-images/ s3://setly-s3-bucket/fallback/rides/ \
  --recursive \
  --acl public-read \
  --content-type image/jpeg
```

## 🚀 Deployment Steps

### 1. Update Database Schema
The schema updates are already in `src/db/models/Ride.ts`. MongoDB will auto-migrate on first use.

### 2. Seed Fallback Data
```bash
cd backend-lambda
npx tsx src/scripts/seed-fallback-rides.ts
```

### 3. Upload Images (Optional but Recommended)
Follow guide in `src/scripts/FALLBACK_RIDE_IMAGES_SETUP.ts`

### 4. Deploy Backend
```bash
# Build and deploy Lambda functions
npm run build
# Deploy via AWS SAM/CDK or your deployment method
```

### 5. Test API
```bash
# Test nearby rides with fallback
curl https://your-api.com/api/rides?tag=nearby

# Test without fallback
curl https://your-api.com/api/rides?includeFallback=false

# Test airport rides
curl https://your-api.com/api/rides?tag=airport
```

## 📱 Frontend Integration

The frontend already expects this data structure from the ride card component:

```typescript
// Ride object structure
{
  id: string;
  type: 'driver' | 'seeker';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime?: string;
  tags: string[];
  user: {
    name: string;
    avatar: string;
    online: boolean;
  };
  driver?: { ... };  // for driver posts
  author?: { ... };  // for seeker posts
}
```

**No frontend changes needed** - The API now returns data in this exact format.

## 🔄 Maintenance

### Update Dates
Fallback rides are dated dynamically (today + 7 days). Re-run seeding periodically:

```bash
# Recommended: Weekly cron job
0 0 * * 0 cd /path/to/backend-lambda && npx tsx src/scripts/seed-fallback-rides.ts
```

### Add More Rides
1. Edit `src/data/fallback-rides.json`
2. Add new ride objects with proper tags
3. Re-run seeding script

### Replace Images
1. Upload new images to S3 with same filenames
2. OR update image URLs in `fallback-rides.json`
3. Re-run seeding script if URLs changed

## 📊 Analytics

Track fallback usage in your analytics:

```typescript
// Log when fallback rides are shown
if (response.hasFallback) {
  analytics.track('fallback_rides_shown', {
    count: response.count,
    tag: tag,
  });
}
```

This helps you understand:
- When fallback data is needed most
- Which categories lack real content
- Growth of organic user posts over time

## 🎯 Success Metrics

**Before Fallback System**:
- ❌ Empty Explore pages for new users
- ❌ No content in specific categories
- ❌ Poor first impression

**After Fallback System**:
- ✅ Always 10+ rides visible
- ✅ All categories populated
- ✅ Professional, active appearance
- ✅ Seamless blend of real + fallback

## 🔐 Security Notes

- Fallback rides use `isFallback: true` flag
- Easy to filter out in analytics
- Clear separation from real user data
- No PII or sensitive information

## 🛠️ Troubleshooting

### Issue: No fallback rides appearing
**Solution**: Check `includeFallback` param is true (default)

### Issue: Images not loading
**Solution**: Verify S3 bucket permissions and CORS settings

### Issue: Dates are stale
**Solution**: Re-run seeding script to refresh dates

### Issue: Too many fallback rides
**Solution**: Set `includeFallback=false` or wait for more real posts

## 📚 Related Files

- `src/db/models/Ride.ts` - Schema definition
- `src/data/fallback-rides.json` - Sample data
- `src/scripts/seed-fallback-rides.ts` - Seeding script
- `src/services/database.service.ts` - API logic
- `src/routes/rides.routes.ts` - API endpoints
- `src/scripts/FALLBACK_RIDE_IMAGES_SETUP.ts` - Image guide

## ✅ Checklist

- [ ] Schema updated with new fields
- [ ] Fallback data created (20 rides)
- [ ] Seeding script run successfully
- [ ] Images uploaded to S3 (optional)
- [ ] Backend deployed
- [ ] API tested with tag filters
- [ ] Frontend displays fallback rides correctly
- [ ] Analytics tracking added
- [ ] Scheduled seeding cron job (optional)

---

**🎉 Result**: A premium, never-empty Explore experience that scales from 0 to millions of users.
