# Deployment Checklist

## Pre-Deployment ✅
- [x] Core backend implemented
- [x] All libraries created
- [x] API routes functional
- [x] Environment variables configured
- [x] .gitignore files created
- [x] Gateway running on VPS

## GitHub Push
- [ ] Review changes: `git status`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Milestone 3: Core backend complete"`
- [ ] Push: `git push origin main`

## Vercel Deployment
- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository
- [ ] Set root directory: `salesboy-core`
- [ ] Add all environment variables (see GITHUB-DEPLOY-GUIDE.md)
- [ ] Click Deploy
- [ ] Wait for deployment to complete
- [ ] Copy Vercel URL

## Gateway Configuration
- [ ] SSH to VPS: `ssh root@srv892192.hstgr.cloud`
- [ ] Edit gateway .env: `nano /root/salesboy-gateway/.env`
- [ ] Update NEXT_WEBHOOK_URL with Vercel URL
- [ ] Restart gateway: `pm2 restart salesboy-gateway`
- [ ] Check logs: `pm2 logs salesboy-gateway`

## Testing
- [ ] Test core endpoint: `curl https://your-app.vercel.app/api/sessions/status?user_id=test`
- [ ] Test gateway health: `curl -H "X-API-KEY: YOUR_KEY" http://srv892192.hstgr.cloud:3001/health`
- [ ] Verify gateway can reach core backend
- [ ] Test end-to-end message flow

## Post-Deployment
- [ ] Monitor Vercel logs for errors
- [ ] Monitor gateway logs: `pm2 logs`
- [ ] Test with real WhatsApp message
- [ ] Verify database connections
- [ ] Check Pinecone integration

## Next Milestone
- [ ] Start Milestone 4: Dashboard UI
- [ ] Implement user authentication
- [ ] Build session management UI
- [ ] Create knowledge base manager

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Gateway Logs:** `pm2 logs salesboy-gateway`
**Restart Gateway:** `pm2 restart salesboy-gateway`
**Test Endpoint:** `curl https://your-app.vercel.app/api/sessions/status?user_id=test`