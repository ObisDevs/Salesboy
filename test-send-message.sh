#!/bin/bash

echo "=== Testing WhatsApp Message Send ==="
echo ""

# Replace with your actual WhatsApp number (format: 2348012345678@c.us)
PHONE_NUMBER="YOUR_PHONE_NUMBER@c.us"

echo "Sending test message..."
curl -X POST http://srv892192.hstgr.cloud:3001/message/send \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"current-user\",
    \"to\": \"$PHONE_NUMBER\",
    \"message\": \"Test message from Salesboy AI Gateway\"
  }"

echo -e "\n\nDone! Check your WhatsApp for the message."
