# Salesboy AI - Deployment Strategy

## Current Architecture
- **Gateway:** VPS (srv892192.hstgr.cloud:3001) ✅ Running
- **Core Backend:** Needs deployment
- **Database:** Supabase ✅ Ready

## Deployment Options for Core Backend

### Option 1: Deploy to Vercel (Recommended)
```bash
cd salesboy-core
npm i -g vercel
vercel --prod
```

**Pros:**
- Automatic HTTPS
- Global CDN
- Easy environment variables
- Automatic deployments

**Update Gateway Config:**
```env
NEXT_WEBHOOK_URL=https://your-app.vercel.app/api/webhook/whatsapp
```

### Option 2: Deploy to Same VPS
```bash
# Copy core to VPS
scp -r salesboy-core/ root@srv892192.hstgr.cloud:/root/

# On VPS
cd /root/salesboy-core
npm install
npm run build
pm2 start npm --name "salesboy-core" -- start
```

**Update Gateway Config:**
```env
NEXT_WEBHOOK_URL=http://localhost:3000/api/webhook/whatsapp
```

## Testing Strategy

### 1. Local Development Testing
```bash
# Terminal 1: Start core locally
cd salesboy-core
npm run dev

# Terminal 2: Test with local webhook URL
# Temporarily update gateway to point to local core
```

### 2. Production Testing
```bash
# Deploy core backend
# Update gateway NEXT_WEBHOOK_URL
# Test end-to-end message flow
```

## Quick Deploy to Vercel

1. **Prepare for deployment:**
```bash
cd salesboy-core
npm run build  # Test build works
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set environment variables in Vercel dashboard:**
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- PINECONE_API_KEY
- GEMINI_API_KEY
- OPENAI_API_KEY
- API_SECRET_KEY
- HMAC_SECRET
- N8N_WEBHOOK_URL

4. **Update gateway on VPS:**
```bash
ssh root@srv892192.hstgr.cloud
cd /root/salesboy-gateway
# Edit .env file
NEXT_WEBHOOK_URL=https://your-vercel-app.vercel.app/api/webhook/whatsapp
pm2 restart salesboy-gateway
```

## Current Status
- Gateway is running and waiting for core backend
- Core backend is ready for deployment
- Need to deploy core and update gateway config