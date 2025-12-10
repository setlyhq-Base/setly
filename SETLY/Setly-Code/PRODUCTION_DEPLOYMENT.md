# 🚀 Production Deployment Guide - Setly Backend

## Overview
This guide will deploy your backend to **AWS Lambda + API Gateway** with **MongoDB Atlas** for a fully production-ready environment.

---

## ✅ Prerequisites Checklist

### 1. AWS Account Setup
- [x] AWS account created
- [ ] AWS CLI installed and configured
- [ ] IAM user with appropriate permissions

### 2. MongoDB Atlas Setup
- [ ] MongoDB Atlas account created
- [ ] M0 (free) or M10+ cluster created
- [ ] Network access configured (0.0.0.0/0 for Lambda)
- [ ] Database user created
- [ ] Connection string obtained

### 3. Required Credentials
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] MongoDB connection string
- [ ] Google Maps API key (for Explore features)
- [ ] Ticketmaster API key (optional)
- [ ] Eventbrite API key (optional)

---

## 📋 Step-by-Step Deployment

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster:
   - **Tier**: M0 (Free) for dev, M10+ for production
   - **Region**: us-east-1 (same as Lambda)
   - **Database name**: `setly-prod` (or `setly-dev` for staging)

3. **Configure Network Access**:
   - Go to Network Access
   - Click "Add IP Address"
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for AWS Lambda to connect

4. **Create Database User**:
   - Go to Database Access
   - Click "Add New Database User"
   - Username: `setly-admin` (or your choice)
   - Password: Generate a secure password (save this!)
   - Privilege: "Atlas admin" or "Read and write to any database"

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string:
     ```
     mongodb+srv://setly-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://setly-admin:PASSWORD@cluster0.xxxxx.mongodb.net/setly-prod?retryWrites=true&w=majority`

---

### Step 2: Store Secrets in AWS Secrets Manager

We'll use AWS Secrets Manager (not SSM Parameter Store) for better security and automatic rotation support.

```bash
# Set your MongoDB URI
aws secretsmanager create-secret \
  --name setly/prod/mongodb-uri \
  --description "MongoDB Atlas connection string for Setly production" \
  --secret-string "mongodb+srv://setly-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/setly-prod?retryWrites=true&w=majority" \
  --region us-east-1

# Set Google Maps API Key (for Explore features)
aws secretsmanager create-secret \
  --name setly/prod/google-maps-api-key \
  --description "Google Maps API key for Setly" \
  --secret-string "YOUR_GOOGLE_MAPS_API_KEY" \
  --region us-east-1

# Optional: Ticketmaster API Key
aws secretsmanager create-secret \
  --name setly/prod/ticketmaster-api-key \
  --description "Ticketmaster API key for events" \
  --secret-string "YOUR_TICKETMASTER_KEY" \
  --region us-east-1

# Optional: Eventbrite API Key
aws secretsmanager create-secret \
  --name setly/prod/eventbrite-api-key \
  --description "Eventbrite API key for events" \
  --secret-string "YOUR_EVENTBRITE_KEY" \
  --region us-east-1
```

**For Dev/Staging environments**, use same commands with `/dev/` instead of `/prod/`:
```bash
aws secretsmanager create-secret \
  --name setly/dev/mongodb-uri \
  --secret-string "mongodb+srv://..." \
  --region us-east-1
```

**Verify secrets were created**:
```bash
aws secretsmanager list-secrets --region us-east-1 | grep setly
```

---

### Step 3: Set CloudFront Domain Placeholder (SSM Parameter Store)

CloudFront will be created during deployment, but we need a placeholder first:

```bash
aws ssm put-parameter \
  --name "/setly/prod/cloudfront-domain" \
  --value "placeholder.cloudfront.net" \
  --type "String" \
  --region us-east-1

# For dev
aws ssm put-parameter \
  --name "/setly/dev/cloudfront-domain" \
  --value "placeholder.cloudfront.net" \
  --type "String" \
  --region us-east-1
```

