# 🎯 Setly Production Launch - Complete Checklist

## Overview
This checklist ensures EVERYTHING is ready for your fully live production application.

---

## ✅ BACKEND DEPLOYMENT

### Prerequisites (You Complete)
- [ ] **MongoDB Atlas Cluster Created**
  - Go to: https://mongodb.com/cloud/atlas
  - Cluster tier: M0 (free) or M10+ (production)
  - Region: us-east-1
  - Database name: `setly-prod`
  - Network access: 0.0.0.0/0 (allow all IPs)
  - Database user created with username/password
  - Connection string saved:
    ```
    mongodb+srv://username:password@cluster.mongodb.net/setly-prod?retryWrites=true&w=majority
    ```

- [ ] **Google Maps API Key (Optional but Recommended)**
  - Get from: https://console.cloud.google.com/apis/credentials
  - Enable: Maps JavaScript API, Places API, Geocoding API
  - Save key for deployment

### Local Testing (Recommended Before Deploy)
```bash
cd backend-lambda

# 1. Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and AWS credentials

# 2. Install dependencies
npm install

# 3. Start local server
npm run dev

# 4. In another terminal, test all endpoints
./test-api.sh http://localhost:3000
```

Expected result:
```
🎉 All tests passed!
✅ Backend is working correctly
✅ MongoDB connection successful
✅ All CRUD operations functional
✅ Ready for frontend integration
```

### Production Deployment
```bash
cd backend-lambda

# Run automated deployment
./deploy-production.sh prod
```

**What this does**:
1. ✓ Verifies AWS credentials
2. ✓ Prompts for MongoDB URI
3. ✓ Prompts for Google Maps API key
4. ✓ Stores secrets in AWS Secrets Manager
5. ✓ Builds TypeScript code
6. ✓ Deploys to AWS Lambda
7. ✓ Creates API Gateway
8. ✓ Creates S3 bucket (setly-user-uploads-prod)
9. ✓ Creates CloudFront CDN
10. ✓ Returns live API URL

**Expected output**:
```
✅ DEPLOYMENT COMPLETE!
🌐 API Gateway URL: https://abc123xyz.execute-api.us-east-1.amazonaws.com
☁️ CloudFront Domain: https://d1234567890.cloudfront.net
```

### Test Production Backend
```bash
# Test health endpoint
curl https://YOUR_API_GATEWAY_URL/api/health

# Run full test suite
./test-api.sh https://YOUR_API_GATEWAY_URL
```

**Checklist**:
- [ ] Health endpoint returns `{"status":"healthy"}`
- [ ] Can create user
- [ ] Can create room
- [ ] Can search rooms
- [ ] Can create ride
- [ ] Can create marketplace item
- [ ] Can create conversation
- [ ] Can get presigned S3 URL

---

## ✅ FRONTEND CONFIGURATION

### Update Environment Files

**File**: `setly/src/environments/environment.ts` (Production)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR_API_GATEWAY_URL/api',  // ← UPDATE THIS
  apiBaseUrl: 'https://YOUR_API_GATEWAY_URL/api',  // ← UPDATE THIS
  cloudFrontDomain: 'YOUR_CLOUDFRONT_DOMAIN.cloudfront.net',  // ← UPDATE THIS
  
  firebase: {
    // Your existing Firebase config
    apiKey: "AIzaSyDLk2hmPHVtlBdxu0Rctfh2G5FnAIHpq64",
    authDomain: "setly-fire.firebaseapp.com",
    projectId: "setly-fire",
    storageBucket: "setly-fire.firebasestorage.app",
    messagingSenderId: "577734262579",
    appId: "1:577734262579:web:de22f8e59f43303e1f4846"
  },
  
  // Rest of your config...
};
```

**File**: `setly/src/environments/environment.development.ts` (Local Dev)

Option 1 - Use Production API (Recommended):
```typescript
apiUrl: 'https://YOUR_API_GATEWAY_URL/api',
apiBaseUrl: 'https://YOUR_API_GATEWAY_URL/api',
```

Option 2 - Use Local Backend:
```typescript
apiUrl: '/api',  // Uses proxy.conf.json
apiBaseUrl: '/api',
```

### Update Proxy (For Local Backend Only)

**File**: `setly/proxy.conf.json`

For production API:
```json
{
  "/api": {
    "target": "https://YOUR_API_GATEWAY_URL",
    "secure": true,
    "changeOrigin": true
  }
}
```

---

## ✅ FRONTEND DEPLOYMENT (AWS Amplify)

### Build Locally First
```bash
cd setly
npm run build --configuration production
```

Should succeed with no errors.

### Deploy to Amplify

1. **Go to AWS Amplify Console**
   - https://console.aws.amazon.com/amplify

2. **Create New App**
   - Click "New app" → "Host web app"
   - Source: GitHub
   - Repository: `setlyhq-Base/setly`
   - Branch: `feat/monorepo-setup` (or `main`)

3. **Configure Build Settings**
   - App root directory: `SETLY/Setly-Code/setly`
   - Build command: `npm run build -- --configuration production`
   - Output directory: `dist/setly/browser`

4. **Environment Variables**
   ```
   NODE_VERSION=20
   AMPLIFY_MONOREPO_APP_ROOT=SETLY/Setly-Code/setly
   ```

5. **Deploy**
   - Click "Save and deploy"
   - Wait for build to complete (5-10 minutes)
   - Copy deployment URL: `https://main.xxxxx.amplifyapp.com`

