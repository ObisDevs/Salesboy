#!/bin/bash

API_URL="https://salesboy-lilac.vercel.app"

echo "=== Testing Embed Route Directly ==="
echo ""

# Get your file IDs from Supabase
echo "First, get your file IDs from Supabase knowledge_base table"
echo "Then run this script with the file_id"
echo ""

# Check if file_id provided
if [ -z "$1" ]; then
    echo "Usage: ./test-embed-direct.sh <file_id>"
    echo ""
    echo "Example: ./test-embed-direct.sh 123e4567-e89b-12d3-a456-426614174000"
    exit 1
fi

FILE_ID=$1

echo "Testing embed for file_id: $FILE_ID"
echo ""

# First, check if file needs processing
echo "Step 1: Processing file (if not already processed)..."
PROCESS_RESPONSE=$(curl -s -X POST "$API_URL/api/kb/process" \
  -H "Content-Type: application/json" \
  -d "{\"file_id\": \"$FILE_ID\"}")

echo "Process response: $PROCESS_RESPONSE"
echo ""

# Now embed
echo "Step 2: Generating embeddings..."
EMBED_RESPONSE=$(curl -s -X POST "$API_URL/api/kb/embed" \
  -H "Content-Type: application/json" \
  -d "{\"file_id\": \"$FILE_ID\"}")

echo "Embed response: $EMBED_RESPONSE"
echo ""

# Check for errors
if echo "$EMBED_RESPONSE" | grep -q "error"; then
    echo "❌ Embed failed! Check the error above."
    echo ""
    echo "Common issues:"
    echo "1. File not found - check file_id"
    echo "2. File not processed - run process first"
    echo "3. Gemini/OpenAI API error - check API keys"
    echo "4. Pinecone error - check Pinecone API key"
else
    echo "✅ Embed successful!"
    echo ""
    echo "Check Pinecone dashboard for vectors"
fi
