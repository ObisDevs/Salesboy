#!/bin/bash

# Cleanup Gateway Test Sessions
# Run this on VPS to remove old test user sessions

echo "🧹 Cleaning up old test sessions..."

cd /root/salesboy-gateway/.wwebjs_auth || exit 1

echo "📋 Current sessions:"
ls -la

echo ""
echo "🗑️ Removing test sessions..."
rm -rf session-current-user session-test-user* 2>/dev/null

echo ""
echo "✅ Cleanup complete. Remaining sessions:"
ls -la

echo ""
echo "🔄 Restarting gateway..."
pm2 restart salesboy-gateway

echo ""
echo "📊 Gateway status:"
pm2 status salesboy-gateway

echo ""
echo "📝 Recent logs:"
pm2 logs salesboy-gateway --lines 20 --nostream
