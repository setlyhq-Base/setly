# 🎯 Setly Deployment - Command Reference

Quick reference for all deployment commands.

## 🚀 Backend Lambda Commands

### Deploy

```bash
cd SETLY/Setly-Code/backend-lambda

# Development
./deploy.sh dev

# Staging
./deploy.sh stage

# Production
./deploy.sh prod
```

### Secrets Setup (One-time)

```bash
# Interactive setup
./setup-secrets.sh dev

# Or manually
aws secretsmanager create-secret \
  --name "setly/dev/google-maps-api-key" \
  --secret-string '{"apiKey":"YOUR_KEY_HERE"}' \
  --region us-east-1
```

### Management

```bash
# View logs (live tail)
./infra.sh logs dev

# Test API
./infra.sh test dev

# Stack info
./infra.sh info dev

# Remove stack (careful!)
./infra.sh remove dev
```

### Manual Serverless Commands

```bash
# Deploy
npx serverless deploy --stage dev --verbose

# Deploy single function
npx serverless deploy function -f api --stage dev

# View logs
npx serverless logs -f api --stage dev --tail

# Remove stack
npx serverless remove --stage dev
```

## 🌐 Frontend Amplify Commands

### AWS CLI

```bash
# List Amplify apps
aws amplify list-apps --region us-east-1

# Get app details
aws amplify get-app --app-id YOUR_APP_ID --region us-east-1

# Trigger manual deployment
aws amplify start-job \
  --app-id YOUR_APP_ID \
  --branch-name feat/monorepo-setup \
  --job-type RELEASE \
  --region us-east-1
```

### Environment Variables

```bash
# List environment variables
aws amplify get-branch \
  --app-id YOUR_APP_ID \
  --branch-name feat/monorepo-setup \
  --region us-east-1 \
  --query 'branch.environmentVariables'

# Update environment variable (use Console for easier management)
aws amplify update-branch \
  --app-id YOUR_APP_ID \
  --branch-name feat/monorepo-setup \
  --environment-variables NG_API_URL=https://NEW_URL \
  --region us-east-1
```

## 🗄️ Database Commands

### MongoDB Atlas (if using)

```bash
# Store connection string
aws ssm put-parameter \
  --name '/setly/dev/mongodb-uri' \
  --value 'mongodb+srv://username:password@cluster.mongodb.net/setly' \
  --type SecureString \
  --region us-east-1

# Get connection string
aws ssm get-parameter \
  --name '/setly/dev/mongodb-uri' \
  --with-decryption \
  --region us-east-1 \
  --query 'Parameter.Value' \
  --output text
```

## 📦 S3 & CloudFront Commands

### S3 Bucket

```bash
# List buckets
aws s3 ls | grep setly-user-uploads

# List files in a bucket
aws s3 ls s3://setly-user-uploads-dev/ --recursive

# Get bucket size
aws s3 ls s3://setly-user-uploads-dev/ --recursive --summarize

# Delete all files (careful!)
aws s3 rm s3://setly-user-uploads-dev/ --recursive
```

### CloudFront

```bash
# List distributions
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Comment]'

# Get distribution details
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Invalidate cache (force refresh)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

# Get CloudFront domain from stack
aws cloudformation describe-stacks \
  --stack-name setly-backend-api-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
  --output text
```

## 🔐 Secrets Manager Commands

### List Secrets

```bash
# List all Setly secrets
aws secretsmanager list-secrets --region us-east-1 | grep setly

# List with details
aws secretsmanager list-secrets \
  --filters Key=name,Values=setly \
  --region us-east-1
```

### Get Secret Value

```bash
# Get Google Maps API key
aws secretsmanager get-secret-value \
  --secret-id setly/dev/google-maps-api-key \
  --region us-east-1 \
  --query 'SecretString' \
  --output text

# Pretty print JSON
aws secretsmanager get-secret-value \
  --secret-id setly/dev/google-maps-api-key \
  --region us-east-1 \
  --query 'SecretString' \
  --output text | jq '.'
```

### Update Secret

```bash
# Update secret value
aws secretsmanager update-secret \
  --secret-id setly/dev/google-maps-api-key \
  --secret-string '{"apiKey":"NEW_KEY_HERE"}' \
  --region us-east-1
```

### Delete Secret

```bash
# Schedule deletion (30 days recovery window)
aws secretsmanager delete-secret \
  --secret-id setly/dev/OLD_SECRET \
  --recovery-window-in-days 30 \
  --region us-east-1
```

## 📊 SSM Parameter Store Commands

### CloudFront Domain

