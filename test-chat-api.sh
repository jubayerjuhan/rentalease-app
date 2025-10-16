#!/bin/bash

# Simple API test for chat endpoints
echo "Testing Chat API Endpoints"
echo "=========================="
echo ""

API_BASE="http://localhost:3000/api/v1"

# Test 1: Check if chat routes are accessible
echo "1. Testing chat routes availability..."
curl -s -o /dev/null -w "GET /chat/sessions: %{http_code}\n" "$API_BASE/chat/sessions"

# Test 2: Try to initiate chat without auth (should fail with 401)
echo ""
echo "2. Testing chat initiation (no auth - should fail)..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_BASE/chat/initiate" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Chat",
    "initialMessage": "Hello",
    "priority": "medium"
  }')

echo "$RESPONSE" | head -n -1
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1 | cut -d: -f2)
echo "Status Code: $HTTP_CODE"

# Test 3: Check WebSocket endpoint
echo ""
echo "3. Checking WebSocket server..."
WS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/ws")
echo "WebSocket endpoint check: $WS_CHECK"

echo ""
echo "=========================="
echo "Basic API tests complete"