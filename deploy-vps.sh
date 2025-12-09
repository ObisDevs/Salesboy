#!/bin/bash

# Deploy to VPS - Run this after GitHub push
# Usage: bash deploy-vps.sh

echo "🚀 Deploying Salesboy Gateway to VPS..."
echo ""

# Step 1: Cleanup old test sessions
echo "🧹 Step 1: Cleaning up old test sessions..."
ssh root@srv892192.hstgr.cloud << 'EOF'
cd /root/salesboy-gateway/.wwebjs_auth 2>/dev/null || exit 0
echo "Current sessions:"
ls -la 2>/dev/null || echo "No sessions directory"
echo ""
echo "Removing test sessions..."
rm -rf session-current-user session-test-user* 2>/dev/null
echo "✅ Cleanup complete"
echo ""
EOF

# Step 2: Pull latest code
echo "📥 Step 2: Pulling latest code from GitHub..."
ssh root@srv892192.hstgr.cloud << 'EOF'
cd /root/salesboy-gateway
git pull
echo "✅ Code updated"
echo ""
EOF

# Step 3: Restart gateway
echo "🔄 Step 3: Restarting gateway..."
ssh root@srv892192.hstgr.cloud << 'EOF'
pm2 restart salesboy-gateway
echo "✅ Gateway restarted"
echo ""
EOF

# Step 4: Check status
echo "📊 Step 4: Checking status..."
ssh root@srv892192.hstgr.cloud << 'EOF'
pm2 status salesboy-gateway
echo ""
echo "Recent logs:"
pm2 logs salesboy-gateway --lines 20 --nostream
EOF

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Check Vercel dashboard for core deployment"
echo "2. Test signup at https://salesboy-lilac.vercel.app/signup"
echo "3. Test KB upload and embed"
echo "4. Test WhatsApp session"
