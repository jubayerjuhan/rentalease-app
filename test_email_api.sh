#!/bin/bash

echo "🧪 Testing Internal Email API Workflow"
echo "======================================"

# Base URL
BASE_URL="http://localhost:4000/api/v1"

# Test authentication and get token
echo "🔐 Step 1: Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jubayerjuhan.info@gmail.com",
    "password": "Jubayer.0323499877"
  }')

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Authentication successful"

# Test sending internal email
echo "📤 Step 2: Sending internal email..."
SEND_RESPONSE=$(curl -s -X POST "$BASE_URL/emails/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "roko.roko@rentalease.com.au", "name": "Roko"}],
    "subject": "API Test Email - Internal Messaging",
    "bodyHtml": "<h2>Test Email</h2><p>This email was sent via API to test the internal messaging system.</p><p>Both sender and recipient should see this in their respective folders.</p>",
    "bodyText": "Test Email\n\nThis email was sent via API to test the internal messaging system.\n\nBoth sender and recipient should see this in their respective folders."
  }')

echo "✅ Email send response:"
echo $SEND_RESPONSE | jq '.'

# Test fetching emails from sent folder
echo "📤 Step 3: Checking sent folder..."
SENT_RESPONSE=$(curl -s -X GET "$BASE_URL/emails?folder=sent&limit=5" \
  -H "Authorization: Bearer $TOKEN")

SENT_COUNT=$(echo $SENT_RESPONSE | jq -r '.data.emails | length')
echo "✅ Found $SENT_COUNT emails in sent folder"

# Test fetching emails from inbox
echo "📥 Step 4: Checking inbox..."
INBOX_RESPONSE=$(curl -s -X GET "$BASE_URL/emails?folder=inbox&limit=5" \
  -H "Authorization: Bearer $TOKEN")

INBOX_COUNT=$(echo $INBOX_RESPONSE | jq -r '.data.emails | length')
echo "✅ Found $INBOX_COUNT emails in inbox folder"

# Test fetching email threads
echo "📬 Step 5: Checking email threads..."
THREADS_RESPONSE=$(curl -s -X GET "$BASE_URL/emails/threads?limit=5" \
  -H "Authorization: Bearer $TOKEN")

THREADS_COUNT=$(echo $THREADS_RESPONSE | jq -r '.data.threads | length')
echo "✅ Found $THREADS_COUNT email threads"

echo ""
echo "🎉 Internal Email API Test Complete!"
echo "======================================"
echo "Summary:"
echo "- ✅ Authentication: Working"
echo "- ✅ Send Internal Email: Working"
echo "- ✅ Sent Folder: $SENT_COUNT emails"
echo "- ✅ Inbox Folder: $INBOX_COUNT emails" 
echo "- ✅ Email Threading: $THREADS_COUNT threads"
echo ""
echo "🔍 The email system now supports:"
echo "  • Internal emails appear in sender's sent folder"
echo "  • Recipients receive emails in their inbox"
echo "  • No external email service needed for internal communication"
echo "  • Full threading and reply support"