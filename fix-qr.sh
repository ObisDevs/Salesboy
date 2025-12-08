#!/bin/bash

echo "🔧 Fixing QR Code Issue..."

# Stop session
echo "1. Stopping current session..."
curl -X POST http://srv892192.hstgr.cloud:3001/session/stop
echo ""

# Wait
echo "2. Waiting 3 seconds..."
sleep 3

# Start session
echo "3. Starting fresh session..."
curl -X POST http://srv892192.hstgr.cloud:3001/session/start
echo ""

# Wait for QR generation
echo "4. Waiting for QR generation..."
sleep 2

# Get status
echo "5. Getting QR code..."
response=$(curl -s http://srv892192.hstgr.cloud:3001/session/status)
echo "$response" | jq .

# Check if QR exists
if echo "$response" | jq -e '.qr' > /dev/null; then
    echo "✅ QR Code retrieved successfully!"
else
    echo "❌ QR Code still null - checking logs..."
    echo "Try running: pm2 logs salesboy-gateway --lines 20"
fi