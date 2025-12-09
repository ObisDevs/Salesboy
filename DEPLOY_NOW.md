# Deploy Now - Quick Guide

**All code fixes are complete. Follow these steps to deploy.**

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Cleanup VPS (5 minutes)

```bash
# Copy cleanup script to VPS
scp cleanup-gateway-sessions.sh root@srv892192.hstgr.cloud:/root/

# Run cleanup
ssh root@srv892192.hstgr.cloud "bash /root/cleanup-gateway-sessions.sh"
```

**Expected Output**:
- Lists current sessions
- Removes test sessions
- Restarts gateway
- Shows clean logs

---

### Step 2: Deploy Gateway (5 minutes)

```bash
# Commit gateway changes
cd salesboy-gateway
git add .
git commit -m "Fix: Add UUID validation to prevent test user session restore"
git push

# Deploy to VPS
ssh root@srv892192.hstgr.cloud "cd /root/salesboy-gateway && git pull && pm2 restart salesboy-gateway"

# Verify
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 30"
```

**Look for**: "Skipping invalid session" messages (good!)

---

### Step 3: Deploy Core (10 minutes)

```bash
# Commit core changes
cd salesboy-core
git add .
git commit -m "Fix: KB embed route, remove placeholder whitelist, update env vars"
git push
```

**Vercel will auto-deploy**. Monitor at: https://vercel.com/dashboard

**Wait for**: Build to complete (usually 2-3 minutes)

---

### Step 4: Verify (5 minutes)

```bash
# Check gateway health
curl http://srv892192.hstgr.cloud:3001/health

# Check core health  
curl https://salesboy-lilac.vercel.app/

# Check VPS CPU
ssh root@srv892192.hstgr.cloud "top -bn1 | head -20"
```

**Expected**:
- Gateway returns `{"status":"ok"}`
- Core loads without errors
- VPS CPU < 20%

---

## ✅ QUICK TEST

### Test 1: Signup (2 minutes)

1. Go to https://salesboy-lilac.vercel.app/signup
2. Create account: `test@example.com` / `password123`
3. Login
4. Dashboard should load

**Check Supabase**:
- profiles table: ✅ New user exists
- bot_config table: ✅ Config created
- whitelists table: ✅ Empty (no placeholder)

---

### Test 2: KB Embed (3 minutes)

1. Go to Knowledge Base page
2. Upload a text file
3. Click "Embed"
4. Watch logs

**Check Pinecone**:
- Dashboard → Indexes → salesboy-vectors
- Namespace: `user_{userId}`
- Vectors: Should see new vectors

---

### Test 3: WhatsApp (5 minutes)

1. Go to Sessions page
2. Click "Start Session"
3. Scan QR code
4. Send message: "Hello"
5. Should receive AI response

---

## 🎉 SUCCESS!

If all tests pass:
- ✅ Gateway fixed (no more VPS slowdown)
- ✅ KB embedding works
- ✅ Signup clean (no placeholder)
- ✅ All features functional

---

## 🆘 IF SOMETHING BREAKS

**Gateway issues**:
```bash
ssh root@srv892192.hstgr.cloud
cd /root/salesboy-gateway
git reset --hard HEAD~1
pm2 restart salesboy-gateway
```

**Core issues**:
```bash
cd salesboy-core
git revert HEAD
git push
```

---

## 📞 SUPPORT COMMANDS

```bash
# Gateway logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway"

# Gateway status
ssh root@srv892192.hstgr.cloud "pm2 status"

# VPS resources
ssh root@srv892192.hstgr.cloud "htop"

# Restart gateway
ssh root@srv892192.hstgr.cloud "pm2 restart salesboy-gateway"
```

---

**Total Time**: ~25 minutes

**Ready?** Start with Step 1! 🚀
