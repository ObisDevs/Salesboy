# Salesboy AI - Testing & Deployment Guide

## Current Status
- ✅ **Gateway (VPS):** Running on https://srv892192.hstgr.cloud:3001
- ✅ **Core Backend:** Implemented locally (needs deployment)
- ❌ **Database:** Needs schema setup (Milestone 2)
- ❌ **Integration:** End-to-end testing needed

## Testing Strategy

### Phase 1: Local Development Testing

#### 1. Setup Core Backend Locally
```bash
cd salesboy-core
npm install
cp ../.env .env.local
npm run dev  # Runs on http://localhost:3000
```

#### 2. Test Individual Components
```bash
# Test API structure
node test-api.js

# Test libraries (create simple tests)
node -e "
const { generateHmac } = require('./lib/hmac.js');
console.log('HMAC Test:', generateHmac('test'));
"
```

### Phase 2: Gateway Integration Testing

#### 1. Test Gateway Endpoints
```bash
# Health check
curl https://srv892192.hstgr.cloud:3001/health

# Start session (replace API_KEY)
curl -X POST https://srv892192.hstgr.cloud:3001/session/start \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'
```

#### 2. Test Message Flow (Mock)
```bash
# Send test webhook to local core (with HMAC)
curl -X POST http://localhost:3000/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256=HMAC_HERE" \
  -d '{
    "from": "+1234567890",
    "message": "Hello AI",
    "user_id": "test-user"
  }'
```

### Phase 3: Database Setup (Milestone 2 Required)

Before full testing, we need to implement the database schema:

```sql
-- Create tables (simplified for testing)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active BOOLEAN DEFAULT true
);

CREATE TABLE whitelists (
  user_id UUID REFERENCES profiles(id),
  phone_number TEXT
);

CREATE TABLE chat_logs (
  user_id UUID,
  phone_number TEXT,
  message_type TEXT,
  content TEXT,
  timestamp TIMESTAMPTZ
);

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ... (full schema needed)
```

## Deployment Options

### Option 1: Deploy Core to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from salesboy-core directory
cd salesboy-core
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Deploy Core to Same VPS
```bash
# Copy core to VPS
scp -r salesboy-core/ root@srv892192.hstgr.cloud:/root/

# On VPS, setup Next.js
cd /root/salesboy-core
npm install
npm run build
pm2 start npm --name "salesboy-core" -- start
```

## Integration Testing Plan

### 1. End-to-End Message Flow
```
WhatsApp → Gateway (VPS) → Core Backend → AI Pipeline → Response → Gateway → WhatsApp
```

### 2. Test Scenarios
1. **Simple Query:** "What are your business hours?"
2. **Knowledge Base Query:** Upload document, ask related question
3. **Task Request:** "Send email to customer@example.com"
4. **Human Handoff:** Complex complaint or unclear request

### 3. Test Data Setup
```bash
# Create test user in Supabase
# Add test phone number to whitelist
# Upload test document to knowledge base
# Configure bot settings
```

## What's Next?

### Immediate Priority: Milestone 2 (Database Schema)
Before full testing, we need:
1. **Supabase Schema Setup** - Create all tables with RLS
2. **Test Data Seeding** - Add test users, whitelists, bot config
3. **Storage Buckets** - Setup knowledge-base and media buckets

### Then: Full Integration Testing
1. **Deploy Core Backend** (Vercel or VPS)
2. **Update Gateway Config** - Point to deployed core
3. **End-to-End Testing** - Real WhatsApp messages
4. **Performance Testing** - Load and response times

### Finally: Milestone 4 (Dashboard UI)
1. **User Interface** - Manage sessions, knowledge base, settings
2. **Real-time Features** - QR code display, session status
3. **User Experience** - Complete business owner workflow

## Quick Start Commands

```bash
# 1. Test gateway is running
curl https://srv892192.hstgr.cloud:3001/health

# 2. Start core backend locally
cd salesboy-core && npm run dev

# 3. Test core API structure
node test-api.js

# 4. Next: Implement Milestone 2 (Database Schema)
# 5. Then: Deploy core backend
# 6. Finally: End-to-end integration testing
```

## Environment Configuration

Update `NEXT_WEBHOOK_URL` in gateway .env to point to deployed core:
```env
# For Vercel deployment
NEXT_WEBHOOK_URL=https://your-app.vercel.app/api/webhook/whatsapp

# For VPS deployment  
NEXT_WEBHOOK_URL=https://srv892192.hstgr.cloud:3000/api/webhook/whatsapp
```