```bash
# Store CloudFront domain
aws ssm put-parameter \
  --name '/setly/dev/cloudfront-domain' \
  --value 'd1234567890.cloudfront.net' \
  --type String \
  --region us-east-1

# Get CloudFront domain
aws ssm get-parameter \
  --name '/setly/dev/cloudfront-domain' \
  --region us-east-1 \
  --query 'Parameter.Value' \
  --output text

# List all parameters
aws ssm describe-parameters \
  --parameter-filters "Key=Name,Option=BeginsWith,Values=/setly/" \
  --region us-east-1
```

## 📝 CloudWatch Logs Commands

### View Logs

```bash
# List log groups
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/setly-backend-api" \
  --region us-east-1

# Tail logs (live)
aws logs tail /aws/lambda/setly-backend-api-dev-api \
  --follow \
  --region us-east-1

# Get recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/setly-backend-api-dev-api \
  --filter-pattern "ERROR" \
  --start-time $(date -u -v-1H +%s)000 \
  --region us-east-1
```

## 🧪 Testing Commands

### Backend Health Check

```bash
# Simple health check
curl https://YOUR-API.execute-api.us-east-1.amazonaws.com/dev/api/health

# With pretty JSON
curl -s https://YOUR-API.../dev/api/health | jq '.'

# Test explore endpoint
curl -s "https://YOUR-API.../dev/api/explore/trending?lat=40.7128&lng=-74.0060&city=New%20York" | jq '.'
```

### Frontend Testing

```bash
# Open in browser
open https://dev.setly.in

# Check build status
curl -s https://dev.setly.in | grep -i "setly"

# Test API proxy
curl -s https://dev.setly.in/api/health | jq '.'
```

## 🔄 Git & Deployment Workflow

### Frontend Deployment (via Git)

```bash
# Development
git add .
git commit -m "feat: add new feature"
git push origin feat/monorepo-setup
# Amplify auto-deploys dev.setly.in

# Staging
git checkout staging
git merge feat/monorepo-setup
git push origin staging
# Amplify auto-deploys stage.setly.in

# Production
git checkout main
git merge staging
git push origin main
# Amplify auto-deploys setly.in
```

### Backend Deployment

```bash
# Deploy to dev
cd SETLY/Setly-Code/backend-lambda
./deploy.sh dev

# Deploy to staging
./deploy.sh stage

# Deploy to production
./deploy.sh prod
```

## 🚨 Emergency Commands

### Rollback Backend

```bash
# List deployments
aws cloudformation list-stacks \
  --stack-status-filter UPDATE_COMPLETE \
  --query 'StackSummaries[?contains(StackName, `setly-backend-api-dev`)].StackName'

# Rollback is not direct - redeploy previous version from Git
git checkout <previous-commit>
cd SETLY/Setly-Code/backend-lambda
./deploy.sh dev
```

### Rollback Frontend

```bash
# In Amplify Console
# App → Deployments → Select previous build → "Redeploy this version"

# Or via CLI
aws amplify start-job \
  --app-id YOUR_APP_ID \
  --branch-name feat/monorepo-setup \
  --job-id PREVIOUS_JOB_ID \
  --region us-east-1
```

### Clear Cache

```bash
# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

# Lambda doesn't have persistent cache (auto-cleared on redeploy)
```

## 📋 Pre-Deployment Checklist Commands

```bash
# Check AWS credentials
aws sts get-caller-identity

# Check Node version
node --version  # Should be 20.x

# Check AWS CLI version
aws --version

# Test S3 access
aws s3 ls

# Test Secrets Manager access
aws secretsmanager list-secrets --region us-east-1

# Test CloudFormation access
aws cloudformation list-stacks --region us-east-1
```

## 🎯 One-Liner Commands

```bash
# Full backend deploy with tests
cd SETLY/Setly-Code/backend-lambda && npm run build && ./deploy.sh dev && ./infra.sh test dev

# Get all environment info
echo "Backend:" && aws cloudformation describe-stacks --stack-name setly-backend-api-dev --query 'Stacks[0].Outputs' && echo "CloudFront:" && aws ssm get-parameter --name '/setly/dev/cloudfront-domain' --query 'Parameter.Value'

# Quick logs check for errors
aws logs tail /aws/lambda/setly-backend-api-dev-api --since 5m --filter-pattern "ERROR"

# Bucket usage summary
aws s3 ls s3://setly-user-uploads-dev/ --recursive --summarize | grep "Total"
```

---

**Pro Tip**: Add these as aliases in your `~/.zshrc`:

```bash
alias setly-deploy-dev='cd /path/to/setly/SETLY/Setly-Code/backend-lambda && ./deploy.sh dev'
alias setly-logs='cd /path/to/setly/SETLY/Setly-Code/backend-lambda && ./infra.sh logs dev'
alias setly-test='cd /path/to/setly/SETLY/Setly-Code/backend-lambda && ./infra.sh test dev'
```

Then just run: `setly-deploy-dev`, `setly-logs`, `setly-test` 🚀
