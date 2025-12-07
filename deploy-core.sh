#!/bin/bash

# Salesboy Core Deployment Script

echo "🚀 Deploying Salesboy Core Backend..."

# Check if we're in the right directory
if [ ! -f "salesboy-core/package.json" ]; then
    echo "❌ Please run this script from the Salesboy root directory"
    exit 1
fi

cd salesboy-core

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"

echo ""
echo "🎯 Deployment Options:"
echo ""
echo "1. Deploy to Vercel (Recommended):"
echo "   npm i -g vercel"
echo "   vercel --prod"
echo ""
echo "2. Deploy to VPS:"
echo "   scp -r . root@srv892192.hstgr.cloud:/root/salesboy-core/"
echo "   ssh root@srv892192.hstgr.cloud 'cd /root/salesboy-core && npm install && npm run build && pm2 start npm --name salesboy-core -- start'"
echo ""
echo "3. Run locally for testing:"
echo "   npm run dev"
echo ""

echo "📝 Don't forget to:"
echo "- Set environment variables in deployment platform"
echo "- Update NEXT_WEBHOOK_URL in gateway .env"
echo "- Implement Milestone 2 (Database Schema) before full testing"
echo ""

echo "🔗 Useful commands:"
echo "- Test integration: node test-integration.js"
echo "- Test gateway: curl https://srv892192.hstgr.cloud:3001/health"
echo "- View logs: pm2 logs (if using PM2)"