---

### Step 4: Build and Deploy Backend

```bash
cd backend-lambda

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to AWS Lambda (production)
npx serverless deploy --stage prod

# OR deploy to dev/staging
npx serverless deploy --stage dev
```

**Expected output**:
```
✔ Service deployed to stack setly-backend-api-prod (120s)

endpoint: ANY - https://abc123xyz.execute-api.us-east-1.amazonaws.com/{proxy+}
functions:
  api: setly-backend-api-prod-api (45 MB)

Stack Outputs:
  CloudFrontDistributionId: E1234567890ABC
  CloudFrontDomain: d1234567890abc.cloudfront.net
  S3BucketName: setly-user-uploads-prod
```

**Save the following from output**:
1. API Gateway URL: `https://abc123xyz.execute-api.us-east-1.amazonaws.com`
2. CloudFront Domain: `d1234567890abc.cloudfront.net`
3. S3 Bucket Name: `setly-user-uploads-prod`

---

### Step 5: Update CloudFront Domain in SSM

After deployment, update the CloudFront domain parameter:

```bash
# Get CloudFront domain from deployment output
CLOUDFRONT_DOMAIN="d1234567890abc.cloudfront.net"  # Replace with your actual domain

aws ssm put-parameter \
  --name "/setly/prod/cloudfront-domain" \
  --value "$CLOUDFRONT_DOMAIN" \
  --type "String" \
  --region us-east-1 \
  --overwrite
```

---

### Step 6: Test Backend Deployment

```bash
# Set your API URL
API_URL="https://abc123xyz.execute-api.us-east-1.amazonaws.com"

# Test health endpoint
curl $API_URL/api/health

# Expected response:
# {"status":"healthy","stage":"prod","timestamp":"2024-01-15T10:30:00.000Z"}

# Test creating a user
curl -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "name": "Test User"
  }'

# Test creating a room
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

# Get upload URL
curl "$API_URL/api/upload/presigned-url?fileName=test.jpg&fileType=image/jpeg&userId=test-user-123&category=room"
```

---

### Step 7: Update Frontend Configuration

#### For Production (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/api',
  apiBaseUrl: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/api',
  cloudFrontDomain: 'd1234567890abc.cloudfront.net',
  // ... rest of config
};
```

#### For Local Development (`proxy.conf.json`):
Keep pointing to localhost OR update to use Lambda:
```json
{
  "/api": {
    "target": "https://abc123xyz.execute-api.us-east-1.amazonaws.com",
    "secure": true,
    "changeOrigin": true
  }
}
```

---

### Step 8: Deploy Frontend to AWS Amplify

1. **Connect GitHub repository**:
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect GitHub: `setlyhq-Base/setly`
   - Branch: `feat/monorepo-setup` or `main`

2. **Configure build settings**:
   - App root directory: `SETLY/Setly-Code/setly`
   - Build command: `npm run build`
   - Output directory: `dist/setly/browser`

3. **Set environment variables** in Amplify:
   ```
   NODE_VERSION=20
   AMPLIFY_MONOREPO_APP_ROOT=SETLY/Setly-Code/setly
   ```

4. **Deploy**:
   - Click "Save and deploy"
   - Wait for deployment to complete
   - Access at: `https://main.XXXXX.amplifyapp.com`

5. **Set custom domain** (optional):
   - Add domain: `setly.in`
   - Follow DNS configuration steps
   - Wait for SSL certificate provisioning

---

## 🔒 Security Best Practices

### 1. Rotate Secrets Regularly
```bash
# Update MongoDB password
aws secretsmanager update-secret \
  --secret-id setly/prod/mongodb-uri \
  --secret-string "NEW_CONNECTION_STRING" \
  --region us-east-1
```

