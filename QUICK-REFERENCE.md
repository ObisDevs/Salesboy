# Salesboy AI - Quick Reference Card

## 🚀 Quick Commands

### Deploy Gateway Changes
```bash
./sync-gateway-env.sh
```

### Deploy Core Changes
```bash
git add . && git commit -m "update" && git push origin main
```

### Check Gateway Status
```bash
ssh root@srv892192.hstgr.cloud "pm2 status"
```

### View Gateway Logs
```bash
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway"
```

### Restart Gateway
```bash
ssh root@srv892192.hstgr.cloud "pm2 restart salesboy-gateway"
```

### Check Session Files
```bash
ssh root@srv892192.hstgr.cloud "ls -la /root/salesboy-gateway/.wwebjs_auth/"
```

### Reset Session (Force New QR)
```bash
ssh root@srv892192.hstgr.cloud "rm -rf /root/salesboy-gateway/.wwebjs_auth/ && pm2 restart salesboy-gateway"
```

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Dashboard | https://salesboy-lilac.vercel.app |
| Sessions | https://salesboy-lilac.vercel.app/dashboard/sessions |
| Gateway Health | http://srv892192.hstgr.cloud:3001/health |
| Supabase | https://hlkyicsgsjruneetymin.supabase.co |
| VPS | srv892192.hstgr.cloud |

---

## 📁 Project Structure

```
Salesboy/
├── salesboy-core/          # Next.js app (Vercel)
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── webhook/   # WhatsApp webhook
│   │   │   ├── sessions/  # Session management
│   │   │   ├── kb/        # Knowledge base
│   │   │   └── actions/   # Task forwarding
│   │   └── dashboard/     # UI pages
│   └── lib/               # Core libraries
│       ├── gateway-client.ts
│       ├── rag-pipeline.ts
│       ├── intent-classifier.ts
│       └── ...
│
├── salesboy-gateway/       # WhatsApp gateway (VPS)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── session-manager.js
│   │   │   └── message-handler.js
│   │   ├── routes/
│   │   │   ├── session.js
│   │   │   └── message.js
│   │   └── server.js
│   └── .env               # Gateway config
│
└── docs/                   # Documentation
```

---

## 🔧 Environment Variables

### Core (.env.local)
```bash
GATEWAY_URL=http://srv892192.hstgr.cloud:3001
NEXT_WEBHOOK_URL=https://salesboy-lilac.vercel.app/api/webhook/whatsapp
NEXT_PUBLIC_SUPABASE_URL=***
SUPABASE_SERVICE_ROLE_KEY=***
PINECONE_API_KEY=***
GEMINI_API_KEY=***
OPENAI_API_KEY=***
```

### Gateway (.env)
```bash
PORT=3001
API_SECRET_KEY=***
HMAC_SECRET=***
NEXT_WEBHOOK_URL=https://salesboy-lilac.vercel.app/api/webhook/whatsapp
```

---

## 🔄 Message Flow

```
WhatsApp User
    ↓
Gateway (VPS:3001)
    ↓ [POST /api/webhook/whatsapp]
Core Backend (Vercel)
    ↓
1. Check whitelist
2. Classify intent
3. Retrieve context (RAG)
4. Generate response
    ↓ [POST /message/send]
Gateway (VPS:3001)
    ↓
WhatsApp User
```

---

## 🎯 API Endpoints

### Gateway (VPS:3001)
```
POST   /session/start          # Start WhatsApp session
POST   /session/stop           # Stop session
GET    /session/status/:userId # Get status
POST   /message/send           # Send message
GET    /health                 # Health check
```

### Core (Vercel)
```
POST   /api/webhook/whatsapp   # Receive messages
POST   /api/sessions/start     # Start session
POST   /api/sessions/stop      # Stop session
GET    /api/sessions/status    # Get status
POST   /api/kb/upload          # Upload document
POST   /api/kb/process         # Process document
POST   /api/kb/embed           # Generate embeddings
```

---

## 🐛 Common Issues & Fixes

### Session Lost on Refresh
**Fix**: Already fixed! Auto-refresh now polls every 3 seconds.

### 500/404 Errors
**Fix**: Already fixed! Parameter naming now consistent.

### QR Code Not Showing
```bash
# Wait 10 seconds, then check logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 20"
```

