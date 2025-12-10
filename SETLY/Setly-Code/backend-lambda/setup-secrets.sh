#!/bin/bash

# Store API Keys in AWS Secrets Manager
# Run this script once to set up secrets for each environment

STAGE=${1:-dev}

echo "🔐 Setting up AWS Secrets for stage: $STAGE"

# Google Maps API Key
read -p "Enter Google Maps API Key: " GOOGLE_MAPS_KEY
aws secretsmanager create-secret \
    --name "setly/$STAGE/google-maps-api-key" \
    --description "Google Maps API key for Setly $STAGE" \
    --secret-string "{\"apiKey\":\"$GOOGLE_MAPS_KEY\"}" \
    --region us-east-1

# Ticketmaster API Key
read -p "Enter Ticketmaster API Key: " TICKETMASTER_KEY
aws secretsmanager create-secret \
    --name "setly/$STAGE/ticketmaster-api-key" \
    --description "Ticketmaster API key for Setly $STAGE" \
    --secret-string "{\"apiKey\":\"$TICKETMASTER_KEY\"}" \
    --region us-east-1

# Eventbrite API Key
read -p "Enter Eventbrite API Key: " EVENTBRITE_KEY
aws secretsmanager create-secret \
    --name "setly/$STAGE/eventbrite-api-key" \
    --description "Eventbrite API key for Setly $STAGE" \
    --secret-string "{\"apiKey\":\"$EVENTBRITE_KEY\"}" \
    --region us-east-1

echo "✅ Secrets created successfully!"
echo ""
echo "Note: After CloudFront distribution is created, store the domain:"
echo "aws ssm put-parameter --name '/setly/$STAGE/cloudfront-domain' --value 'd1234567890.cloudfront.net' --type String"
