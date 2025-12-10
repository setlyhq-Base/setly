#!/bin/bash

# Setly Production Deployment - Automated Setup
# This script automates the complete deployment process

set -e  # Exit on error

echo "🚀 Setly Production Deployment Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGE=${1:-prod}
REGION="us-east-1"

echo -e "${BLUE}Deployment Stage: ${STAGE}${NC}"
echo -e "${BLUE}AWS Region: ${REGION}${NC}"
echo ""

# Step 1: Verify Prerequisites
echo "📋 Step 1/8: Verifying Prerequisites..."
echo "========================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check AWS CLI (try multiple locations)
AWS_CMD=""
if command -v aws &> /dev/null; then
    AWS_CMD="aws"
elif [ -f "/usr/local/bin/aws" ]; then
    AWS_CMD="/usr/local/bin/aws"
elif [ -f "$HOME/Library/Python/3.11/bin/aws" ]; then
    AWS_CMD="$HOME/Library/Python/3.11/bin/aws"
elif [ -f "$HOME/.local/bin/aws" ]; then
    AWS_CMD="$HOME/.local/bin/aws"
else
    echo -e "${RED}❌ AWS CLI not found${NC}"
    echo "Please install: brew install awscli"
    echo "Or: pip3 install awscli --user"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found: $AWS_CMD${NC}"

