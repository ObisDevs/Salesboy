# 🚀 Quick Deployment Guide

**Status**: ✅ Code pushed to GitHub  
**Next**: Deploy to VPS

---

## ONE COMMAND DEPLOYMENT

```bash
bash deploy-vps.sh
```

That's it! This will:
1. ✅ Cleanup old test sessions
2. ✅ Pull latest code
3. ✅ Restart gateway
4. ✅ Show status

---

## WHAT TO EXPECT

### VPS (Gateway)
- Old test sessions removed
- Gateway restarted with new code
- Logs show "Skipping invalid session"
- CPU usage normal

### Vercel (Core)
- Auto-deploying from GitHub
- Build takes 2-3 minutes
- Check: https://vercel.com/dashboard

---

## VERIFY DEPLOYMENT

```bash
# Gateway health
curl http://srv892192.hstgr.cloud:3001/health

# Core health
curl https://salesboy-lilac.vercel.app/
```

---

## TEST THE FIXES

### 1. Signup (No Placeholder)
- Go to https://salesboy-lilac.vercel.app/signup
- Create account
- Check Supabase whitelists → Should be empty ✅

### 2. KB Embed (Now Works)
- Upload file
- Click "Embed"
- Check Pinecone → Should see vectors ✅

### 3. Gateway (No Slowdown)
- SSH to VPS
- Check CPU with `top`
- Should be < 20% ✅

---

## ROLLBACK (If Needed)

```bash
# Gateway
ssh root@srv892192.hstgr.cloud "cd /root/salesboy-gateway && git reset --hard HEAD~1 && pm2 restart salesboy-gateway"

# Core
git revert HEAD && git push origin main
```

---

## 📊 FIXES DEPLOYED

1. ✅ Gateway: UUID validation (prevents test user sessions)
2. ✅ Core: KB embed route (file embedding now works)
3. ✅ Core: No placeholder whitelist (clean signup)
4. ✅ Core: Correct env vars (Mistral/Groq)
5. ✅ Core: Duplicate middleware removed

---

**Ready?** Run: `bash deploy-vps.sh`
