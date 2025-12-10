# Backend API Integration Complete

## Overview
Complete backend API integration implemented with AWS Lambda, S3, CloudFront, and comprehensive error handling.

## Services Created

### 1. **backend-api.service.ts**
Core service for S3 presigned URL upload flow:
- `getUploadUrl()` - Get presigned S3 URL for single file
- `getBatchUploadUrls()` - Get multiple presigned URLs
- `uploadToS3()` - Direct browser → S3 upload
- `deleteFile()` - Delete file from S3
- `uploadImage()` - Complete upload flow (get URL → upload → return CloudFront URL)
- `uploadMultipleImages()` - Batch upload in parallel

### 2. **rooms-api.service.ts**
CRUD operations for room listings:
- `searchRooms(filters)` - Search with filters (city, price, dates, guests)
- `getRoomById(id)` - Get single room details
- `createRoom(data)` - Create new listing
- `updateRoom(id, updates)` - Update existing listing
- `deleteRoom(id)` - Delete listing
- `getRoomsByUser(userId)` - Get user's rooms for Profile page

**Filters Supported:**
- city, minPrice, maxPrice, roomType
- checkIn, checkOut, guests

### 3. **rides-api.service.ts**
CRUD operations for ride sharing:
- `searchRides(filters)` - Search rides (pickup, dropoff, date)
- `getRideById(id)` - Get single ride details
- `createRide(data)` - Post new ride
- `updateRide(id, updates)` - Update ride
- `deleteRide(id)` - Delete ride
- `getRidesByUser(userId)` - Get user's rides

**Ride Interface:**
```typescript
{
  pickupAddress, pickupLat, pickupLng,
  dropoffAddress, dropoffLat, dropoffLng,
  rideDate, rideTime, seatsAvailable,
  pricePerSeat, images, notes, status
}
```

### 4. **marketplace-api.service.ts**
CRUD operations for marketplace items:
- `searchItems(filters)` - Search with filters
- `getItemById(id)` - Get item details
- `createItem(data)` - Post new item
- `updateItem(id, updates)` - Update item
- `deleteItem(id)` - Delete item
- `getItemsByUser(userId)` - Get user's items
- `markAsSold(id)` - Mark as sold
- `markAsReserved(id)` - Mark as reserved

**Filters Supported:**
- category, minPrice, maxPrice, searchTerm, condition, location

### 5. **messaging-api.service.ts**
Real-time messaging functionality:
- `getConversations()` - List all user conversations
- `getConversation(id)` - Get single conversation
- `createConversation(request)` - Start new conversation
- `getMessages(conversationId)` - Get conversation messages
- `sendMessage(conversationId, text)` - Send message
- `markAsRead(messageId)` - Mark message read
- `markConversationAsRead(id)` - Mark all messages read
- `deleteConversation(id)` - Delete conversation
- `pollConversations()` - Poll for updates

**Signal-based State:**
- `conversations()` - Reactive conversation list
- `unreadCount()` - Total unread messages

### 6. **users-api.service.ts**
User profile and saved items:
- `getCurrentUser()` - Get current user profile
- `getUserById(id)` - Get user by ID
- `updateProfile(updates)` - Update profile
- `updateProfilePhoto(url)` - Update photo
- `saveRoom/Ride/MarketplaceItem(id)` - Save to favorites
- `unsaveRoom/Ride/MarketplaceItem(id)` - Remove from favorites
- `getSavedItems()` - Get all saved items

**Profile Interface:**
```typescript
{
  email, name, photoUrl, phone, bio,
  university, graduationYear, major,
  verified, verificationBadge,
  preferredCities, savedRooms, savedRides, savedMarketplace
}
```

### 7. **Updated upload.service.ts**
Integrated with backend-api.service:
- `uploadListingImage()` - Upload single image with optimization
- `uploadMultipleImages()` - Batch upload in parallel
- Automatic WebP compression for large files
- Image dimension extraction
- File type and size validation

## Error Handling

### HTTP Interceptor (error.interceptor.ts)
Automatic error handling for all HTTP calls:
- Retry GET requests once on network errors
- User-friendly error messages for specific status codes:
  - 0: Connection error
  - 400: Invalid request
  - 401: Authentication required
  - 403: Permission denied
  - 404: Not found
  - 429: Rate limited
  - 500: Server error
  - 503: Service unavailable
- Toast notifications for errors (except polling endpoints)
- Centralized logging