6. **Custom Domain (Optional)**
   - Click "Domain management"
   - Add domain: `setly.in`
   - Follow DNS configuration steps
   - Wait for SSL certificate (can take 1 hour)

### Test Deployed Frontend
- [ ] Open `https://setly.in` (or Amplify URL)
- [ ] Sign in works
- [ ] Home page loads
- [ ] Can navigate to all pages
- [ ] No console errors

---

## ✅ END-TO-END TESTING

### Test Complete Flows

#### 1. Room Posting → Search → Message
1. [ ] Click "Post" → "Room"
2. [ ] Fill in details (title, address, price, etc.)
3. [ ] Upload image (tests S3 + CloudFront)
4. [ ] Submit
5. [ ] See success toast
6. [ ] Navigate to Explore
7. [ ] Search for your city
8. [ ] Find your room in results
9. [ ] Click room card → Detail page opens
10. [ ] Click "Message" button
11. [ ] Send message
12. [ ] Check Messages page → Conversation appears

**Verify**:
- [ ] Room saved to MongoDB
- [ ] Image uploaded to S3
- [ ] Image loads via CloudFront
- [ ] Search works
- [ ] Detail page shows correct data
- [ ] Message creates conversation
- [ ] Message appears in chat

#### 2. Ride Posting → Search
1. [ ] Click "Post" → "Ride"
2. [ ] Fill in pickup/dropoff, date, price
3. [ ] Submit
4. [ ] Navigate to Browse → Rides
5. [ ] Find your ride
6. [ ] Click → Detail page

**Verify**:
- [ ] Ride saved to MongoDB
- [ ] Search finds ride
- [ ] Detail page correct

#### 3. Marketplace Item → Search
1. [ ] Click "Post" → "Item"
2. [ ] Fill in title, category, price
3. [ ] Upload image
4. [ ] Submit
5. [ ] Navigate to Browse → Marketplace
6. [ ] Find your item

**Verify**:
- [ ] Item saved to MongoDB
- [ ] Image uploaded to S3
- [ ] Search works

#### 4. Profile Management
1. [ ] Navigate to Profile
2. [ ] Click "My Rooms" tab
3. [ ] See posted room
4. [ ] Click "My Rides" tab
5. [ ] See posted ride
6. [ ] Click "My Marketplace" tab
7. [ ] See posted item
8. [ ] Click "Saved" tab
9. [ ] Save a room (click heart on any room)
10. [ ] Check Saved tab → Room appears
11. [ ] Click remove → Room disappears

**Verify**:
- [ ] All tabs load data from MongoDB
- [ ] Saved items work
- [ ] Remove works

#### 5. Explore Features
1. [ ] Navigate to Explore
2. [ ] Allow location access
3. [ ] See nearby restaurants
4. [ ] See nearby activities
5. [ ] Switch city in dropdown
6. [ ] Results update

**Verify**:
- [ ] Google Places API works
- [ ] Ticketmaster API works (if configured)
- [ ] City switching works
- [ ] No errors in console

#### 6. Messages
1. [ ] Navigate to Messages
2. [ ] Open existing conversation
3. [ ] Send message
4. [ ] See message appear
5. [ ] Refresh page
6. [ ] Messages persist

**Verify**:
- [ ] Messages saved to MongoDB
- [ ] Conversation list updates
- [ ] lastMessageAt updates

---

## ✅ FINAL CHECKS

