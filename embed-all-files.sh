#!/bin/bash

API_URL="https://salesboy-lilac.vercel.app"

echo "========================================="
echo "Embed All Knowledge Base Files"
echo "========================================="
echo ""

echo "Enter your file IDs (one per line, press Ctrl+D when done):"
echo "Example: 123e4567-e89b-12d3-a456-426614174000"
echo ""

# Read file IDs from user
FILE_IDS=()
while IFS= read -r line; do
    if [ ! -z "$line" ]; then
        FILE_IDS+=("$line")
    fi
done

if [ ${#FILE_IDS[@]} -eq 0 ]; then
    echo "No file IDs provided. Exiting."
    exit 1
fi

echo ""
echo "Processing ${#FILE_IDS[@]} file(s)..."
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

for FILE_ID in "${FILE_IDS[@]}"; do
    echo "----------------------------------------"
    echo "Processing file: $FILE_ID"
    echo "----------------------------------------"
    
    # Process
    echo "Step 1: Processing..."
    PROCESS_RESPONSE=$(curl -s -X POST "$API_URL/api/kb/process" \
      -H "Content-Type: application/json" \
      -d "{\"file_id\": \"$FILE_ID\"}")
    
    if echo "$PROCESS_RESPONSE" | grep -q "error"; then
        echo "⚠️  Process warning: $PROCESS_RESPONSE"
    else
        echo "✅ Processed"
    fi
    
    # Embed
    echo "Step 2: Embedding..."
    EMBED_RESPONSE=$(curl -s -X POST "$API_URL/api/kb/embed" \
      -H "Content-Type: application/json" \
      -d "{\"file_id\": \"$FILE_ID\"}")
    
    if echo "$EMBED_RESPONSE" | grep -q "error"; then
        echo "❌ Embed failed: $EMBED_RESPONSE"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    else
        echo "✅ Embedded: $EMBED_RESPONSE"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
    
    echo ""
done

echo "========================================="
echo "Summary"
echo "========================================="
echo "Total files: ${#FILE_IDS[@]}"
echo "Successful: $SUCCESS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""
echo "Check Pinecone dashboard for vectors:"
echo "https://app.pinecone.io/"
echo "========================================="
