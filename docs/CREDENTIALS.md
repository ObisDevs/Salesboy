# Salesboy AI - Service Credentials

## VPS Configuration

**VPS URL:** https://srv892192.hstgr.cloud  
**Gateway Port:** 3001  
**Gateway Endpoint:** https://srv892192.hstgr.cloud:3001  
**Project Directory:** `/root/salesboy-gateway`

**Installed Software:**
- Node.js: v20.19.6
- NPM: v10.8.2
- PM2: Installed
- Git: v2.43.0
- Certbot: Installed

**Firewall Ports:**
- 22 (SSH)
- 3001 (Gateway)
- 443 (HTTPS)

---

## Supabase

**Status:** ⏳ Pending Setup

**Setup Instructions:**
1. Go to https://supabase.com
2. Create new project: `salesboy-ai`
3. Choose region closest to Nigeria (e.g., Frankfurt, London)
4. Save credentials below

**Credentials:**
```
SUPABASE_URL=https://hlkyicsgsjruneetymin.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsa3lpY3Nnc2pydW5lZXR5bWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTcxNDUsImV4cCI6MjA4MDY5MzE0NX0.FjG3pw06E0cTZmw095axjnt6_UFKAbsZw6TFNoZ7AWg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsa3lpY3Nnc2pydW5lZXR5bWluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTExNzE0NSwiZXhwIjoyMDgwNjkzMTQ1fQ.0FgqQvrYWPEwqS18Z-FIaHANRGGX7jsWt2MueEezO3s
DATABASE_PASSWORD=("")
```

---

## Pinecone

**Status:** ⏳ Pending Setup

**Setup Instructions:**
1. Go to https://www.pinecone.io
2. Create account
3. Create index with these settings:
   - Name: `salesboy-vectors`
   - Dimensions: `768` (for Gemini) or `1536` (for OpenAI)
   - Metric: `cosine`
   - Cloud: AWS
   - Region: us-east-1

**Credentials:**
```
PINECONE_API_KEY= pcsk_5b4Nr8_JhmoGpws3bUK1kiHTgyrK8yEZnebMcb89gpCR9cN1ERPf3JLVVXe6CWYQDeDy8A
PINECONE_INDEX_NAME=salesboy-vectors
PINECONE_ENVIRONMENT=us-east-1
```

---

## n8n Workflow Automation

**Status:** ⏳ Pending Setup

**Setup Instructions:**
1. Go to https://n8n.io
2. Sign up for cloud account
3. Save webhook URL

**Credentials:**
```
N8N_WEBHOOK_URL=https://n8n.srv892192.hstgr.cloud/
```

---

## LLM API Keys

**Status:** ⏳ Pending Setup

### Google Gemini (Primary - FREE)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key

```
GEMINI_API_KEY=AIzaSyAvlFlBPkUl0eMSp6BeGKJLUH72WLXlLjM
```

### Mistral AI (Fallback - FREE)
1. Go to https://console.mistral.ai
2. Create API key

```
MISTRAL_API_KEY=
```

### OpenAI (Fallback - Paid)
1. Go to https://platform.openai.com/api-keys
2. Create API key

```
OPENAI_API_KEY=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
```

---

## Redis (Optional)

**Status:** ⏳ Optional - Can skip for MVP

**Setup Instructions:**
1. Go to https://upstash.com
2. Create Redis database: `salesboy-cache`
3. Copy connection URL

**Credentials:**
```
REDIS_URL=
```

---

## Security Keys

**Generate these random secrets:**

```bash
# Generate API secret (run on VPS)
openssl rand -hex 32

# Generate HMAC secret (run on VPS)
openssl rand -hex 32
```

**Credentials:**
```
API_SECRET_KEY=
HMAC_SECRET=
```

---

## Next.js Core App

**Status:** ⏳ Will be deployed to Vercel in Milestone 3

**Deployment:**
- Platform: Vercel
- Repository: GitHub

**Credentials:**
```
NEXT_WEBHOOK_URL=https://your-app.vercel.app/api/webhook/whatsapp
```

---

## Complete Environment Variables

Once all services are set up, create `/root/salesboy-gateway/.env`:

```env
# Environment
NODE_ENV=production
PORT=3001

# Security
API_SECRET_KEY=your-generated-secret
HMAC_SECRET=your-generated-hmac-secret

# Gateway
GATEWAY_URL=https://srv892192.hstgr.cloud:3001

# Next.js Core (will be added in Milestone 3)
NEXT_WEBHOOK_URL=https://your-nextjs-app.vercel.app/api/webhook/whatsapp

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX_NAME=salesboy-vectors
PINECONE_ENVIRONMENT=us-east-1

# LLM Providers
GEMINI_API_KEY=
MISTRAL_API_KEY=
OPENAI_API_KEY=

# n8n
N8N_WEBHOOK_URL=

# Redis (Optional)
REDIS_URL=
```

---

## Setup Checklist

- [ ] VPS configured (✅ Complete)
- [ ] Supabase project created
- [ ] Pinecone index created
- [ ] n8n account setup
- [ ] Gemini API key obtained
- [ ] Mistral API key obtained (optional)
- [ ] OpenAI API key obtained (optional)
- [ ] Security keys generated
- [ ] `.env` file created on VPS

---

## Next Steps

1. Complete third-party service setups (Supabase, Pinecone, n8n)
2. Generate security keys on VPS
3. Create `.env` file with all credentials
4. Begin Milestone 1: Gateway development
