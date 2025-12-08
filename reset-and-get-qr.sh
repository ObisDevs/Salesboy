#!/bin/bash

API_KEY="0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"
GATEWAY_URL="http://srv892192.hstgr.cloud:3001"
USER_ID="current-user"

echo "========================================="
echo "Salesboy Gateway - QR Code Reset Script"
echo "========================================="
echo ""

# Step 1: Check current status
echo "Step 1: Checking current session status..."
STATUS=$(curl -s -X GET "$GATEWAY_URL/session/status/$USER_ID" \
  -H "X-API-KEY: $API_KEY")
echo "Current status: $STATUS"
echo ""

# Step 2: Stop existing session
echo "Step 2: Stopping existing session..."
STOP_RESULT=$(curl -s -X POST "$GATEWAY_URL/session/stop" \
  -H "X-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}")
echo "Stop result: $STOP_RESULT"
echo ""

# Step 3: Wait for cleanup
echo "Step 3: Waiting 3 seconds for cleanup..."
sleep 3

# Step 4: Start new session
echo "Step 4: Starting new session..."
START_RESULT=$(curl -s -X POST "$GATEWAY_URL/session/start" \
  -H "X-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}")
echo "Start result: $START_RESULT"
echo ""

# Step 5: Wait for QR generation
echo "Step 5: Waiting 8 seconds for QR code generation..."
sleep 8

# Step 6: Get QR code
echo "Step 6: Fetching QR code..."
QR_STATUS=$(curl -s -X GET "$GATEWAY_URL/session/status/$USER_ID" \
  -H "X-API-KEY: $API_KEY")

echo ""
echo "========================================="
echo "RESULT:"
echo "========================================="
echo "$QR_STATUS" | python3 -m json.tool 2>/dev/null || echo "$QR_STATUS"
echo ""

# Check if QR is present
if echo "$QR_STATUS" | grep -q '"qr":null'; then
    echo "⚠️  QR code is still null. Possible reasons:"
    echo "   1. Session might already be authenticated"
    echo "   2. QR generation is taking longer than expected"
    echo "   3. Check PM2 logs: pm2 logs salesboy-gateway"
    echo ""
    echo "Try accessing the SSE endpoint directly:"
    echo "curl -N $GATEWAY_URL/session/qr/$USER_ID -H \"X-API-KEY: $API_KEY\""
elif echo "$QR_STATUS" | grep -q '"qr":"data:image'; then
    echo "✅ QR code generated successfully!"
    echo ""
    echo "Copy the QR data URL from above and:"
    echo "1. Paste it in your browser address bar, OR"
    echo "2. Use an online QR decoder, OR"
    echo "3. Access your Vercel dashboard sessions page"
else
    echo "❓ Unexpected response. Check the output above."
fi

echo ""
echo "========================================="