### 2. Enable AWS CloudWatch Alarms
```bash
# Monitor Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name setly-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### 3. Enable API Gateway Throttling
API Gateway throttling is automatically configured in `serverless.yml`:
- Burst: 100 requests
- Rate: 50 requests/second

### 4. MongoDB IP Whitelist (Production)
For production, restrict MongoDB access to AWS Lambda IP ranges instead of 0.0.0.0/0:
- Use AWS VPC with NAT Gateway
- Whitelist NAT Gateway IP in MongoDB Atlas

---

## 📊 Monitoring & Logging

### View Lambda Logs
```bash
# Tail logs in real-time
npx serverless logs -f api --stage prod --tail

# View last 100 lines
npx serverless logs -f api --stage prod

# Filter by time
npx serverless logs -f api --stage prod --startTime 1h
```

### CloudWatch Insights Query
```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

### MongoDB Atlas Monitoring
- Go to Atlas Dashboard → Metrics
- Monitor:
  - Connection count
  - Query performance
  - Storage usage
  - Network I/O

---

## 🚨 Troubleshooting

### Issue: MongoDB connection timeout
**Solution**:
1. Verify network access allows 0.0.0.0/0
2. Check connection string format
3. Verify username/password are correct
4. Test connection locally:
   ```bash
   mongosh "YOUR_CONNECTION_STRING"
   ```

### Issue: Lambda timeout errors
**Solution**:
1. Increase timeout in `serverless.yml` (max 900s for non-API Gateway)
2. For API Gateway, max is 29 seconds
3. Optimize database queries with indexes
4. Use connection pooling (already configured)

### Issue: CORS errors
**Solution**:
1. Verify frontend domain is in CORS config (`serverless.yml`)
2. Redeploy after updating CORS settings
3. Check browser console for exact error

### Issue: S3 upload fails
**Solution**:
1. Verify S3 bucket exists: `aws s3 ls s3://setly-user-uploads-prod`
2. Check IAM permissions in `serverless.yml`
3. Test presigned URL generation locally

---

## 📈 Scaling Considerations

### Current Setup (Good for 0-10K users):
- Lambda: 512MB memory, 29s timeout
- MongoDB: M0 free tier (512MB storage)
- API Gateway: Standard throttling

### Scaling to 10K-100K users:
- Upgrade MongoDB to M10 ($0.08/hr = ~$60/month)
- Add ElastiCache Redis for caching
- Increase Lambda concurrency limits
- Enable CloudFront caching for static assets

### Scaling beyond 100K users:
- MongoDB M30+ with sharding
- Multi-region deployment
- DynamoDB for high-frequency reads
- SQS for async processing

---

## 💰 Cost Estimation

### Development (Monthly):
- Lambda: $0-2 (free tier)
- API Gateway: $0-1 (free tier)
- MongoDB M0: $0 (free)
- S3: $0-1
- CloudFront: $0-2
- **Total: $0-6/month**

### Production (Monthly, 10K active users):
- Lambda: $10-20
- API Gateway: $5-10
- MongoDB M10: $60
- S3: $5-10
- CloudFront: $10-20
- **Total: $90-120/month**

---

## ✅ Post-Deployment Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Can create user profile
- [ ] Can create room listing
- [ ] Can search rooms
- [ ] Image upload works (S3 presigned URL)
- [ ] Can create conversation
- [ ] Can send messages
- [ ] Profile page loads data
- [ ] Saved items work
- [ ] Frontend deployed to Amplify
- [ ] Custom domain configured (setly.in)
- [ ] SSL certificate active
- [ ] CloudWatch alarms configured
- [ ] MongoDB backups enabled

---

## 🎉 Deployment Complete!

Your backend is now running on:
- **API**: https://YOUR_API_GATEWAY_URL
- **Frontend**: https://setly.in

Next steps:
1. Run E2E tests (see COMPLETE_SETUP_GUIDE.md)
2. Monitor CloudWatch logs
3. Set up CI/CD pipeline
4. Configure automated backups
5. Enable AWS WAF for security

---

## 📞 Support Resources

- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Amplify Docs](https://docs.amplify.aws/)