### Gateway Not Responding
```bash
# Restart gateway
ssh root@srv892192.hstgr.cloud "pm2 restart salesboy-gateway"
```

### Session Won't Connect
```bash
# Reset session
ssh root@srv892192.hstgr.cloud "rm -rf /root/salesboy-gateway/.wwebjs_auth/ && pm2 restart salesboy-gateway"
```

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User accounts |
| sessions | WhatsApp sessions |
| whitelists | Approved phone numbers |
| messages | Message history |
| knowledge_base | Documents |
| bot_config | AI settings |
| tasks | n8n task queue |
| audit_logs | Security logs |

---

## 🧪 Testing Workflow

1. **Start Session**
   - Go to /dashboard/sessions
   - Click "Start Session"
   - Wait for QR code

2. **Connect WhatsApp**
   - Scan QR with WhatsApp
   - Wait for "Connected" status

3. **Test Persistence**
   - Refresh page
   - Status should remain "Connected"

4. **Test Messaging**
   - Send WhatsApp message
   - Check PM2 logs
   - Verify response received

5. **Disconnect**
   - Click "Disconnect Session"
   - Confirm dialog
   - Verify disconnection

---

## 📈 Monitoring

### Check Gateway Health
```bash
curl http://srv892192.hstgr.cloud:3001/health
```

### View Real-time Logs
```bash
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 100"
```

### Check PM2 Status
```bash
ssh root@srv892192.hstgr.cloud "pm2 status"
```

### Check Disk Space
```bash
ssh root@srv892192.hstgr.cloud "df -h"
```

### Check Memory Usage
```bash
ssh root@srv892192.hstgr.cloud "free -h"
```

---

## 🔐 Security Checklist

- [x] HMAC signature validation (temporarily disabled for testing)
- [x] API key authentication
- [x] Rate limiting
- [x] Whitelist enforcement
- [x] Encrypted message storage
- [x] RLS on database
- [x] Audit logging
- [ ] Re-enable HMAC in production

---

## 📝 Development Workflow

### 1. Make Changes Locally
```bash
cd /workspaces/Salesboy/salesboy-core
# Edit files
npm run dev  # Test locally
```

### 2. Deploy to Vercel
```bash
git add .
git commit -m "description"
git push origin main
```

### 3. Update Gateway
```bash
# If gateway files changed
scp -r salesboy-gateway/* root@srv892192.hstgr.cloud:/root/salesboy-gateway/
ssh root@srv892192.hstgr.cloud "cd /root/salesboy-gateway && pm2 restart salesboy-gateway"
```

### 4. Test Changes
- Visit dashboard
- Check logs
- Test functionality

---

## 🎓 Key Concepts

### Session Persistence
- Uses LocalAuth from whatsapp-web.js
- Stores auth in `.wwebjs_auth/session-{userId}/`
- Persists across restarts

### Auto-Refresh
- Polls status every 3 seconds
- Updates UI in real-time
- Cleans up on unmount

### RAG Pipeline
1. Generate query embedding
2. Search Pinecone vectors
3. Retrieve relevant chunks
4. Generate contextualized response

### Intent Classification
- Response: General questions
- Task: Actionable requests
- HumanHandoff: Complex issues

---

## 📞 Support

### Check Logs First
```bash
# Gateway logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway"

# Vercel logs
# Visit: https://vercel.com/your-project/logs
```

### Common Log Locations
- Gateway: PM2 logs + `/root/salesboy-gateway/logs/`
- Core: Vercel dashboard
- Database: Supabase dashboard

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Gateway running on VPS
- [ ] Core deployed to Vercel
- [ ] Database migrations applied
- [ ] Whitelist configured
- [ ] Knowledge base uploaded
- [ ] Bot config set

---

## 🚦 Status Indicators

### Gateway
- ✅ Green: Running and healthy
- ⚠️ Yellow: Running but issues
- ❌ Red: Not running

### Session
- ✅ Connected: Ready to send/receive
- 🔄 Connecting: Waiting for QR scan
- ❌ Disconnected: No active session

### Dashboard
- ✅ Loaded: All systems operational
- ⚠️ Partial: Some features unavailable
- ❌ Error: System down

---

**Last Updated**: December 8, 2024  
**Version**: 1.0.0  
**Status**: Session persistence fixes deployed
