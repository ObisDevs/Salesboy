# Deploy Salesboy Core to Vercel via GitHub

## Step-by-Step Guide

### 1. Prepare for GitHub Push
```bash
# Make sure you're in the Salesboy root directory
cd /workspaces/Salesboy

# Check git status
git status

# Add all files
git add .

# Commit changes
git commit -m "Milestone 3: Complete core backend implementation"

# Push to GitHub
git push origin main
```

### 2. Deploy on Vercel

1. **Go to Vercel:** https://vercel.com/new

2. **Import Repository:**
   - Click "Import Git Repository"
   - Select your Salesboy repository
   - Click "Import"

3. **Configure Project:**
   - **Root Directory:** `salesboy-core`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   SUPABASE_URL=https://hlkyicsgsjruneetymin.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   PINECONE_API_KEY=pcsk_5b4Nr8_JhmoGpws3bUK1kiHTgyrK8yEZnebMcb89gpCR9cN1ERPf3JLVVXe6CWYQDeDy8A
   PINECONE_INDEX_NAME=salesboy-vectors
   GEMINI_API_KEY=AIzaSyAvlFlBPkUl0eMSp6BeGKJLUH72WLXlLjM
   OPENAI_API_KEY=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
   API_SECRET_KEY=0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f
   HMAC_SECRET=13304926a75f01750cd1d170245ef8fd699108c2c4d151d5250b84c996f6aa6e
   GATEWAY_URL=http://srv892192.hstgr.cloud:3001
   N8N_WEBHOOK_URL=https://n8n.srv892192.hstgr.cloud/
   ```

5. **Click "Deploy"**

6. **Wait for deployment** (2-3 minutes)

7. **Copy your Vercel URL** (e.g., `https://salesboy-xyz.vercel.app`)

### 3. Update Gateway on VPS

```bash
# SSH into your VPS
ssh root@srv892192.hstgr.cloud

# Navigate to gateway directory
cd /root/salesboy-gateway

# Edit .env file
nano .env

# Update this line:
NEXT_WEBHOOK_URL=https://your-salesboy-app.vercel.app/api/webhook/whatsapp

# Save and exit (Ctrl+X, Y, Enter)

# Restart gateway
pm2 restart salesboy-gateway

# Check logs
pm2 logs salesboy-gateway
```

### 4. Test the Integration

```bash
# Test webhook endpoint
curl https://your-salesboy-app.vercel.app/api/sessions/status?user_id=test

# Should return error about user not found (expected)
```

### 5. Verify Everything Works

1. Gateway can reach core backend
2. Core backend can reach Supabase
3. Core backend can reach Pinecone
4. End-to-end message flow works

## Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript configuration

### Environment Variables Not Working
- Double-check all variables are set in Vercel
- Redeploy after adding variables
- Check Vercel logs for missing env errors

### Gateway Can't Reach Core
- Verify NEXT_WEBHOOK_URL is correct
- Check Vercel deployment URL
- Ensure no typos in webhook path

## Next Steps After Deployment

1. ✅ Core backend deployed on Vercel
2. ✅ Gateway updated with webhook URL
3. ⏳ Test end-to-end message flow
4. ⏳ Start Milestone 4 (Dashboard UI)

## Quick Commands Reference

```bash
# Push to GitHub
git add . && git commit -m "Update" && git push

# SSH to VPS
ssh root@srv892192.hstgr.cloud

# Restart gateway
pm2 restart salesboy-gateway

# View gateway logs
pm2 logs salesboy-gateway

# Test core backend
curl https://your-app.vercel.app/api/sessions/status?user_id=test
```