### Global Error Handler
Catches uncaught exceptions:
- User-friendly messages
- ChunkLoadError detection (app updates)
- Network error detection
- Integration with Sentry/LogRocket (if configured)

## App Configuration Updated

**app.config.ts** now includes:
```typescript
provideHttpClient(
  withInterceptorsFromDi(),
  withInterceptors([errorInterceptor])
)
```

## Upload Flow Architecture

```
Frontend Component
    ↓
upload.service.uploadListingImage()
    ↓ (validates, compresses to WebP)
backend-api.service.uploadImage()
    ↓ (gets presigned URL from Lambda)
AWS Lambda /api/upload
    ↓ (generates S3 presigned URL)
Browser → S3 (direct upload, no Lambda)
    ↓
CloudFront URL returned
    ↓
Stored in database with listing
```

**Benefits:**
- No file data through Lambda (saves costs)
- Direct browser → S3 upload
- CloudFront CDN for fast global delivery
- Automatic image optimization (WebP)
- Progress tracking capability

## API Endpoints Structure

All services use `environment.apiUrl` (defaults to `/api`):

```
/api/rooms
  GET    / (search)
  POST   / (create)
  GET    /:id
  PUT    /:id
  DELETE /:id

/api/rides
  GET    / (search)
  POST   / (create)
  GET    /:id
  PUT    /:id
  DELETE /:id

/api/marketplace
  GET    / (search)
  POST   / (create)
  GET    /:id
  PUT    /:id
  DELETE /:id

/api/conversations
  GET    / (list)
  POST   / (create)
  GET    /:id
  PUT    /:id/read
  DELETE /:id

/api/conversations/:id/messages
  GET    / (list messages)
  POST   / (send message)

/api/users/me
  GET    / (current user)
  PUT    / (update profile)
  PUT    /photo (update photo)

/api/users/me/saved
  GET    / (all saved items)
  POST   /rooms (save room)
  DELETE /rooms/:id (unsave room)
  POST   /rides (save ride)
  DELETE /rides/:id (unsave ride)
  POST   /marketplace (save item)
  DELETE /marketplace/:id (unsave item)

/api/upload
  POST   / (get presigned URL)
  DELETE /:fileKey (delete file)
```

## Next Steps

### 1. Backend Implementation
Implement Lambda handlers for all endpoints:
- Database layer (MongoDB/DynamoDB)
- Authentication middleware
- Request validation
- Response formatting

### 2. Profile Page Updates
- Add tabs: My Rooms, My Rides, My Marketplace, Saved, Alerts
- Load listings using new API services
- Public vs private profile views
- Edit profile functionality

### 3. Messaging Integration
- Connect UI to messaging-api.service
- Real-time updates (polling or WebSocket)
- Message notifications
- Conversation list with unread counts

### 4. Testing
- E2E tests for complete workflows
- Unit tests for services
- Integration tests for API calls
- Error handling edge cases

## Usage Examples

### Creating a Room Listing
```typescript
const roomsApi = inject(RoomsApiService);
const uploadService = inject(UploadService);

// Upload images
const imageUrls = await uploadService.uploadMultipleImages(
  files, 'rooms', roomId
);

// Create room
const room = await roomsApi.createRoom({
  title: 'Cozy Studio Near Campus',
  price: 800,
  city: 'New York',
  images: imageUrls,
  // ... other fields
}).toPromise();
```

### Starting a Conversation
```typescript
const messagingApi = inject(MessagingApiService);

// Create conversation
const conversation = await messagingApi.createConversation({
  otherUserId: ownerId,
  listingId: roomId,
  listingType: 'room'
}).toPromise();

// Send message
await messagingApi.sendMessage(
  conversation.conversationId!,
  'Hi, is this room still available?'
).toPromise();
```

### Searching Rooms
```typescript
const roomsApi = inject(RoomsApiService);

const results = await roomsApi.searchRooms({
  city: 'New York',
  minPrice: 500,
  maxPrice: 1500,
  checkIn: '2024-09-01',
  checkOut: '2024-12-31',
  guests: 1
}).toPromise();
```

## Status

✅ **COMPLETE** - All backend API services implemented
✅ **COMPLETE** - Error handling and interceptors configured
✅ **COMPLETE** - Upload flow integrated
✅ **COMPLETE** - All services compile without errors

**Ready for:**
- Backend Lambda implementation
- Profile page updates
- Messaging UI integration
- E2E testing
