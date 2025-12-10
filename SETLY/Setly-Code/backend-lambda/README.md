# Setly Backend Lambda - AWS Infrastructure

This directory contains the production-ready backend for Setly, designed to run on AWS Lambda with API Gateway.

## 🏗️ Architecture

```
┌─────────────────┐
│  AWS Amplify    │  Frontend (Angular)
│  setly.in       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │  HTTP Entry Point
│  /api/*         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lambda         │  Node.js Express Backend
│  (This Code)    │  - Explore APIs
│                 │  - Upload signed URLs
│                 │  - Rooms, Rides, Marketplace
└────────┬────────┘
         │
         ├──────────► AWS Secrets Manager (API Keys)
         ├──────────► S3 Bucket (User Uploads)
         ├──────────► CloudFront (CDN)
         └──────────► MongoDB/DynamoDB (Database)
```

## 📁 S3 Folder Structure

```
setly-user-uploads-{stage}/
├── rooms/
│   ├── {roomId}/
│   │   ├── {uuid}.jpg
│   │   └── {uuid}.jpg
├── rides/
│   ├── {rideId}/
│   │   └── {uuid}.jpg
├── marketplace/
│   ├── {itemId}/
│   │   ├── {uuid}.jpg
│   │   └── {uuid}.jpg
└── users/
    ├── {userId}/
    │   └── profile.jpg
```

## 🚀 Deployment

### Prerequisites

1. AWS CLI configured with credentials
2. Node.js 20.x installed
3. Serverless Framework installed globally (optional)

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Store API keys in Secrets Manager:**
   ```bash
   chmod +x setup-secrets.sh
   ./setup-secrets.sh dev
   ./setup-secrets.sh stage
   ./setup-secrets.sh prod
   ```

3. **Deploy to AWS:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh dev      # Deploy to dev
   ./deploy.sh stage    # Deploy to stage
   ./deploy.sh prod     # Deploy to production
   ```

4. **After deployment, note the CloudFront domain and store it:**
   ```bash
   aws ssm put-parameter \
     --name '/setly/dev/cloudfront-domain' \
     --value 'd1234567890.cloudfront.net' \
     --type String \
     --region us-east-1
   ```

5. **Update Amplify environment variables:**
   - Go to AWS Amplify Console → App Settings → Environment Variables
   - Add: `VITE_API_URL` = `<YOUR_API_GATEWAY_URL>`

## 🔑 Secrets Required

Store these in AWS Secrets Manager:

- `setly/{stage}/google-maps-api-key`
- `setly/{stage}/ticketmaster-api-key`
- `setly/{stage}/eventbrite-api-key`

Store these in SSM Parameter Store:

- `/setly/{stage}/cloudfront-domain`
- `/setly/{stage}/mongodb-uri`

## 📊 Environments

| Environment | Domain         | Branch               | Stage |
|-------------|----------------|----------------------|-------|
| Production  | setly.in       | main                 | prod  |
| Staging     | stage.setly.in | staging              | stage |
| Development | dev.setly.in   | feat/monorepo-setup  | dev   |

## 🛡️ Security Features

- ✅ Rate limiting on all endpoints
- ✅ CORS configured for specific domains
- ✅ API keys stored in Secrets Manager (not in code)
- ✅ Presigned S3 URLs for secure uploads
- ✅ CloudFront for secure image delivery
- ✅ Request validation with Joi
- ✅ Error handling and logging

## 📦 API Endpoints

### Explore
- `GET /api/explore/:category` - Get explore data (restaurants, places, events, etc.)
- `GET /api/explore/places/autocomplete` - City search autocomplete
- `GET /api/explore/places/details` - Get place details by placeId

### Upload
- `POST /api/upload/signed-url` - Get signed URL for single file upload
- `POST /api/upload/batch-signed-urls` - Get multiple signed URLs
- `DELETE /api/upload/:fileKey` - Delete a file

### Rooms
- `GET /api/rooms` - Search rooms
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms` - Create room listing
- `PUT /api/rooms/:roomId` - Update room
- `DELETE /api/rooms/:roomId` - Delete room

### Rides
- `GET /api/rides` - Search rides
- `GET /api/rides/:rideId` - Get ride details
- `POST /api/rides` - Create ride listing

### Marketplace
- `GET /api/marketplace` - Search items
- `GET /api/marketplace/:itemId` - Get item details
- `POST /api/marketplace` - Create listing

### Users
- `GET /api/users/:userId` - Get user profile
- `POST /api/users` - Create user
- `PUT /api/users/:userId` - Update profile

## 🔄 Upload Flow

1. Frontend requests signed URL:
   ```typescript
   POST /api/upload/signed-url
   Body: {
     entityType: 'rooms',
     entityId: 'room-123',
     filename: 'photo.jpg',
     contentType: 'image/jpeg'
   }
   ```

2. Backend returns:
   ```json
   {
     "uploadUrl": "https://s3.amazonaws.com/...",
     "fileKey": "rooms/room-123/uuid.jpg",
     "cloudFrontUrl": "https://d123.cloudfront.net/rooms/room-123/uuid.jpg"
   }
   ```

3. Frontend uploads directly to S3 using `uploadUrl`

4. Frontend saves `cloudFrontUrl` in database

## 🧪 Local Development

```bash
npm run local
```

This starts serverless-offline on `http://localhost:3000`

## 📝 TODO

- [ ] Implement actual MongoDB/DynamoDB connections in `database.service.ts`
- [ ] Add authentication middleware (Firebase Auth or Cognito)
- [ ] Add pagination to list endpoints
- [ ] Implement full-text search for marketplace
- [ ] Add WebSocket support for real-time features
- [ ] Add monitoring with CloudWatch alarms
- [ ] Add automated tests

## 📞 Support

For issues or questions, contact the Setly development team.
