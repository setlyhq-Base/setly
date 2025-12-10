# Backend Deployment Guide

## Prerequisites

1. **MongoDB Atlas Setup** (Free Tier)
   - Go to https://www.mongodb.com/cloud/atlas
   - Create account/login
   - Create new cluster (M0 Free tier)
   - Database name: `setly-dev`
   - Network Access: Allow all IPs (0.0.0.0/0) for Lambda
   - Database User: Create with username/password

2. **Get Connection String**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/setly-dev?retryWrites=true&w=majority
   ```

## AWS SSM Parameter Setup

Set MongoDB URI in AWS Systems Manager Parameter Store:

```bash
# Dev environment
aws ssm put-parameter \
  --name "/setly/dev/mongodb-uri" \
  --value "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/setly-dev?retryWrites=true&w=majority" \
  --type "SecureString" \
  --region us-east-1

# Stage environment (optional)
aws ssm put-parameter \
  --name "/setly/stage/mongodb-uri" \
  --value "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/setly-stage?retryWrites=true&w=majority" \
  --type "SecureString" \
  --region us-east-1

# Production (optional)
aws ssm put-parameter \
  --name "/setly/prod/mongodb-uri" \
  --value "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/setly-prod?retryWrites=true&w=majority" \
  --type "SecureString" \
  --region us-east-1
```

## CloudFront Domain SSM Setup

If not already set:

```bash
aws ssm put-parameter \
  --name "/setly/dev/cloudfront-domain" \
  --value "YOUR_CLOUDFRONT_DISTRIBUTION.cloudfront.net" \
  --type "String" \
  --region us-east-1
```

## Deployment

1. **Install Dependencies**
   ```bash
   cd backend-lambda
   npm install
   ```

2. **Build TypeScript**
   ```bash
   npm run build
   ```

3. **Deploy to AWS Lambda**
   ```bash
   # Dev environment (default)
   npx serverless deploy

   # Specific stage
   npx serverless deploy --stage dev
   npx serverless deploy --stage stage
   npx serverless deploy --stage prod
   ```

4. **Verify Deployment**
   ```bash
   # Get API endpoint
   npx serverless info

   # Test health endpoint
   curl https://YOUR_API_GATEWAY_URL/api/health
   ```

## Testing Endpoints

```bash
# Health check
curl https://YOUR_API_URL/api/health

# Create a room
curl -X POST https://YOUR_API_URL/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "title": "Cozy Studio near Campus",
    "description": "Perfect for students",
    "address": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "price": 1200,
    "roomType": "private",
    "images": []
  }'

# Search rooms
curl "https://YOUR_API_URL/api/rooms?city=Boston"

# Get room by ID
curl "https://YOUR_API_URL/api/rooms/ROOM_ID"
```

## Environment Variables

The following are automatically configured via serverless.yml:

- `MONGODB_URI` - From SSM Parameter Store
- `S3_BUCKET_NAME` - Auto-generated bucket name
- `CLOUDFRONT_DOMAIN` - From SSM Parameter Store
- `STAGE` - Deployment stage (dev/stage/prod)

## Database Collections

MongoDB will auto-create these collections:

- **users** - User profiles with saved items
- **rooms** - Room listings
- **rides** - Rideshare listings
- **marketplace** - Marketplace items
- **conversations** - Messages and conversations

All collections have proper indexes configured in the models.

## Monitoring

```bash
# View logs
npx serverless logs -f api --tail

# View specific stage
npx serverless logs -f api --stage dev --tail
```

## Rollback

```bash
# Rollback to previous deployment
npx serverless rollback --stage dev
```

## Remove Deployment

```bash
# WARNING: This will delete everything
npx serverless remove --stage dev
```

## Troubleshooting

### MongoDB Connection Issues

1. Check SSM parameter exists:
   ```bash
   aws ssm get-parameter --name "/setly/dev/mongodb-uri" --with-decryption
   ```

2. Verify Lambda has SSM permissions (already in serverless.yml)

3. Check MongoDB network access allows AWS IP ranges

### Lambda Timeout

If queries are slow, increase timeout in serverless.yml:
```yaml
provider:
  timeout: 29  # Maximum for API Gateway
```

### Memory Issues

Increase memory if needed:
```yaml
provider:
  memorySize: 512  # Can go up to 10240 MB
```

## Next Steps

1. Set up MongoDB Atlas cluster
2. Configure SSM parameters
3. Run `npx serverless deploy`
4. Update frontend `environment.ts` with API Gateway URL
5. Test E2E flows (post → view → message)
