# 🎯 Setly Production Deployment Checklist

Use this checklist to deploy Setly to AWS with zero issues.

## ✅ Pre-Deployment

- [ ] AWS Account created and verified
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS CLI configured (`aws configure`)
- [ ] Node.js 20.x installed (`node --version`)
- [ ] Git repository access granted
- [ ] API keys obtained:
  - [ ] Google Maps API Key
  - [ ] Ticketmaster API Key  
  - [ ] Eventbrite API Key (optional)

## 📦 Backend Lambda Deployment

### Step 1: Install Dependencies

```bash
cd SETLY/Setly-Code/backend-lambda
npm install
```

- [ ] All dependencies installed without errors
- [ ] TypeScript compiles (`npm run build`)

### Step 2: Store API Keys in Secrets Manager

```bash
chmod +x setup-secrets.sh
./setup-secrets.sh dev
```

When prompted, enter:
- [ ] Google Maps API Key
- [ ] Ticketmaster API Key
- [ ] Eventbrite API Key

Verify secrets exist:
```bash
aws secretsmanager list-secrets --region us-east-1 | grep setly
```

- [ ] Secrets appear in list

### Step 3: Deploy Backend to AWS

```bash
chmod +x deploy.sh
./deploy.sh dev
```

Wait for deployment (2-5 minutes). Note the output:

- [ ] ✅ Deployment successful
- [ ] API Gateway URL noted: `https://________.execute-api.us-east-1.amazonaws.com/dev`
- [ ] CloudFront distribution created

### Step 4: Store CloudFront Domain

Get the CloudFront domain:

```bash
aws cloudformation describe-stacks \
  --stack-name setly-backend-api-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
  --output text
```

Store it:

```bash
aws ssm put-parameter \
  --name '/setly/dev/cloudfront-domain' \
  --value 'd____________.cloudfront.net' \
  --type String \
  --region us-east-1
```

- [ ] CloudFront domain stored in SSM
- [ ] Domain starts with `d` and ends with `.cloudfront.net`

### Step 5: Set Up MongoDB (Optional - can do later)

If using MongoDB Atlas:

```bash
aws ssm put-parameter \
  --name '/setly/dev/mongodb-uri' \
  --value 'mongodb+srv://username:password@cluster.mongodb.net/setly' \
  --type SecureString \
  --region us-east-1
```

- [ ] MongoDB URI stored (or skip if using DynamoDB)

### Step 6: Test Backend

```bash
./infra.sh test dev
```

OR manually:

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

- [ ] Health endpoint returns 200 OK
- [ ] Response contains correct stage

## 🌐 Frontend Amplify Deployment

### Step 1: Connect Repository to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Select GitHub
4. Choose repository: `setlyhq-Base/setly`
5. Choose branch: `feat/monorepo-setup` (for dev)

- [ ] Repository connected
- [ ] Branch selected

### Step 2: Configure Build Settings

Amplify should auto-detect `amplify.yml`. Verify it shows:

```yaml
Build image: Default
Build specification: amplify.yml detected
```

- [ ] Build specification detected
- [ ] Monorepo path correct: `SETLY/Setly-Code/setly`

### Step 3: Add Environment Variables

App Settings → Environment Variables → Add:

```
NODE_VERSION = 20
NPM_FLAGS = --legacy-peer-deps
AMPLIFY_ENV = development
NG_API_URL = https://YOUR-API-GATEWAY-URL.amazonaws.com/dev
```

**Replace `YOUR-API-GATEWAY-URL`** with your actual API Gateway URL from Step 3 above.

- [ ] All 4 environment variables added
- [ ] `NG_API_URL` points to your deployed Lambda

### Step 4: Configure Redirects (Critical!)

Two options:

#### Option A: Amplify Console (Recommended)
1. App Settings → Rewrites and redirects
2. Add rule:
   - Source: `/api/<*>`
   - Target: `https://YOUR-API-GATEWAY-URL.../dev/api/<*>`
   - Type: `200 (Rewrite)`

#### Option B: Direct API Calls
- Skip redirects, frontend will use `NG_API_URL` directly

- [ ] Redirects configured (Option A) OR
- [ ] Using direct API URL (Option B)

### Step 5: Deploy Frontend

1. Save all settings
2. Click "Save and deploy"
3. Wait for build (5-10 minutes)

