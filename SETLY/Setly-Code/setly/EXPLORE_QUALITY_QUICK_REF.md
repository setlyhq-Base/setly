# Explore Page - Quality Control Quick Reference

## 🎯 Quality Standards (Always Enforced)

### Events (Ticketmaster/Eventbrite):
- ✅ Must have: name, venue, date, image, confirmed status
- ✅ Distance calculated with Haversine formula
- ✅ Sorted by: distance → date
- ✅ Deduplicated across both sources
- ⚙️ **Fallback**: If < 8 events at 50mi → expand to 75mi → up to 100mi max

### Restaurants/Places (Google Places):
- ✅ **Rating**: Must be ≥ 4.2 stars ⭐
- ✅ **Reviews**: Must have ≥ 10 reviews
- ✅ **Photos**: Must have at least 1 photo
- ✅ **Address**: Must have valid address
- ✅ **Status**: Must be operational
- ⚙️ **Fallback**: If < 6 places at 5km → expand to 10km → up to 25km max

---

## 📏 Row Display Rules

### Minimum Threshold:
```
MIN_ROW_ITEMS = 4 cards
```

### Behavior:
- ✅ Row shown: ≥ 4 high-quality cards
- ❌ Row hidden: < 4 cards (automatic)

### Example:
```
"Career & Tech Events Near Nashua"
  - If only 2 events found → ROW HIDDEN
  - If 4+ events found → ROW DISPLAYED
```

---

## 🔧 Configurable Settings

### In `explore.page.ts`:
```typescript
private readonly MIN_ROW_ITEMS = 4;  // Adjust to change threshold
```

### In `explore-data.service.ts`:
```typescript
// Quality thresholds
MINIMUM_QUALITY_RATING = 4.2;  // Star rating floor
MINIMUM_REVIEWS = 10;          // Review count floor

// Fallback thresholds  
MIN_ITEMS = 6;     // Places/restaurants
MIN_EVENTS = 8;    // Events

// Max radius
MAX_RADIUS = 25000;  // 25km for places
MAX_RADIUS = 100;    // 100 miles for events
```

---

## 🧪 Testing Cities

### Small City (Nashua, NH):
- **Lat**: 42.7654
- **Lng**: -71.4676
- **Expected**: Fallback triggers, pulls from Greater Boston area
- **Test**: `curl "http://localhost:3000/api/events/search?lat=42.7654&lng=-71.4676&radius=25"`

### Medium City (Boston, MA):
- **Lat**: 42.3601
- **Lng**: -71.0589
- **Expected**: Rich local content, minimal fallback
- **Test**: `curl "http://localhost:3000/api/events/search?lat=42.3601&lng=-71.0589&radius=25"`

### Large City (NYC):
- **Lat**: 40.7128
- **Lng**: -74.0060
- **Expected**: Abundant content, no fallback needed
- **Test**: `curl "http://localhost:3000/api/events/search?lat=40.7128&lng=-74.0060&radius=25"`

---

## 🐛 Debugging Checklist

### If you see empty rows:
1. ✅ Check browser console for API errors
2. ✅ Verify backend running on port 3000
3. ✅ Test API directly with curl
4. ✅ Check MIN_ROW_ITEMS threshold (maybe too high)
5. ✅ Verify quality filters aren't too strict

### If you see "undefined" in cards:
1. ✅ Check card template has `*ngIf` directives
2. ✅ Verify data transformation in service
3. ✅ Check browser console for data structure

### If rows show low-quality places:
1. ✅ Check MINIMUM_QUALITY_RATING value
2. ✅ Check MINIMUM_REVIEWS value  
3. ✅ Verify transformToExploreItems() filters

---

## 📊 Success Criteria

### Data Quality:
- [ ] All visible restaurants: ≥ 4.2 stars
- [ ] All visible restaurants: ≥ 10 reviews
- [ ] All visible restaurants: Have photos
- [ ] All visible events: Have complete info
- [ ] Zero "undefined" or null displays

### User Experience:
- [ ] Zero empty rows visible
- [ ] Each visible row: ≥ 4 cards
- [ ] Small cities: Still show rich content
- [ ] Large cities: Show local content first
- [ ] Smooth scrolling, no jank

### Performance:
- [ ] API calls cached (5 min)
- [ ] No duplicate API calls
- [ ] Images lazy-loaded
- [ ] No layout shifts

---

## 🚀 Common Adjustments

### To show more rows (lower quality bar):
```typescript
MIN_ROW_ITEMS = 3  // Allow 3-card rows
MINIMUM_QUALITY_RATING = 4.0  // Lower rating threshold
MINIMUM_REVIEWS = 5  // Lower review threshold
```

### To show fewer, premium-only rows:
```typescript
MIN_ROW_ITEMS = 6  // Require 6+ cards
MINIMUM_QUALITY_RATING = 4.5  // Only excellent venues
MINIMUM_REVIEWS = 50  // Must be well-established
```

### To expand search faster:
```typescript
// In getNearbyPlaces()
if (items.length < MIN_ITEMS && radius < 50000) {  // 50km instead of 25km
  const newRadius = Math.min(radius * 3, 50000);  // Triple instead of double
  ...
}
```

---

## 📝 Current Settings (Production)

```typescript
// Row Display
MIN_ROW_ITEMS = 4

// Quality Standards
MINIMUM_QUALITY_RATING = 4.2 ⭐
MINIMUM_REVIEWS = 10

// Fallback Thresholds
MIN_ITEMS = 6 (places/restaurants)
MIN_EVENTS = 8 (events)

// Max Search Radius
MAX_RADIUS_PLACES = 25km
MAX_RADIUS_EVENTS = 100 miles

// Initial Search Radius
DEFAULT_RADIUS_PLACES = 5km
DEFAULT_RADIUS_EVENTS = 50 miles
```

---

## 🔍 Quick Test Commands

```bash
# Test events (Nashua)
curl "http://localhost:3000/api/events/search?lat=42.7654&lng=-71.4676&radius=25"

# Test restaurants (Nashua)
curl "http://localhost:3000/api/places/nearby?location=42.7654,-71.4676&radius=5000&type=restaurant"

# Test events (Boston)
curl "http://localhost:3000/api/events/search?lat=42.3601&lng=-71.0589&radius=25"

# Test restaurants (Boston)
curl "http://localhost:3000/api/places/nearby?location=42.3601,-71.0589&radius=5000&type=restaurant"

# Count quality restaurants
curl -s "http://localhost:3000/api/places/nearby?location=42.3601,-71.0589&radius=5000&type=restaurant" | python3 -c "import sys, json; r=json.load(sys.stdin)['results']; print(f'Total: {len(r)}'); print(f'4.2+: {len([x for x in r if x.get(\"rating\",0)>=4.2])}'); print(f'10+ reviews: {len([x for x in r if x.get(\"user_ratings_total\",0)>=10])}')"
```

---

## ✅ Verification Steps

Before deployment:
1. ✅ Test with 3+ different cities (small, medium, large)
2. ✅ Verify no empty rows visible
3. ✅ Check all cards have ≥ 4.2 star ratings
4. ✅ Confirm no "undefined" text anywhere
5. ✅ Test location change (cache clears properly)
6. ✅ Verify backend APIs responding < 2 seconds
7. ✅ Check browser console for errors
8. ✅ Test on mobile (responsive layout)
