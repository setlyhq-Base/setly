# 🎯 Setly AWS Infrastructure - Visual Guide

## 🏗️ Complete Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              👥 USERS                                   │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AWS AMPLIFY (CDN)                               │
│                      https://setly.in                                   │
│                                                                         │
│  📱 Angular Frontend                                                    │
│  • Home, Explore, Rooms, Rides, Marketplace                            │
│  • Optimized builds                                                     │
│  • Auto-scaling                                                         │
│  • Global CDN delivery                                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ /api/* → Redirect/Proxy
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AWS API GATEWAY                                 │
│                  REST API Entry Point                                   │
│                                                                         │
│  🔐 Security:                                                           │
│  • Rate limiting (100 req/15min)                                        │
│  • CORS (specific domains only)                                         │
│  • Request validation                                                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ Invoke
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AWS LAMBDA FUNCTION                             │
│                      Node.js 20.x + Express                             │
│                                                                         │
│  🚀 Features:                                                           │
│  • Explore APIs (events, restaurants, places)                           │
│  • Upload signed URLs                                                   │
│  • Rooms/Rides/Marketplace CRUD                                         │
│  • User profile management                                              │
│                                                                         │
│  ⚡ Performance:                                                         │
│  • 10-minute caching per city/category                                  │
│  • Quality filters (3.5+ rating, 10+ reviews)                           │
│  • Graceful fallbacks                                                   │
│  • Auto-scaling (0 to 1000s of requests)                                │
└─────┬──────────┬──────────┬────────────┬──────────────────────────────┘
      │          │          │            │
      │          │          │            │
      ▼          ▼          ▼            ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌─────────────┐
│ Secrets  │ │   S3   │ │CloudFr.│ │  MongoDB/   │
│ Manager  │ │ Bucket │ │  CDN   │ │  DynamoDB   │
└──────────┘ └────────┘ └────────┘ └─────────────┘
      │          │          │            │
      │          │          │            │
      ▼          ▼          ▼            ▼
   API Keys   Images     Fast          App Data
   • Google   Storage    Global        • Rooms
   • Ticketm.          Delivery       • Rides
   • Eventbr.                          • Market
                                       • Users
```

## 📊 Data Flow Diagrams

### 1. Explore Page Flow

```
User visits Explore
       │
       ▼
Select city (New York)
       │
       ▼
Frontend → API Gateway → Lambda
       │                    │
       │                    ├─→ Check Cache (NodeCache)
       │                    │   └─→ Cache HIT? Return data ✅
       │                    │
       │                    ├─→ Cache MISS? Call Google Places
       │                    │   └─→ Apply quality filters
       │                    │   └─→ Cache for 10 minutes
       │                    │
       │                    └─→ Return filtered results
       │
       ▼
Display: Restaurants, Places, Events, etc.
```

**Benefit**: Same city query = cached response (10x faster, 90% cost savings)

### 2. Image Upload Flow (Direct to S3)

```
User uploads room photo
       │
       ▼
Frontend → POST /api/upload/signed-url
       │         {entityType: 'rooms', entityId: 'room-123'}
       │
       ▼
Lambda generates presigned URL
       │
       │   S3 Path: rooms/room-123/abc-def-123.jpg
       │   CloudFront URL: https://d123.cloudfront.net/rooms/...
       │   Expires in: 15 minutes
       │
       ▼
Frontend receives:
       {
         uploadUrl: "https://s3.amazonaws.com/...",
         cloudFrontUrl: "https://d123.cloudfront.net/..."
       }
       │
       ▼
Browser uploads DIRECTLY to S3 (bypasses Lambda!)
       │
       ▼
Save cloudFrontUrl in database
       │
       ▼
Display image from CloudFront CDN (global, cached)
```

**Benefit**: No Lambda data transfer = faster uploads, lower costs

### 3. City Switching (Smooth, No Blinks)

```
User: New York → Boston
       │
       ▼
200ms debounce (prevents rapid switching)
       │
       ▼
Set individual category loading states:
   loadingStates.trending.set(true)
   loadingStates.restaurants.set(true)
   loadingStates.places.set(true)
   ...
       │
       ▼
Load each category independently (parallel)
       │
       ├─→ Trending
       ├─→ Restaurants
       ├─→ Places
       ├─→ Events
       └─→ Nightlife
       │
       ▼
Each completes → set loading state to false
       │
       ▼
Fade in with CSS animation (0.4s)
       │
       ▼
✨ Smooth transition, no page blink!
```

**Benefit**: OnPush change detection + per-category loading = silky smooth UX

## 🗂️ S3 Folder Structure (Clean & Organized)

```
setly-user-uploads-dev/
│
├── rooms/
│   ├── room-001/
│   │   ├── abc123.jpg  ← Main photo
│   │   ├── def456.jpg  ← Bedroom
│   │   └── ghi789.jpg  ← Bathroom
│   │
│   ├── room-002/
│   │   └── xyz999.jpg
│   │
│   └── ...
│
├── rides/
│   ├── ride-001/
│   │   └── car-photo.jpg
│   │
│   └── ...
│
├── marketplace/
│   ├── item-001/
│   │   ├── main.jpg     ← Primary image
│   │   ├── gallery1.jpg
│   │   └── gallery2.jpg
│   │
│   └── ...
│
└── users/
    ├── user-001/
    │   └── profile.jpg
    │
    └── ...
```

**Benefits**:
- ✅ Easy to find all images for an entity
- ✅ Easy to delete all images when entity deleted
- ✅ Clean separation by type
- ✅ Unique filenames prevent conflicts

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────┐
│  1. HTTPS Only (TLS 1.2+)                       │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  2. Amplify Security Headers                    │
│     • Strict-Transport-Security                 │
│     • X-Content-Type-Options: nosniff           │
│     • X-Frame-Options: DENY                     │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  3. API Gateway Rate Limiting                   │
│     • 100 requests / 15 min (public)            │
│     • 300 requests / 15 min (authenticated)     │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  4. CORS Validation                             │
│     Only: setly.in, stage.setly.in, dev.setly.in│
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  5. Lambda Request Validation (Joi)             │
│     • Schema validation                         │
│     • Type checking                             │
│     • Required fields                           │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  6. Secrets Manager (API Keys)                  │
│     • Encrypted at rest                         │
│     • Rotatable                                 │
│     • No secrets in code                        │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│  7. S3 Private Bucket                           │
│     • No public access                          │
│     • CloudFront OAI only                       │
│     • Presigned URLs (15min expiry)             │
└─────────────────────────────────────────────────┘
```

## ⚡ Performance Optimizations

### Caching Strategy

```
Request for "New York" → "Restaurants"
              │
              ▼
       Check NodeCache
              │
      ┌───────┴────────┐
      │                │
   HIT ✅           MISS ❌
      │                │
Return cached      Call Google API
in 10ms           (500-2000ms)
      │                │
      │                ├─→ Filter results
      │                ├─→ Cache for 10 min
      │                └─→ Return data
      │                │
      └────────────────┘
              │
         Return to user
```

**Impact**: 
- First request: 500-2000ms
- Cached requests: ~10ms (200x faster!)
- Cost savings: 90% fewer API calls

### CDN Benefits (CloudFront)

```
User in Tokyo requests image
       │
       ▼
CloudFront Edge Location (Tokyo)
       │
    ┌──┴───┐
    │      │
  HIT ✅  MISS ❌
    │      │
   10ms    │
    │      ▼
    │   Fetch from S3 (us-east-1)
    │   Cache at edge
    │   ~500ms first time
    │      │
    └──────┘
       │
   Fast delivery!
```

**Impact**:
- First load: ~500ms (from S3)
- Cached: ~10ms (from local edge)
- Global performance: Consistent worldwide

## 💰 Cost Breakdown (Estimated for 10K users/month)

```
┌─────────────────────────────────────────────────┐
│  AWS Lambda                                     │
│  • 1M requests/month @ $0.20/1M      = $0.20    │
│  • 512MB * 500ms avg * 1M            = $8.33    │
│  Subtotal: ~$9/month                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  API Gateway                                    │
│  • 1M requests @ $3.50/1M            = $3.50    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  S3 Storage                                     │
│  • 50GB storage @ $0.023/GB          = $1.15    │
│  • 500K PUT requests @ $0.005/1K     = $2.50    │
│  • CloudFront transfer 100GB @ $0.085= $8.50    │
│  Subtotal: ~$12/month                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Secrets Manager                                │
│  • 3 secrets @ $0.40/secret          = $1.20    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  TOTAL: ~$26/month                              │
│  (vs. $50-100/month for fixed servers)          │
└─────────────────────────────────────────────────┘
```

**Savings with caching**: 80% of requests served from cache = ~$5 saved/month

## 🌍 Multi-Environment Strategy

```
┌─────────────────────────────────────────────────┐
│  DEVELOPMENT                                    │
│  • Domain: dev.setly.in                         │
│  • Branch: feat/monorepo-setup                  │
│  • Lambda Stage: dev                            │
│  • S3 Bucket: setly-user-uploads-dev            │
│  • Purpose: Active development, testing          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  STAGING                                        │
│  • Domain: stage.setly.in                       │
│  • Branch: staging                              │
│  • Lambda Stage: stage                          │
│  • S3 Bucket: setly-user-uploads-stage          │
│  • Purpose: Pre-production testing              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  PRODUCTION                                     │
│  • Domain: setly.in                             │
│  • Branch: main                                 │
│  • Lambda Stage: prod                           │
│  • S3 Bucket: setly-user-uploads-prod           │
│  • Purpose: Live users                          │
└─────────────────────────────────────────────────┘
```

## 📈 Scalability

```
Current (10K users/month):
   Lambda: 1-2 concurrent executions
   API Gateway: Handles easily
   Cost: ~$26/month

Growth (100K users/month):
   Lambda: 10-20 concurrent executions (auto-scales)
   API Gateway: No configuration needed
   Cost: ~$200-250/month

Peak (1M users/month):
   Lambda: 100-200 concurrent executions (auto-scales)
   API Gateway: Reserved concurrency
   Cost: ~$1,500-2,000/month
```

**Key point**: Infrastructure auto-scales, no manual intervention!

## ✨ Why This Architecture?

| Feature | Traditional Server | Setly AWS Architecture |
|---------|-------------------|------------------------|
| **Scaling** | Manual, slow | Automatic, instant |
| **Cost** | Fixed ($50-100/mo) | Pay-per-use ($15-30/mo) |
| **Maintenance** | High | Low (managed services) |
| **Reliability** | Single point failure | Multi-AZ, auto-healing |
| **Global** | One region | CDN edge locations |
| **Security** | DIY | AWS-managed + hardening |
| **Secrets** | .env files | Secrets Manager |
| **Images** | Local disk | S3 + CloudFront |

---

**Ready to deploy?** Follow [QUICK-START.md](../QUICK-START.md)! 🚀