# Check AWS credentials
echo "Checking AWS credentials..."
if ! $AWS_CMD sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$($AWS_CMD sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account: $ACCOUNT_ID${NC}"
echo ""

# Step 2: MongoDB URI
echo "🗄️ Step 2/8: MongoDB Configuration"
echo "========================================"

# Check if MongoDB URI already exists in Secrets Manager
MONGO_SECRET_EXISTS=$($AWS_CMD secretsmanager list-secrets --region $REGION --query "SecretList[?Name=='setly/$STAGE/mongodb-uri'].Name" --output text 2>/dev/null || echo "")

if [ -z "$MONGO_SECRET_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  MongoDB URI not found in AWS Secrets Manager${NC}"
    echo ""
    echo "Please ensure you have:"
    echo "1. Created MongoDB Atlas cluster"
    echo "2. Configured network access (0.0.0.0/0)"
    echo "3. Created database user"
    echo "4. Obtained connection string"
    echo ""
    read -p "Do you have your MongoDB connection string? (y/n): " has_mongo
    
    if [[ $has_mongo != "y" && $has_mongo != "Y" ]]; then
        echo ""
        echo "Please set up MongoDB Atlas first:"
        echo "1. Go to https://mongodb.com/cloud/atlas"
        echo "2. Create M0 free cluster or M10+ for production"
        echo "3. Database name: setly-${STAGE}"
        echo "4. Get connection string (format: mongodb+srv://user:pass@cluster.mongodb.net/setly-${STAGE})"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
    
    echo ""
    read -sp "Enter MongoDB connection string: " MONGO_URI
    echo ""
    
    if [ -z "$MONGO_URI" ]; then
        echo -e "${RED}❌ MongoDB URI cannot be empty${NC}"
        exit 1
    fi
    
    echo "Saving MongoDB URI to AWS Secrets Manager..."
    $AWS_CMD secretsmanager create-secret \
        --name "setly/$STAGE/mongodb-uri" \
        --description "MongoDB Atlas connection string for Setly $STAGE" \
        --secret-string "$MONGO_URI" \
        --region $REGION
    
    echo -e "${GREEN}✓ MongoDB URI saved${NC}"
else
    echo -e "${GREEN}✓ MongoDB URI already configured in Secrets Manager${NC}"
fi
echo ""

# Step 3: Google Maps API Key
echo "🗺️ Step 3/8: Google Maps API Key"
echo "========================================"

GMAPS_SECRET_EXISTS=$($AWS_CMD secretsmanager list-secrets --region $REGION --query "SecretList[?Name=='setly/$STAGE/google-maps-api-key'].Name" --output text 2>/dev/null || echo "")

if [ -z "$GMAPS_SECRET_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  Google Maps API key not found${NC}"
    read -p "Enter Google Maps API key (or press Enter to skip): " GMAPS_KEY
    
    if [ ! -z "$GMAPS_KEY" ]; then
        $AWS_CMD secretsmanager create-secret \
            --name "setly/$STAGE/google-maps-api-key" \
            --secret-string "$GMAPS_KEY" \
            --region $REGION
        echo -e "${GREEN}✓ Google Maps API key saved${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipping Google Maps API key (Explore features may not work)${NC}"
    fi
else
    echo -e "${GREEN}✓ Google Maps API key already configured${NC}"
fi
echo ""

# Step 4: CloudFront Domain Placeholder
echo "☁️ Step 4/8: CloudFront Configuration"
echo "========================================"

CF_PARAM_EXISTS=$($AWS_CMD ssm get-parameter --name "/setly/$STAGE/cloudfront-domain" --region $REGION 2>/dev/null || echo "")

if [ -z "$CF_PARAM_EXISTS" ]; then
    echo "Creating CloudFront domain placeholder..."
    $AWS_CMD ssm put-parameter \
        --name "/setly/$STAGE/cloudfront-domain" \
        --value "placeholder.cloudfront.net" \
        --type "String" \
        --region $REGION 2>/dev/null || echo -e "${YELLOW}⚠️  SSM access denied - will configure after deployment${NC}"
    echo -e "${GREEN}✓ CloudFront will be configured after deployment${NC}"
else
    echo -e "${GREEN}✓ CloudFront domain already configured${NC}"
fi
echo ""

# Step 5: Install Dependencies
echo "📦 Step 5/8: Installing Dependencies"
echo "========================================"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 6: Build TypeScript
echo "🔨 Step 6/8: Building TypeScript"
echo "========================================"
npm run build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 7: Deploy to AWS
echo "☁️ Step 7/8: Deploying to AWS Lambda"
echo "========================================"
echo "This may take 2-3 minutes..."
echo ""

npx serverless deploy --stage $STAGE --region $REGION --verbose

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo ""

# Step 8: Extract and Update CloudFront Domain
echo "🔄 Step 8/8: Updating CloudFront Domain"
echo "========================================"

# Get CloudFront domain from stack output
echo "Fetching CloudFront domain from deployment..."
CF_DOMAIN=$($AWS_CMD cloudformation describe-stacks \
    --stack-name "setly-backend-api-$STAGE" \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$CF_DOMAIN" ] && [ "$CF_DOMAIN" != "placeholder.cloudfront.net" ]; then
    echo "Updating CloudFront domain: $CF_DOMAIN"
    $AWS_CMD ssm put-parameter \
        --name "/setly/$STAGE/cloudfront-domain" \
        --value "$CF_DOMAIN" \
        --type "String" \
        --region $REGION \
        --overwrite
    echo -e "${GREEN}✓ CloudFront domain updated${NC}"
else
    echo -e "${YELLOW}⚠️  CloudFront domain not found in stack output${NC}"
    echo "You may need to update it manually later"
fi
echo ""

# Final Output
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get API Gateway URL
API_URL=$($AWS_CMD cloudformation describe-stacks \
    --stack-name "setly-backend-api-$STAGE" \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceEndpoint'].OutputValue" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$API_URL" ]; then
    echo -e "${BLUE}🌐 API Gateway URL:${NC}"
    echo "   $API_URL"
    echo ""
fi

if [ ! -z "$CF_DOMAIN" ]; then
    echo -e "${BLUE}☁️ CloudFront Domain:${NC}"
    echo "   https://$CF_DOMAIN"
    echo ""
fi

# Get S3 bucket
S3_BUCKET=$($AWS_CMD cloudformation describe-stacks \
    --stack-name "setly-backend-api-$STAGE" \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
    --output text 2>/dev/null || echo "")

if [ ! -z "$S3_BUCKET" ]; then
    echo -e "${BLUE}🗄️ S3 Bucket:${NC}"
    echo "   $S3_BUCKET"
    echo ""
fi

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Test health endpoint:"
echo "   curl $API_URL/api/health"
echo ""
echo "2. Update frontend environment.ts:"
echo "   apiUrl: '$API_URL/api'"
echo "   cloudFrontDomain: '$CF_DOMAIN'"
echo ""
echo "3. Deploy frontend to Amplify"
echo ""
echo "4. Run E2E tests (see PRODUCTION_DEPLOYMENT.md)"
echo ""

echo -e "${GREEN}🎉 Your backend is now live!${NC}"
echo ""
