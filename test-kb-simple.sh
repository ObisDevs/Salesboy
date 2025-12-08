#!/bin/bash

API_URL="https://salesboy-lilac.vercel.app"
USER_ID="test-user-123"

echo "=== Testing Knowledge Base Pipeline ==="
echo ""

# Create test file
echo "Step 1: Creating test document..."
cat > test-doc.txt << 'EOF'
# Salesboy AI - Product Information

## About Our Service
Salesboy AI is a WhatsApp-based business automation platform for Nigerian small businesses.

## Pricing
- Basic Plan: ₦5,000/month - Up to 100 messages
- Pro Plan: ₦15,000/month - Up to 1,000 messages  
- Enterprise: Custom pricing

## Features
- Automated customer responses
- AI-powered chat assistant
- Knowledge base integration
- Task automation

## Contact
Email: support@salesboy.ai
Phone: +234 800 123 4567

## Business Hours
Monday - Friday: 9:00 AM - 6:00 PM WAT
Saturday: 10:00 AM - 4:00 PM WAT
Sunday: Closed
EOF

echo "✅ Test document created"
echo ""

# Upload
echo "Step 2: Uploading document..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/kb/upload" \
  -F "file=@test-doc.txt" \
  -F "user_id=$USER_ID")

echo "Upload response: $UPLOAD_RESPONSE"
FILE_ID=$(echo $UPLOAD_RESPONSE | grep -o '"file_id":"[^"]*' | cut -d'"' -f4)
echo "File ID: $FILE_ID"
echo ""

if [ -z "$FILE_ID" ]; then
    echo "❌ Upload failed!"
    rm test-doc.txt
    exit 1
fi

# Process
echo "Step 3: Processing document..."
PROCESS_RESPONSE=$(curl -s -X POST "$API_URL/api/kb/process" \
  -H "Content-Type: application/json" \
  -d "{\"file_id\": \"$FILE_ID\"}")

echo "Process response: $PROCESS_RESPONSE"
echo ""

# Embed
echo "Step 4: Generating embeddings..."
EMBED_RESPONSE=$(curl -s -X POST "$API_URL/api/kb/embed" \
  -H "Content-Type: application/json" \
  -d "{\"file_id\": \"$FILE_ID\"}")

echo "Embed response: $EMBED_RESPONSE"
echo ""

# Cleanup
rm test-doc.txt

echo "========================================="
echo "✅ Done! Check Pinecone dashboard:"
echo "   Namespace: user_$USER_ID"
echo "========================================="
