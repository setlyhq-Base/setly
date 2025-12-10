#!/bin/bash

# Quick Infrastructure Management Script
# Helps manage AWS resources for Setly

set -e

function show_help() {
    echo "Setly Infrastructure Management"
    echo ""
    echo "Usage: ./infra.sh [command] [stage]"
    echo ""
    echo "Commands:"
    echo "  deploy <stage>    - Deploy backend to AWS"
    echo "  secrets <stage>   - Set up secrets in AWS Secrets Manager"
    echo "  logs <stage>      - Tail CloudWatch logs"
    echo "  info <stage>      - Show deployed stack info"
    echo "  remove <stage>    - Remove stack from AWS"
    echo "  test <stage>      - Test API endpoints"
    echo ""
    echo "Stages: dev | stage | prod"
    echo ""
    echo "Examples:"
    echo "  ./infra.sh deploy dev"
    echo "  ./infra.sh logs prod"
    echo "  ./infra.sh test stage"
}

function deploy() {
    STAGE=$1
    echo "🚀 Deploying to $STAGE..."
    ./deploy.sh $STAGE
}

function setup_secrets() {
    STAGE=$1
    echo "🔐 Setting up secrets for $STAGE..."
    ./setup-secrets.sh $STAGE
}

function tail_logs() {
    STAGE=$1
    echo "📋 Tailing logs for $STAGE..."
    npx serverless logs -f api --stage $STAGE --tail
}

function show_info() {
    STAGE=$1
    echo "ℹ️  Stack info for $STAGE..."
    npx serverless info --stage $STAGE
}

function remove_stack() {
    STAGE=$1
    echo "⚠️  WARNING: This will delete all resources for $STAGE"
    read -p "Are you sure? (yes/no): " CONFIRM
    if [ "$CONFIRM" = "yes" ]; then
        echo "🗑️  Removing stack..."
        npx serverless remove --stage $STAGE
    else
        echo "❌ Cancelled"
    fi
}

function test_api() {
    STAGE=$1
    echo "🧪 Testing API for $STAGE..."
    
    # Get API endpoint
    API_URL=$(npx serverless info --stage $STAGE | grep "endpoint:" | awk '{print $2}')
    
    if [ -z "$API_URL" ]; then
        echo "❌ Could not find API endpoint"
        exit 1
    fi
    
    echo "API URL: $API_URL"
    echo ""
    
    # Test health endpoint
    echo "Testing /api/health..."
    curl -s "$API_URL/api/health" | jq '.'
    echo ""
    
    echo "✅ API is responding"
}

# Main script logic
COMMAND=$1
STAGE=$2

if [ -z "$COMMAND" ]; then
    show_help
    exit 0
fi

case $COMMAND in
    deploy)
        deploy $STAGE
        ;;
    secrets)
        setup_secrets $STAGE
        ;;
    logs)
        tail_logs $STAGE
        ;;
    info)
        show_info $STAGE
        ;;
    remove)
        remove_stack $STAGE
        ;;
    test)
        test_api $STAGE
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac
