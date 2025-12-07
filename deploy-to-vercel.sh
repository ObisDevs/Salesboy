#!/bin/bash

echo "🚀 Deploying Salesboy Core to Vercel..."

cd salesboy-core

# Test build first
echo "📦 Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "📝 Next Steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY" 
echo "   - PINECONE_API_KEY"
echo "   - PINECONE_INDEX_NAME"
echo "   - GEMINI_API_KEY"
echo "   - OPENAI_API_KEY"
echo "   - API_SECRET_KEY"
echo "   - HMAC_SECRET"
echo "   - GATEWAY_URL"
echo "   - N8N_WEBHOOK_URL"
echo ""
echo "2. Update gateway NEXT_WEBHOOK_URL to your Vercel URL"
echo "3. Test the integration"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"