# Quick Fix Checklist

**Use this for rapid execution**

---

## ⚠️ URGENT: Gateway Fix (Do This First!)

```bash
# 1. SSH to VPS
ssh root@srv892192.hstgr.cloud

# 2. Delete old test sessions
cd /root/salesboy-gateway/.wwebjs_auth
rm -rf session-current-user session-test-user*

# 3. Check what's left
ls -la

# 4. Restart gateway
pm2 restart salesboy-gateway

# 5. Check logs
pm2 logs salesboy-gateway --lines 50
```

**Expected**: Should see "Skipping invalid session" for any non-UUID sessions

---

## 🐛 Code Fixes

### Fix 1: Update Gateway Session Manager

**File**: `salesboy-gateway/src/lib/session-manager.js`

**Find** (line ~12):
```javascript
restoreExistingSessions() {
  try {
    const authDir = '.wwebjs_auth';
    if (!fs.existsSync(authDir)) return;
    
    const sessions = fs.readdirSync(authDir);
    sessions.forEach(sessionDir => {
      if (sessionDir.startsWith('session-')) {
        const userId = sessionDir.replace('session-', '');
        logger.info(`Restoring session for user ${userId}`);
```

**Replace with**:
```javascript
restoreExistingSessions() {
  try {
    const authDir = '.wwebjs_auth';
    if (!fs.existsSync(authDir)) return;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sessions = fs.readdirSync(authDir);
    
    sessions.forEach(sessionDir => {
      if (sessionDir.startsWith('session-')) {
        const userId = sessionDir.replace('session-', '');
        
        if (uuidRegex.test(userId)) {
          logger.info(`Restoring session for user ${userId}`);
```

**Add after the if statement** (line ~20):
```javascript
        } else {
          logger.warn(`Skipping invalid session: ${sessionDir}`);
        }
```

---

### Fix 2: Remove Placeholder Whitelist

**File**: `salesboy-core/app/api/auth/on-signup/route.ts`

**Delete** (lines ~70-85):
```typescript
    // 4. Create empty whitelists entry
    const { error: whitelistError } = await supabaseAdmin
      .from('whitelists')
      .insert({
        user_id: userId,
        phone_number: 'placeholder',
        name: 'System Placeholder',
        notes: 'Auto-created on signup'
      })

    if (whitelistError && whitelistError.code !== '23505') {
      // Ignore duplicate key errors
      console.warn('Whitelist creation skipped:', whitelistError.code)
    } else {
      console.log('✓ Whitelist initialized')
    }
```

**Update return statement** (line ~90):
```typescript
    return NextResponse.json({
      success: true,
      message: 'User initialized successfully',
      userId,
      initialized: {
        profile: true,
        bot_config: true,
        session: true
        // whitelists: true  ← REMOVE THIS LINE
      }
    })
```

---

### Fix 3: Create KB Embed Route

**Create file**: `salesboy-core/app/api/kb/trigger-embed/route.ts`

**Content**: See `FIX_MILESTONE.md` for full implementation

---

### Fix 4: Update Environment Example

**File**: `salesboy-core/.env.example`

**Replace**:
```bash
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

**With**:
```bash
# LLM Providers (at least one required)
MISTRAL_API_KEY=your_mistral_api_key  # Primary - fast & cheap
GROQ_API_KEY=your_groq_api_key        # Fallback - ultra fast & free

# Legacy (not currently used)
# GEMINI_API_KEY=
# OPENAI_API_KEY=
```

---

### Fix 5: Remove Duplicate Middleware

**Delete file**: `salesboy-core/app/middleware.ts`

---

## ✅ Testing Checklist

### Test 1: Gateway
- [ ] VPS CPU normal
- [ ] PM2 logs clean
- [ ] No "current-user" in logs

### Test 2: Signup
- [ ] Create new account
- [ ] Check profiles table (should exist)
- [ ] Check bot_config table (should exist)
- [ ] Check whitelists table (should be empty)

### Test 3: Dashboard
- [ ] Login works
- [ ] All pages load
- [ ] No console errors

### Test 4: KB Upload
- [ ] Upload file
- [ ] Click "Embed"
- [ ] Check Pinecone dashboard
- [ ] Verify vectors appear

### Test 5: WhatsApp
- [ ] Start session
- [ ] Scan QR
- [ ] Send message
- [ ] Receive AI response

---

## 🚀 Deployment Order

1. **Gateway** (VPS)
   ```bash
   cd /root/salesboy-gateway
   git pull
   npm install
   pm2 restart salesboy-gateway
   ```

2. **Core** (Vercel)
   ```bash
   git add .
   git commit -m "Fix: Gateway session restore, KB embed, placeholder whitelist"
   git push
   ```

3. **Verify**
   - Check Vercel build succeeds
   - Test production URL
   - Monitor error logs

---

## 📊 Quick Status Check

```bash
# Gateway health
curl http://srv892192.hstgr.cloud:3001/health

# Core health
curl https://salesboy-lilac.vercel.app/api/health

# Check PM2
ssh root@srv892192.hstgr.cloud "pm2 status"

# Check logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 20"
```

---

## 🆘 Rollback Plan

If something breaks:

```bash
# Gateway
ssh root@srv892192.hstgr.cloud
cd /root/salesboy-gateway
git reset --hard HEAD~1
pm2 restart salesboy-gateway

# Core
git revert HEAD
git push
```

---

**Time Estimate**: 2-3 hours for all fixes
