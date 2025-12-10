# 🚀 Setly Backend - Production Deployment Ready

## ⚡ Quick Deploy (Automated)

### You have AWS configured, so deploy now:

```bash
cd backend-lambda

# Deploy to production
./deploy-production.sh prod
```

That's it! The script handles everything:
- ✓ Verifies AWS credentials  
- ✓ Prompts for MongoDB URI
- ✓ Stores secrets in AWS Secrets Manager
- ✓ Builds & deploys to Lambda + API Gateway
- ✓ Creates S3 + CloudFront CDN
- ✓ Returns your live API URL

---

## 📋 What You Need

### 1. MongoDB Atlas Connection String

Create cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas):
- Tier: M0 free (dev) or M10+ (production)
- Region: us-east-1
- Database: `setly-prod`
- Network Access: 0.0.0.0/0 (for Lambda)

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/setly-prod?retryWrites=true&w=majority
```

### 2. Google Maps API Key (Optional, for Explore features)

Get from: https://console.cloud.google.com/apis/credentials

---

## 🧪 Test Locally First

### 1. Create .env file
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 2. Start local server
```bash
npm install
npm run dev
```

### 3. Test all endpoints
```bash
./test-api.sh http://localhost:3000
```

Should show:
```
✓ Health Endpoint
✓ Create User
✓ Get User  
✓ Create Room
✓ Search Rooms
✓ Create Ride
✓ Create Marketplace Item
✓ Create Conversation
✓ Get Presigned URL

🎉 All tests passed!
```

---

## ☁️ Deploy to AWS

### Automated Deployment

```bash
./deploy-production.sh prod
```

You'll be prompted for:
1. MongoDB connection string (if not already in AWS Secrets Manager)
2. Google Maps API key (optional)

### Manual Deployment

```bash
# Store secrets
aws secretsmanager create-secret \
  --name setly/prod/mongodb-uri \
  --secret-string "YOUR_MONGODB_URI" \
  --region us-east-1

# Deploy
npm run build
npx serverless deploy --stage prod
```

---

## 🎯 After Deployment

### 1. Get API URL

Deployment output shows:
```
🌐 API Gateway URL:
   https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

### 2. Test Production

```bash
./test-api.sh https://YOUR_API_GATEWAY_URL
```

### 3. Update Frontend

Edit `setly/src/environments/environment.ts`:
```typescript
apiUrl: 'https://YOUR_API_GATEWAY_URL/api',
apiBaseUrl: 'https://YOUR_API_GATEWAY_URL/api',
```

---

## 📊 Monitor & Debug

```bash
# View logs
npx serverless logs -f api --stage prod --tail

# Get deployment info  
npx serverless info --stage prod

# Test health
curl https://YOUR_API_URL/api/health
```

---

## 🔧 Troubleshooting

**MongoDB connection fails:**
```bash
# Verify secret
aws secretsmanager get-secret-value \
  --secret-id setly/prod/mongodb-uri \
  --region us-east-1

# Check network access in MongoDB Atlas (should be 0.0.0.0/0)
```

**Deployment fails:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Deploy with verbose logging
npx serverless deploy --stage prod --verbose
```

---

## 📁 Environment Stages

- **prod**: Production (`./deploy-production.sh prod`)
- **stage**: Staging (`./deploy-production.sh stage`)
- **dev**: Development (`./deploy-production.sh dev`)

Each has separate:
- MongoDB database
- S3 bucket
- API Gateway URL
- CloudFront domain

---

## 💰 Costs

**Development**: $0-5/month (free tier)  
**Production** (10K users): $85-110/month

Breakdown:
- Lambda: $10-20
- MongoDB M10: $60  
- S3: $5-10
- CloudFront: $10-20

---

## ✅ Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string tested locally
- [ ] `./test-api.sh http://localhost:3000` passes
- [ ] `./deploy-production.sh prod` completes
- [ ] Health endpoint returns 200
- [ ] Production tests pass
- [ ] Frontend updated with API URL
- [ ] E2E tests complete
- [ ] https://setly.in works

---

## 🎉 Ready to Deploy!

Run:
```bash
./deploy-production.sh prod
```

Then test:
```bash
curl https://YOUR_API_URL/api/health
```

See **PRODUCTION_DEPLOYMENT.md** for detailed docs.

---

**Your backend will be live in 3-5 minutes! 🚀**
