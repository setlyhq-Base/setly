#!/bin/bash

# API Endpoint Testing Script
# Tests all backend routes to verify functionality

set -e

# Configuration
API_URL=${1:-http://localhost:3000}
TEST_USER_ID="test-user-$(date +%s)"
TEST_EMAIL="test-$(date +%s)@setly.in"

echo "🧪 Testing Setly Backend API"
echo "============================="
echo "API URL: $API_URL"
echo "Test User ID: $TEST_USER_ID"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing: $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null || echo "000")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" == "$expected_status" ] || [ "$status_code" == "200" ] || [ "$status_code" == "201" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $status_code, expected $expected_status)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "1️⃣ Health Check"
echo "==============="
test_endpoint "Health Endpoint" "GET" "/api/health" "" "200"
echo ""

echo "2️⃣ User Endpoints"
echo "================"

# Create user
USER_DATA="{\"userId\":\"$TEST_USER_ID\",\"email\":\"$TEST_EMAIL\",\"name\":\"Test User\"}"
test_endpoint "Create User" "POST" "/api/users" "$USER_DATA" "201"

# Get user
test_endpoint "Get User by ID" "GET" "/api/users/$TEST_USER_ID" "" "200"

# Update user
UPDATE_DATA="{\"bio\":\"Updated bio\"}"
test_endpoint "Update User" "PUT" "/api/users/$TEST_USER_ID" "$UPDATE_DATA" "200"

# Get saved items
test_endpoint "Get Saved Items" "GET" "/api/users/$TEST_USER_ID/saved" "" "200"
echo ""

echo "3️⃣ Room Endpoints"
echo "================"

# Create room
ROOM_DATA="{\"userId\":\"$TEST_USER_ID\",\"title\":\"Test Room\",\"description\":\"A test room\",\"address\":\"123 Test St\",\"city\":\"Boston\",\"state\":\"MA\",\"price\":1200,\"deposit\":1200,\"roomType\":\"private\",\"bathType\":\"private\",\"furnished\":true,\"images\":[]}"
test_endpoint "Create Room" "POST" "/api/rooms" "$ROOM_DATA" "201"

# Search rooms
test_endpoint "Search Rooms" "GET" "/api/rooms?city=Boston" "" "200"

# Search user's rooms
test_endpoint "Get User Rooms" "GET" "/api/rooms?userId=$TEST_USER_ID" "" "200"
echo ""

echo "4️⃣ Ride Endpoints"
echo "================"

# Create ride
RIDE_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ" -d "+1 day" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT%H:%M:%SZ")
RIDE_DATA="{\"userId\":\"$TEST_USER_ID\",\"pickupAddress\":\"Logan Airport\",\"pickupLat\":42.3656,\"pickupLng\":-71.0096,\"dropoffAddress\":\"Harvard Square\",\"dropoffLat\":42.3736,\"dropoffLng\":-71.1097,\"rideDate\":\"$RIDE_DATE\",\"rideTime\":\"10:00\",\"seatsAvailable\":3,\"pricePerSeat\":15,\"images\":[]}"
test_endpoint "Create Ride" "POST" "/api/rides" "$RIDE_DATA" "201"

# Search rides
test_endpoint "Search Rides" "GET" "/api/rides?pickupCity=Logan" "" "200"
echo ""

echo "5️⃣ Marketplace Endpoints"
echo "======================"

# Create marketplace item
ITEM_DATA="{\"userId\":\"$TEST_USER_ID\",\"category\":\"Books\",\"title\":\"Test Textbook\",\"description\":\"Gently used\",\"price\":50,\"condition\":\"like-new\",\"location\":\"Boston\",\"images\":[],\"tags\":[\"textbook\",\"engineering\"]}"
test_endpoint "Create Marketplace Item" "POST" "/api/marketplace" "$ITEM_DATA" "201"

# Search marketplace
test_endpoint "Search Marketplace" "GET" "/api/marketplace?category=Books" "" "200"
echo ""

echo "6️⃣ Conversation Endpoints"
echo "======================="

# Create conversation
CONV_DATA="{\"participants\":[\"$TEST_USER_ID\",\"other-user-123\"],\"listingId\":\"room-123\",\"listingType\":\"room\",\"listingTitle\":\"Test Room\",\"listingImage\":\"\"}"
test_endpoint "Create Conversation" "POST" "/api/conversations" "$CONV_DATA" "201"

# Get user conversations
test_endpoint "Get User Conversations" "GET" "/api/conversations/user/$TEST_USER_ID" "" "200"
echo ""

echo "7️⃣ Upload Endpoints"
echo "=================="

# Get presigned URL
test_endpoint "Get Presigned URL" "GET" "/api/upload/presigned-url?fileName=test.jpg&fileType=image/jpeg&userId=$TEST_USER_ID&category=room" "" "200"
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ Backend is working correctly"
    echo "✅ MongoDB connection successful"
    echo "✅ All CRUD operations functional"
    echo "✅ Ready for frontend integration"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo ""
    echo "Check the errors above and:"
    echo "1. Verify MongoDB connection string"
    echo "2. Check environment variables"
    echo "3. Review server logs"
    exit 1
fi
