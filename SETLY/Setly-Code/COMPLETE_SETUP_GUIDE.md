# End-to-End Setup Guide - Setly Backend

## 🎯 Quick Start (Development)

### 1. MongoDB Setup (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Database name: `setly-dev`
4. Network Access: **Add IP Address** → Choose "Allow Access from Anywhere" (0.0.0.0/0)
5. Database Access: Create user with username/password (e.g., `setly-admin` / `strong-password-here`)
6. Get connection string:
   ```
   mongodb+srv://setly-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/setly-dev?retryWrites=true&w=majority
   ```

### 2. Configure AWS SSM Parameter

```bash
# Set MongoDB URI in AWS Parameter Store
aws ssm put-parameter \
  --name "/setly/dev/mongodb-uri" \
  --value "mongodb+srv://setly-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/setly-dev?retryWrites=true&w=majority" \
  --type "SecureString" \
  --region us-east-1

# Verify it was set
aws ssm get-parameter --name "/setly/dev/mongodb-uri" --with-decryption
```

### 3. Deploy Backend to AWS Lambda

```bash
cd backend-lambda

# Install dependencies (if not already done)
npm install

# Build TypeScript
npm run build

# Deploy to AWS
npx serverless deploy --stage dev
```

**Expected Output:**
```
✔ Service deployed to stack setly-backend-api-dev (112s)

endpoint: ANY - https://abc123xyz.execute-api.us-east-1.amazonaws.com/{proxy+}
functions:
  api: setly-backend-api-dev-api (45 MB)
```

**Copy the API Gateway URL** (e.g., `https://abc123xyz.execute-api.us-east-1.amazonaws.com`)

### 4. Test Backend Endpoints

```bash
# Set your API URL
API_URL="https://abc123xyz.execute-api.us-east-1.amazonaws.com"

# Health check
curl $API_URL/api/health

# Should return:
# {"status":"healthy","stage":"dev","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 5. Update Frontend Configuration (Production Only)

**For production deployment**, update `setly/src/environments/environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR_API_GATEWAY_URL/api',  // <-- Update this
  apiBaseUrl: 'https://YOUR_API_GATEWAY_URL/api',  // <-- Update this
  // ... rest of config
};
```

**For local development**, leave it as `/api` - the proxy.conf.json will handle it.

### 6. Test E2E Flow

#### Option A: Local Frontend + Lambda Backend

1. Start frontend:
   ```bash
   cd setly
   npm start
   ```

2. Update `proxy.conf.json` temporarily:
   ```json
   {
     "/api": {
       "target": "https://YOUR_API_GATEWAY_URL",
       "secure": true,
       "changeOrigin": true,
       "pathRewrite": {
         "^/api": "/api"
       }
     }
   }
   ```

3. Test in browser: http://localhost:4200

#### Option B: Full Production Test

1. Build frontend:
   ```bash
   cd setly
   npm run build
   ```

2. Deploy to Netlify/hosting
3. Test at production URL

---

## 📋 Complete E2E Test Checklist

### Test 1: Create Room Listing

1. Navigate to Rooms page
2. Click "Post a Room"
3. Fill in details:
   - Title: "Cozy Studio near Campus"
   - Address: "123 Main St, Boston, MA"
   - Price: $1200
   - Upload images
4. Submit
5. ✅ Should see success toast
6. ✅ Room appears in My Rooms tab on Profile

### Test 2: Search & View Room

1. Go to Explore page
2. Search for "Boston"
3. ✅ See room in results
4. Click room card
5. ✅ Detail page opens with all info
6. ✅ Views counter incremented

### Test 3: Save Room

1. On room detail page
2. Click heart icon (Save)
3. ✅ Success toast
4. Go to Profile → Saved tab
5. ✅ Room appears in saved rooms

### Test 4: Start Conversation

1. On room detail page
2. Click "Message Owner"
3. Type message: "Is this still available?"
4. Send
5. ✅ Success toast
6. Go to Messages page
7. ✅ Conversation appears with room thumbnail

### Test 5: Send/Receive Messages

1. Open conversation
2. Type reply: "Yes, it's available!"
3. Send
4. ✅ Message appears in thread
5. ✅ lastMessageAt updated

### Test 6: Create Ride

1. Go to Rides page
2. Click "Post a Ride"
3. Fill details:
   - Pickup: "Boston Logan Airport"
   - Dropoff: "Harvard Square"
   - Date/Time
   - Seats: 3
   - Price: $15/seat
4. Submit
5. ✅ Success, appears in My Rides

### Test 7: Marketplace Item

1. Go to Marketplace
2. Click "Sell Item"
3. Fill details:
   - Title: "Textbook for Sale"
   - Category: Books
   - Condition: Like New
   - Price: $50
4. Submit
5. ✅ Success, appears in My Marketplace

---

## 🔍 Debugging

### Check Backend Logs

```bash
# Tail logs in real-time
npx serverless logs -f api --stage dev --tail

# Check for errors
npx serverless logs -f api --stage dev --startTime 5m
```

### Test Individual Endpoints

```bash
API_URL="https://YOUR_API_GATEWAY_URL"

# Create room
curl -X POST $API_URL/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "title": "Test Room",
    "address": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "price": 1200,
    "roomType": "private",
    "description": "Test listing",
    "images": []
  }'

# Search rooms
curl "$API_URL/api/rooms?city=Boston"

# Get specific room (replace ROOM_ID)
curl "$API_URL/api/rooms/ROOM_ID"

# Create user
curl -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "name": "Test User"
  }'

# Get user profile
curl "$API_URL/api/users/test-user-123"

# Save room
curl -X POST "$API_URL/api/users/test-user-123/saved/rooms/ROOM_ID"

# Get saved items
curl "$API_URL/api/users/test-user-123/saved"
```

### Check MongoDB Data

1. Go to MongoDB Atlas dashboard
2. Browse Collections
3. Collections should auto-create:
   - `users`
   - `rooms`
   - `rides`
   - `marketplace`
   - `conversations`

### Common Issues

**Issue: "Cannot connect to MongoDB"**
- Check SSM parameter exists: `aws ssm get-parameter --name "/setly/dev/mongodb-uri" --with-decryption`
- Verify network access in MongoDB Atlas (0.0.0.0/0)
- Check Lambda has SSM permissions (already in serverless.yml)

**Issue: "404 Not Found"**
- Verify API Gateway URL is correct
- Check serverless deploy completed successfully
- Test health endpoint first: `curl $API_URL/api/health`

**Issue: "CORS Error"**
- Update serverless.yml CORS origins to include your frontend domain
- Redeploy: `npx serverless deploy --stage dev`

**Issue: "Timeout"**
- MongoDB query may be slow
- Check indexes are created (automatic on first query)
- Increase Lambda timeout in serverless.yml (max 29s for API Gateway)

---

## 🚀 Production Deployment

### Stage Environment

```bash
# Set stage MongoDB URI
aws ssm put-parameter \
  --name "/setly/stage/mongodb-uri" \
  --value "mongodb+srv://USER:PASS@cluster.mongodb.net/setly-stage" \
  --type "SecureString" \
  --region us-east-1

# Deploy
npx serverless deploy --stage stage
```

### Production Environment

```bash
# Set production MongoDB URI (separate cluster recommended)
aws ssm put-parameter \
  --name "/setly/prod/mongodb-uri" \
  --value "mongodb+srv://USER:PASS@cluster.mongodb.net/setly-prod" \
  --type "SecureString" \
  --region us-east-1

# Deploy
npx serverless deploy --stage prod
```

### Update Frontend

Update `environment.ts` with production API URL:
```typescript
apiUrl: 'https://PROD_API_GATEWAY_URL/api',
apiBaseUrl: 'https://PROD_API_GATEWAY_URL/api',
```

---

## 📊 Monitoring & Maintenance

### View Metrics

```bash
# API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=setly-backend-api-dev \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 3600 \
  --statistics Sum

# Lambda metrics
npx serverless metrics --stage dev
```

### Database Backups

MongoDB Atlas automatically backs up M0 clusters.

For production:
- Upgrade to M10+ for continuous backups
- Set up automatic backup schedules
- Test restore procedures

### Cost Optimization

**Lambda:**
- Current config: 512MB, 29s timeout
- Free tier: 1M requests/month, 400,000 GB-seconds compute
- Expected cost: $0-5/month for dev

**MongoDB Atlas:**
- M0 Free tier: 512MB storage
- Sufficient for development
- Upgrade to M10 ($0.08/hr) for production

---

## 🎉 Success Criteria

✅ Backend deployed to AWS Lambda  
✅ MongoDB connected via SSM parameter  
✅ Health check returns 200 OK  
✅ Can create room listing  
✅ Can search and view rooms  
✅ Can save/unsave items  
✅ Can create conversations  
✅ Can send messages  
✅ Profile page shows My Rooms/Rides/Marketplace  
✅ Saved tab shows saved items  
✅ E2E flow works: Post → View → Message → Profile  

**The Setly MVP is now fully functional! 🚀**
