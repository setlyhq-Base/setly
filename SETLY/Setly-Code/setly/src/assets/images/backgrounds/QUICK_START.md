# Quick Start: Adding Background Images

## What You Need
3 high-quality images for the search card backgrounds.

## Image Names (EXACT)
```
bg-rooms.jpg
bg-rides.jpg
bg-marketplace.jpg
```

## Where to Place Them
```
src/assets/images/backgrounds/
```

## Image Requirements
- **Size**: 1920x1080px minimum
- **Format**: JPG (preferred) or PNG
- **File Size**: Under 500KB each
- **Quality**: High-resolution, professional photography

---

## Image Theme Guide

### 🏠 bg-rooms.jpg
**Theme**: Moving in / Finding roommates
**Examples**:
- Person giving keys to another person
- Friends moving furniture together
- Roommates laughing on a couch
- Cozy, welcoming room interior

**Search Terms** (Unsplash/Pexels):
- "giving keys"
- "roommates laughing"
- "moving apartment"
- "friends couch"
- "cozy room interior"

---

### 🚗 bg-rides.jpg
**Theme**: Carpooling / Transportation
**Examples**:
- Students with luggage by a car
- Person in car using phone
- Car trunk with suitcases
- Friendly carpooling scene

**Search Terms**:
- "students car luggage"
- "carpool"
- "car trunk suitcases"
- "rideshare"
- "airport pickup"

---

### 📦 bg-marketplace.jpg
**Theme**: Buying/Selling Items
**Examples**:
- Person photographing items to sell
- "FOR SALE" box with items
- Folded clothes and furniture
- Second-hand items display

**Search Terms**:
- "selling items"
- "second hand"
- "for sale box"
- "student furniture"
- "folded clothes"
- "thrift items"

---

## Where to Get Images

### Free Stock Photos
1. **Unsplash**: https://unsplash.com
2. **Pexels**: https://pexels.com
3. **Pixabay**: https://pixabay.com

### How to Optimize Images
1. Download high-quality version
2. Resize to 1920x1080px using:
   - **Online**: TinyPNG.com or Squoosh.app
   - **Mac**: Preview (Tools → Adjust Size)
   - **Windows**: Paint or Photos app
3. Compress to reduce file size
4. Save as JPG with 80-85% quality

---

## Step-by-Step

### 1. Find Images
- Go to Unsplash or Pexels
- Search using the terms above
- Download high-quality version (usually "Large" or "Original")

### 2. Optimize
- Resize to 1920x1080px
- Compress to under 500KB
- Save as JPG

### 3. Rename & Place
```bash
# Rename files
bg-rooms.jpg
bg-rides.jpg
bg-marketplace.jpg

# Place in folder
src/assets/images/backgrounds/
```

### 4. Test
```bash
# Run the app
ng serve

# Open browser
http://localhost:4200/search

# Click tabs to see backgrounds change
```

---

## Recommended Specific Images

If you want exact recommendations, search for these on Unsplash:

### For Rooms:
- Search: "person giving keys" → Pick a friendly, welcoming photo
- Photo IDs that work well: Look for bright, modern interiors

### For Rides:
- Search: "students car luggage" → Pick one with happy students
- Alternative: "carpool" or "rideshare"

### For Marketplace:
- Search: "second hand items" → Pick organized, clean display
- Alternative: "for sale box" or "thrift store"

---

## Troubleshooting

### Images not showing?
1. Check file names are EXACTLY: `bg-rooms.jpg`, `bg-rides.jpg`, `bg-marketplace.jpg`
2. Verify they're in: `src/assets/images/backgrounds/`
3. Restart dev server: Stop `ng serve` and run it again
4. Clear browser cache: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Text hard to read?
- Use lighter, brighter images
- Avoid very dark or busy backgrounds
- The white overlay will help, but start with lighter images

### File too large?
- Use TinyPNG.com to compress
- Reduce dimensions to exactly 1920x1080
- Save as JPG instead of PNG
- Lower JPG quality to 80%

---

## Current Status

✅ Code is complete and ready
⏳ Waiting for images to be added
📁 Directory created: `src/assets/images/backgrounds/`
📝 README placed in directory with full instructions

Once you add the three images, the feature will work automatically - no additional code changes needed!

---

**Need help?** Check the full documentation:
`DYNAMIC_BACKGROUNDS_IMPLEMENTATION.md`
