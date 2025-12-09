#!/bin/bash

echo "=== Testing Gateway QR Code ==="
echo ""

if [ -z "$USER_ID" ]; then
  echo "ERROR: set USER_ID environment variable before running this script"
  echo "Example: USER_ID=ba418a83-7f27-4300-849b-c69b7517e28f ./test-qr.sh"
  exit 1
fi

# First, stop any existing session
echo "1. Stopping existing session..."
curl -X POST "$GATEWAY_URL/session/stop" \
  -H "X-API-KEY: ${API_KEY:-0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f}" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}"

echo -e "\n\n2. Waiting 3 seconds..."
sleep 3

# Start new session
echo "3. Starting new session..."
curl -X POST "$GATEWAY_URL/session/start" \
  -H "X-API-KEY: ${API_KEY:-0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f}" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}"

echo -e "\n\n4. Waiting 5 seconds for QR generation..."
sleep 5

# Check status
echo "5. Checking session status..."
curl -X GET "$GATEWAY_URL/session/status/$USER_ID" \
  -H "X-API-KEY: ${API_KEY:-0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f}"

echo -e "\n\nDone! Check the output above for QR code data."
