#!/bin/bash

# Setly Backend Lambda Deployment Script
# This script deploys the backend to AWS Lambda + API Gateway

set -e

STAGE=${1:-dev}

echo "🚀 Deploying Setly Backend to AWS Lambda - Stage: $STAGE"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure'"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Deploy with Serverless Framework
echo "☁️ Deploying to AWS..."
npx serverless deploy --stage $STAGE --verbose

echo "✅ Deployment complete!"
echo ""
echo "API Gateway URL will be displayed above ☝️"
echo "Copy this URL and update your Amplify environment variables:"
echo "  - VITE_API_URL=<YOUR_API_GATEWAY_URL>"
echo ""
echo "Next steps:"
echo "  1. Store API keys in AWS Secrets Manager:"
echo "     - setly/$STAGE/google-maps-api-key"
echo "     - setly/$STAGE/ticketmaster-api-key"
echo "     - setly/$STAGE/eventbrite-api-key"
echo "  2. Store CloudFront domain in SSM Parameter Store:"
echo "     - /setly/$STAGE/cloudfront-domain"
echo "  3. Update MongoDB URI in SSM:"
echo "     - /setly/$STAGE/mongodb-uri"