Monitor build logs for:
- [ ] ✅ Provision
- [ ] ✅ Build (watch for errors)
- [ ] ✅ Deploy
- [ ] ✅ Verify

### Step 6: Configure Custom Domain (Optional)

If using `dev.setly.in`:

1. Domain management → Add domain
2. Enter: `setly.in`
3. Add subdomain: `dev`
4. Update DNS records as shown

- [ ] Domain added
- [ ] DNS configured
- [ ] SSL certificate issued

### Step 7: Test Frontend

Visit: `https://dev.setly.in` (or your Amplify URL)

Open DevTools → Network tab:

- [ ] Page loads without errors
- [ ] Navigate to Explore page
- [ ] API calls go to `/api/explore/...`
- [ ] Requests return 200 (not 404 or CORS errors)
- [ ] City search autocomplete works
- [ ] Explore categories load data
- [ ] No "api.setly.com" errors in console

## 🧪 End-to-End Testing

### Test Explore Page
- [ ] Visit Explore page
- [ ] Click location button
- [ ] Search for "New York"
- [ ] Select city from results
- [ ] All categories load (Trending, Restaurants, Places, etc.)
- [ ] No blinking when switching cities
- [ ] Data appears within 2 seconds

### Test Image Upload (Future - requires DB)
- [ ] Create room listing
- [ ] Upload photos
- [ ] Photos appear via CloudFront URLs
- [ ] Photos load fast globally

## 🔄 Deploy to Staging & Production

### Staging Environment

Repeat all steps above with:
- Branch: `staging`
- Stage: `stage`
- Domain: `stage.setly.in`
- Environment: `AMPLIFY_ENV=staging`

### Production Environment

Repeat all steps above with:
- Branch: `main`
- Stage: `prod`
- Domain: `setly.in`
- Environment: `AMPLIFY_ENV=production`

## 🛡️ Security Verification

- [ ] No API keys visible in frontend code
- [ ] All API calls go through Lambda (not direct to Google/Ticketmaster)
- [ ] S3 bucket is private (test direct URL fails)
- [ ] CloudFront URLs work
- [ ] CORS errors only from unauthorized domains
- [ ] Rate limiting works (test 101+ requests)

## 📊 Monitoring Setup

### CloudWatch Logs
```bash
./infra.sh logs dev
```

- [ ] Logs streaming
- [ ] No errors in logs

### CloudWatch Alarms (Optional)
- [ ] 5xx error alarm created
- [ ] Lambda throttle alarm created
- [ ] API Gateway latency alarm created

## 🎉 Success Criteria

Your deployment is successful when:

✅ Backend:
- Health endpoint returns 200
- Explore endpoints return data
- CloudFront serves images
- Secrets are in Secrets Manager
- Logs appear in CloudWatch

✅ Frontend:
- Site loads at domain
- No console errors
- Explore page works
- City switching is smooth
- All API calls succeed

✅ Integration:
- Frontend calls Lambda (not external APIs directly)
- Images upload to S3
- CloudFront delivers images
- No CORS errors
- Rate limiting active

## 🐛 Troubleshooting

### Backend won't deploy
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check serverless version
npx serverless --version

# Try verbose deploy
npx serverless deploy --stage dev --verbose
```

### Frontend build fails
- Check Node version in Amplify (should be 20)
- Check `NPM_FLAGS = --legacy-peer-deps` is set
- Review Amplify build logs for specific error

### API calls return 404
- Verify redirects are configured in Amplify
- Check `NG_API_URL` environment variable
- Test backend health endpoint directly

### CORS errors
- Verify CORS origins in `backend-lambda/src/index.ts`
- Add your Amplify domain to allowed origins
- Redeploy backend: `./deploy.sh dev`

### Images not loading
- Check CloudFront domain in SSM
- Verify S3 bucket policy allows CloudFront OAI
- Test CloudFront URL directly in browser

## 📞 Support

If stuck:
1. Check CloudWatch Logs: `./infra.sh logs dev`
2. Check Amplify build logs in console
3. Review `QUICK-START.md` for detailed explanations
4. Check `DEPLOYMENT.md` for architecture details

## ✨ You're Done!

Once all checkboxes are ✅, your production infrastructure is live!

**Next steps:**
- Implement database layer (MongoDB/DynamoDB)
- Add authentication (Firebase/Cognito)
- Set up monitoring dashboards
- Configure automated tests
- Plan staging/production deployments

🚀 **Congratulations on deploying Setly to AWS!**
