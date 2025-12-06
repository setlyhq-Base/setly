# Background Images for Search Card

This directory contains the background images that are displayed in the search card based on the active tab.

## Required Images

Place the following three images in this directory:

### 1. bg-rooms.jpg
**Theme**: Finding a room / Moving in
**Suggested photos**:
- Person giving a key
- People moving furniture
- Roommates sitting and laughing together
- Cozy room interior
**Vibe**: Welcoming, home-finding, roommate connection

### 2. bg-rides.jpg
**Theme**: Carpooling / Airport pickup / Transportation
**Suggested photos**:
- Students with bags near a car
- Person sitting in car using mobile
- Car trunk with luggage
- Friendly carpooling scene
**Vibe**: Travel, mobility, ride-sharing

### 3. bg-marketplace.jpg
**Theme**: Buying and selling items
**Suggested photos**:
- Girl taking photos of items to sell
- "FOR SALE" box with items
- Folded clothes and small furniture
- Second-hand items display
**Vibe**: Marketplace, student essentials, affordability

## Image Specifications

- **Format**: JPG (preferred) or PNG
- **Dimensions**: Minimum 1920x1080px (Full HD)
- **Aspect Ratio**: 16:9 or wider
- **File Size**: Optimize to under 500KB for web performance
- **Style**: Light, clean, professional photography with good lighting

## Implementation

The images are applied as CSS background images that change dynamically when users switch between tabs (Rooms, Rides, Marketplace). A white translucent overlay (80-85% opacity with slight blur) is applied over the images to ensure text readability.

## Fallback

Until actual images are added, the card will display with the standard white background gradient.
