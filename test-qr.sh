#!/bin/bash

echo "=== Testing Gateway QR Code ==="
echo ""

# First, stop any existing session
echo "1. Stopping existing session..."
curl -X POST http://srv892192.hstgr.cloud:3001/session/stop \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d '{"userId": "current-user"}'

echo -e "\n\n2. Waiting 3 seconds..."
sleep 3

# Start new session
echo "3. Starting new session..."
curl -X POST http://srv892192.hstgr.cloud:3001/session/start \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d '{"userId": "current-user"}'

echo -e "\n\n4. Waiting 5 seconds for QR generation..."
sleep 5

# Check status
echo "5. Checking session status..."
curl -X GET http://srv892192.hstgr.cloud:3001/session/status/current-user \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"

echo -e "\n\nDone! Check the output above for QR code data."
