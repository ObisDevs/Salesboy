#!/bin/bash

echo "=== Testing WhatsApp Message Send ==="
echo ""

# Replace with your actual WhatsApp number (format: 2348012345678@c.us)
PHONE_NUMBER="YOUR_PHONE_NUMBER@c.us"

if [ -z "$USER_ID" ]; then
  echo "ERROR: set USER_ID environment variable before running this script"
  echo "Example: USER_ID=ba418a83-7f27-4300-849b-c69b7517e28f ./test-send-message.sh"
  exit 1
fi

echo "Sending test message..."
curl -X POST "$GATEWAY_URL/message/send" \
  -H "X-API-KEY: ${API_KEY:-0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f}" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"to\": \"$PHONE_NUMBER\",
    \"message\": \"Test message from Salesboy AI Gateway\"
  }"

echo -e "\n\nDone! Check your WhatsApp for the message."
