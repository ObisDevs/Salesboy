#!/bin/bash

echo "========================================="
echo "Salesboy AI - System Status Check"
echo "========================================="
echo ""

# 1. Check Gateway
echo "1. Gateway Status (VPS):"
GATEWAY_HEALTH=$(curl -s http://srv892192.hstgr.cloud:3001/health)
if [ $? -eq 0 ]; then
    echo "   ✅ Gateway is running"
    echo "   Response: $GATEWAY_HEALTH"
else
    echo "   ❌ Gateway is not responding"
fi
echo ""

# 2. Check Core Backend
echo "2. Core Backend Status (Vercel):"
CORE_STATUS=$(curl -s https://salesboy-lilac.vercel.app/)
if [ $? -eq 0 ]; then
    echo "   ✅ Core backend is running"
else
    echo "   ❌ Core backend is not responding"
fi
echo ""

# 3. Check Gateway Session
echo "3. WhatsApp Session Status:"
SESSION_STATUS=$(curl -s -X GET http://srv892192.hstgr.cloud:3001/session/status/current-user \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f")
echo "   $SESSION_STATUS"
echo ""

# 4. Check Pinecone (via test query)
echo "4. Pinecone Status:"
echo "   Index: salesboy-vectors"
echo "   Check manually at: https://app.pinecone.io/"
echo ""

# 5. Check Supabase
echo "5. Supabase Status:"
echo "   URL: https://hlkyicsgsjruneetymin.supabase.co"
echo "   Check manually at: https://supabase.com/dashboard"
echo ""

# 6. Summary
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "To populate Pinecone with test data:"
echo "  bash test-kb-simple.sh"
echo ""
echo "To get WhatsApp QR code:"
echo "  bash reset-and-get-qr.sh"
echo ""
echo "To test message sending:"
echo "  1. Ensure session is ready (ready: true)"
echo "  2. Send test message via gateway"
echo ""
