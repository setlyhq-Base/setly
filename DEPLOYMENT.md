# Setly - Production Deployment Guide

This guide covers the complete setup for deploying Setly to production on AWS.

## 🎯 Overview

- **Frontend**: AWS Amplify (setly.in)
- **Backend**: AWS Lambda + API Gateway
- **Storage**: S3 + CloudFront CDN
- **Secrets**: AWS Secrets Manager
- **Database**: MongoDB Atlas / DynamoDB

## 📋 Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js 20.x installed
4. Git repository access
5. API keys for:
   - Google Maps
   - Ticketmaster
   - Eventbrite

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Backend Lambda

```bash
cd SETLY/Setly-Code/backend-lambda

# Install dependencies
npm install

# Set up secrets (run once per environment)
chmod +x setup-secrets.sh
./setup-secrets.sh dev
./setup-secrets.sh stage
./setup-secrets.sh prod

# Deploy to dev
chmod +x deploy.sh
./deploy.sh dev
```

**Note the API Gateway URL** from the deployment output (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/dev`)

### Step 2: Store CloudFront Domain

After deployment, CloudFront distribution will be created. Get the domain:

```bash
aws cloudformation describe-stacks \
  --stack-name setly-backend-api-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionDomain`].OutputValue' \
  --output text
```

Store it in SSM:

```bash
aws ssm put-parameter \
  --name '/setly/dev/cloudfront-domain' \
  --value 'd1234567890.cloudfront.net' \
  --type String \
  --region us-east-1
```

### Step 3: Set Up MongoDB

1. Create MongoDB Atlas cluster (or DynamoDB table)
2. Store connection string:

```bash
aws ssm put-parameter \
  --name '/setly/dev/mongodb-uri' \
  --value 'mongodb+srv://...' \
  --type SecureString \
  --region us-east-1
```

### Step 4: Configure AWS Amplify

1. **Connect Repository**:
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect GitHub repository: `setlyhq-Base/setly`
   - Branch: `feat/monorepo-setup` → `dev.setly.in`
   - Branch: `staging` → `stage.setly.in`
   - Branch: `main` → `setly.in`

2. **Configure Build Settings**:
   - Amplify will auto-detect `amplify.yml`
   - Verify it points to: `SETLY/Setly-Code/setly`

3. **Add Environment Variables**:
   Go to App Settings → Environment Variables, add:

   **For all environments:**
   ```
   NODE_VERSION=20
   NPM_FLAGS=--legacy-peer-deps
   ```

   **For dev:**
   ```
   AMPLIFY_ENV=development
   VITE_API_URL=https://YOUR-DEV-API.execute-api.us-east-1.amazonaws.com/dev
   ```

   **For stage:**
   ```
   AMPLIFY_ENV=staging
   VITE_API_URL=https://YOUR-STAGE-API.execute-api.us-east-1.amazonaws.com/stage
   ```

   **For prod:**
   ```
   AMPLIFY_ENV=production
   VITE_API_URL=https://YOUR-PROD-API.execute-api.us-east-1.amazonaws.com/prod
   ```

4. **Configure Custom Domain** (if using setly.in):
   - Go to Domain Management
   - Add domain: `setly.in`
   - Add subdomains: `dev.setly.in`, `stage.setly.in`
   - Update DNS records as instructed

### Step 5: Update Frontend Environment Files

The backend is now deployed, so update frontend to use the API:

1. Open `SETLY/Setly-Code/setly/src/environments/environment.ts`
2. The relative `/api` paths will work if you add Amplify redirects OR update to absolute URLs:

```typescript
export const environment = {
  production: true,
  apiUrl: process.env['VITE_API_URL'] + '/api',
  apiBaseUrl: process.env['VITE_API_URL'] + '/api',
  // ... rest of config
};
```

### Step 6: Test the Deployment

1. **Test Backend**:
   ```bash
   curl https://YOUR-API.execute-api.us-east-1.amazonaws.com/dev/api/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "stage": "dev",
     "timestamp": "2025-12-10T..."
   }
   ```

2. **Test Frontend**:
   - Visit `https://dev.setly.in`
   - Open browser DevTools → Network tab
   - Navigate to Explore page
   - Verify API calls go to your Lambda backend (not `api.setly.com`)

3. **Test Image Upload**:
   - Create a room/ride/marketplace listing
   - Upload photos
   - Verify they appear via CloudFront URLs

## 🔐 Security Checklist

- [x] API keys stored in Secrets Manager (not in code)
- [x] S3 bucket is private (CloudFront OAI access only)
- [x] CORS configured for specific domains
- [x] Rate limiting enabled on all endpoints
- [x] HTTPS enforced everywhere
- [x] Security headers configured in Amplify

## 🌍 Environment Summary

| Environment | Frontend URL      | Backend Stage | Branch               |
|-------------|-------------------|---------------|----------------------|
| Dev         | dev.setly.in      | dev           | feat/monorepo-setup  |
| Stage       | stage.setly.in    | stage         | staging              |
| Prod        | setly.in          | prod          | main                 |

## 📊 Monitoring

1. **CloudWatch Logs**:
   - Lambda logs: `/aws/lambda/setly-backend-api-{stage}-api`
   - View errors and performance metrics

2. **API Gateway Metrics**:
   - Requests, latency, errors
   - Set up alarms for 4xx/5xx errors

3. **S3 & CloudFront**:
   - Monitor bandwidth usage
   - Set up lifecycle rules for old uploads

## 🛠️ Common Issues

### Issue: API calls return CORS errors

**Solution**: Verify CORS origins in `backend-lambda/src/index.ts` match your Amplify domains

### Issue: Images not loading from CloudFront

**Solution**: 
1. Check CloudFront distribution is deployed
2. Verify S3 bucket policy allows CloudFront OAI
3. Check CloudFront domain is stored in SSM

### Issue: Rate limit errors

**Solution**: Adjust rate limits in `backend-lambda/src/middleware/rateLimiter.ts`

### Issue: Secrets not found

**Solution**: Verify secrets exist in Secrets Manager with correct naming:
```bash
aws secretsmanager list-secrets --region us-east-1 | grep setly
```

## 🔄 Making Updates

### Update Frontend:
1. Push to branch (feat/monorepo-setup, staging, or main)
2. Amplify auto-deploys

### Update Backend:
```bash
cd SETLY/Setly-Code/backend-lambda
npm run build
./deploy.sh dev   # or stage/prod
```

## 📞 Support

For deployment issues, check:
1. CloudWatch Logs
2. Amplify build logs
3. API Gateway execution logs

## Next Steps

1. ✅ Deploy backend Lambda
2. ✅ Configure Amplify
3. ✅ Test end-to-end
4. ⬜ Implement database layer (MongoDB/DynamoDB)
5. ⬜ Add authentication
6. ⬜ Set up monitoring dashboards
7. ⬜ Configure CI/CD tests
