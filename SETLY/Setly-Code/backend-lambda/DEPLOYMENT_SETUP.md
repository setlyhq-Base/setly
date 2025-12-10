# Backend Deployment - Setup Guide

## Prerequisites Setup

You need to complete these steps before deploying:

### 1. Install AWS CLI

**Option A - Using Homebrew (Recommended for Mac):**
```bash
brew install awscli
```

**Option B - Using pip:**
```bash
pip3 install awscli --user
```

**Option C - Official Installer:**
Download from: https://aws.amazon.com/cli/

After installation, verify:
```bash
aws --version
```

### 2. Configure AWS Credentials

Run the AWS configuration wizard:
```bash
aws configure
```

You'll need:
- **AWS Access Key ID**: From your AWS IAM console
- **AWS Secret Access Key**: From your AWS IAM console
- **Default region**: `us-east-1`
- **Default output format**: `json`

**To get AWS credentials:**
1. Go to https://console.aws.amazon.com/iam/
2. Click "Users" → Your username
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Choose "CLI" and create
6. Copy the Access Key ID and Secret Access Key

### 3. Set up MongoDB Atlas

1. Go to https://mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a new cluster (Free M0 tier is fine for dev)
4. Database name: `setly-dev`
5. **Network Access**: Add IP → Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Lambda to connect
6. **Database Access**: Create user
   - Username: `setly-admin` (or your choice)
   - Password: Generate a secure password
   - Role: Read and write to any database
7. Get connection string:
   - Click "Connect" → "Drivers" → "Node.js"
   - Copy connection string:
     ```
     mongodb+srv://setly-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/setly-dev?retryWrites=true&w=majority
     ```
   - Replace `YOUR_PASSWORD` with your actual password

### 4. Store MongoDB URI in AWS SSM

Once you have AWS CLI configured:

```bash
# Replace with your actual connection string
aws ssm put-parameter \
  --name "/setly/dev/mongodb-uri" \
  --value "mongodb+srv://setly-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/setly-dev?retryWrites=true&w=majority" \
  --type "SecureString" \
  --region us-east-1

# Verify it was saved
aws ssm get-parameter --name "/setly/dev/mongodb-uri" --with-decryption --region us-east-1
```

### 5. Set CloudFront Domain Placeholder

```bash
# This will be updated after first deployment
aws ssm put-parameter \
  --name "/setly/dev/cloudfront-domain" \
  --value "placeholder.cloudfront.net" \
  --type "String" \
  --region us-east-1
```

## Deployment Steps

Once all prerequisites are complete:

```bash
cd backend-lambda

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to AWS
npx serverless deploy --stage dev
```

## Expected Output

After successful deployment, you'll see:

```
✔ Service deployed to stack setly-backend-api-dev

endpoint: ANY - https://abc123xyz.execute-api.us-east-1.amazonaws.com/{proxy+}
functions:
  api: setly-backend-api-dev-api
```

## Post-Deployment

1. **Copy the API Gateway URL** from the deployment output
2. **Test the health endpoint:**
   ```bash
   curl https://YOUR_API_GATEWAY_URL/api/health
   ```

3. **Update frontend proxy** (for local development):
   Edit `setly/proxy.conf.json`:
   ```json
   {
     "/api": {
       "target": "https://YOUR_API_GATEWAY_URL",
       "secure": true,
       "changeOrigin": true
     }
   }
   ```

4. **For production**, update `setly/src/environments/environment.ts`:
   ```typescript
   apiUrl: 'https://YOUR_API_GATEWAY_URL/api',
   apiBaseUrl: 'https://YOUR_API_GATEWAY_URL/api',
   ```

## Troubleshooting

### AWS CLI not found
```bash
# Add to ~/.zshrc or ~/.bashrc
export PATH="$HOME/Library/Python/3.x/bin:$PATH"  # If installed via pip
# or
export PATH="/opt/homebrew/bin:$PATH"  # If installed via Homebrew
```

### AWS credentials not configured
```bash
aws configure
# Or manually create ~/.aws/credentials:
mkdir -p ~/.aws
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
EOF
```

### MongoDB connection errors
- Verify network access allows 0.0.0.0/0
- Check connection string has correct password (no special chars need encoding)
- Test connection string locally:
  ```bash
  mongosh "YOUR_CONNECTION_STRING"
  ```

### Deployment errors
- Check AWS credentials: `aws sts get-caller-identity`
- Verify SSM parameters exist: `aws ssm describe-parameters --region us-east-1`
- Check CloudFormation stack: https://console.aws.amazon.com/cloudformation/

## Quick Reference Commands

```bash
# View deployment info
npx serverless info --stage dev

# View logs
npx serverless logs -f api --stage dev --tail

# Remove deployment (WARNING: destructive)
npx serverless remove --stage dev

# Update single function (faster)
npx serverless deploy function -f api --stage dev
```

## Cost Estimate

- **Lambda**: Free tier covers 1M requests/month
- **API Gateway**: Free tier covers 1M requests/month
- **MongoDB Atlas**: M0 tier is free forever
- **S3**: ~$0.01-0.10/month
- **CloudFront**: First 1TB free for 12 months

**Total dev cost**: ~$0-5/month

## Next Steps After Deployment

1. Test all API endpoints (see COMPLETE_SETUP_GUIDE.md)
2. Run E2E tests
3. Update CloudFront domain in SSM after first deploy
4. Set up CI/CD for automated deployments
5. Configure custom domain for API (optional)