### Security
- [ ] No API keys in frontend code
- [ ] All secrets in AWS Secrets Manager
- [ ] CORS configured correctly
- [ ] HTTPS everywhere
- [ ] Firebase Auth working

### Performance
- [ ] Images load via CloudFront CDN
- [ ] API responses < 1 second
- [ ] No console errors
- [ ] No 404 errors
- [ ] No CORS errors

### Functionality
- [ ] All navigation works
- [ ] Connect page hidden
- [ ] All post flows work
- [ ] All search works
- [ ] Profile loads data
- [ ] Messages work
- [ ] Image uploads work

### Mobile
- [ ] Responsive on phone
- [ ] Bottom nav works
- [ ] All features accessible
- [ ] Images load properly

---

## ✅ MONITORING SETUP

### CloudWatch Alarms
```bash
# Monitor Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name setly-lambda-errors-prod \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --region us-east-1
```

### MongoDB Alerts
Go to MongoDB Atlas → Alerts → Create Alert:
- [ ] Connection count > 80%
- [ ] Storage > 80%
- [ ] Slow queries > 1000ms

---

## ✅ DOCUMENTATION

- [ ] **README.md** updated with live URLs
- [ ] **API documentation** (endpoints, payloads)
- [ ] **Deployment runbook** (this document)
- [ ] **Troubleshooting guide**
- [ ] **Rollback procedure**

---

## 🚨 ROLLBACK PLAN

If something goes wrong:

### Backend Rollback
```bash
cd backend-lambda
npx serverless rollback --stage prod
```

### Frontend Rollback
1. Go to AWS Amplify Console
2. Click on app
3. Find previous successful deployment
4. Click "Redeploy this version"

### MongoDB Rollback
MongoDB Atlas has automatic backups:
1. Go to Atlas → Backup
2. Select restore point
3. Restore to new cluster
4. Update connection string

---

## 📊 SUCCESS METRICS

After launch, monitor:
- [ ] User signups
- [ ] Room/Ride/Item postings
- [ ] Messages sent
- [ ] API error rate < 1%
- [ ] Page load time < 3s
- [ ] Mobile usage

---

## 🎉 LAUNCH DAY

### Pre-Launch (T-1 hour)
- [ ] Run all E2E tests one more time
- [ ] Check MongoDB connection
- [ ] Check CloudWatch logs (no errors)
- [ ] Check Amplify deployment (green)
- [ ] Test on multiple devices
- [ ] Test on multiple browsers

### Launch (T-0)
- [ ] Announce on social media
- [ ] Monitor CloudWatch real-time
- [ ] Monitor MongoDB Atlas
- [ ] Be ready to respond to issues

### Post-Launch (T+24 hours)
- [ ] Review error logs
- [ ] Check user feedback
- [ ] Monitor costs
- [ ] Plan optimizations

---

## 📞 SUPPORT CONTACTS

**AWS Support**:
- Console: https://console.aws.amazon.com/support
- Phone: Check AWS Support portal

**MongoDB Atlas**:
- Support: https://support.mongodb.com
- Chat: Available in Atlas console

**Critical Issues**:
1. Check CloudWatch logs first
2. Check MongoDB Atlas metrics
3. Test API health endpoint
4. Check Amplify deployment status

---

## ✅ FINAL CHECKLIST

- [ ] Backend deployed to AWS Lambda
- [ ] MongoDB Atlas connected and tested
- [ ] S3 + CloudFront working
- [ ] All secrets in AWS Secrets Manager
- [ ] Frontend deployed to Amplify
- [ ] Custom domain configured (setly.in)
- [ ] SSL certificate active
- [ ] All E2E tests passing
- [ ] Connect page hidden
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Team trained on rollback

---

## 🚀 DEPLOYMENT COMMAND SUMMARY

```bash
# 1. Deploy Backend
cd backend-lambda
./deploy-production.sh prod

# 2. Test Backend  
./test-api.sh https://YOUR_API_GATEWAY_URL

# 3. Update Frontend Config
# Edit setly/src/environments/environment.ts

# 4. Build Frontend
cd setly
npm run build --configuration production

# 5. Deploy to Amplify
# Done through AWS Console

# 6. Test Production
# Open https://setly.in
# Run E2E tests
```

---

## ✅ YOU'RE READY TO LAUNCH!

**Next step**: Create MongoDB Atlas cluster and run:
```bash
cd backend-lambda
./deploy-production.sh prod
```

Then test and deploy frontend.

**Your app will be live at https://setly.in in under 1 hour! 🎉**
