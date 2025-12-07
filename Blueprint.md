You are the Lead Full-Stack Architect and Senior Engineer responsible for designing and implementing the entire application “Salesboy AI”. You control planning, sequencing, task breakdown, execution, testing, and validation. You must autonomously determine the correct order of tasks and produce the required artifacts in each stage.

#############################################################################################################
# PRODUCT OVERVIEW
#############################################################################################################
Salesboy AI is a WhatsApp-based AI automation system for small Nigerian businesses. It connects a business owner’s WhatsApp number to an AI-powered assistant that can respond to customers, interact with a knowledge base, take actions through n8n automations, and manage business workflows.

The stack:
- Next.js 14 (App Router) — frontend + backend routes
- Node.js microservice using web-whatsapp.js — WhatsApp gateway
- Supabase — auth, database, storage, RLS
- Pinecone — vector DB for embeddings and retrieval
- n8n — workflow engine for executing business tasks
- LLM providers — Gemini (primary), Mistral (fallback), OpenAI (fallback)
- Redis — optional, for session state caching(vercel redis integration)

The system includes:
- Multi-session WhatsApp gateway (one user = one WhatsApp session)
- QR generation + SSE QR streaming
- Incoming message webhook → RAG + intent classification → responses
- Task forwarding to n8n
- User dashboard for knowledge base, groups, whitelists, logs
- Secure role-based access using Supabase RLS
- Chat logs encrypted at rest
- HMAC-signed webhooks between services
- Fully deployable via Hostinger VPS + systemd + nginx

#############################################################################################################
# NON-FUNCTIONAL REQUIREMENTS
#############################################################################################################
- High reliability and crash resistance.
- Strong security: API keys, HMAC signatures, https-only, input validation.
- RLS enforced everywhere.
- AES-256-GCM encryption for chat logs.
- Rate limiting.
- Clear observability: logs, error tracking, minimal metrics.
- Clean code, modularity, correct types, tests.

#############################################################################################################
# FULL ARCHITECTURE (DETAILED)
#############################################################################################################
SYSTEM LAYERS:
1. **Salesboy Gateway (VPS microservice)**  
   - Runs on Node 20 using web-whatsapp.js  
   - Provides endpoints:
       POST /session/start  
       GET  /session/qr/:userId  (SSE)  
       POST /session/stop  
       POST /message/send  
       GET  /groups?user_id=...  
       GET  /contacts?user_ids=...
   - Forwards incoming WhatsApp messages to NEXT_WEBHOOK_URL with HMAC.

2. **Salesboy Core (Next.js app)**  
   - Handles user signup/login via Supabase Auth
   - Dashboard: sessions, KB manager, group manager, whitelists, logs
   - API routes for:
       /api/webhook/whatsapp  
       /api/kb/upload  
       /api/kb/chunk-embed  
       /api/actions/forward-to-n8n  
       /api/sessions/start, stop, status  
   - RAG pipeline using Pinecone
   - Intent Classification (strict JSON schema, Zod validation)

3. **Supabase (DB + Auth)**  
   Tables:
   - profiles  
   - bot_config  
   - whitelists  
   - group_settings  
   - knowledge_base  
   - chat_logs  
   - sessions  
   - audit_logs  

   All tables have RLS enforced.  
   Service role is allowed only for server-side operations.

4. **Pinecone**  
   - Namespace: user_{id}  
   - Chunking: 500–800 tokens with 20% overlap  
   - Metadata stored per vector: user_id, filename, chunk_index, relevance attributes.

5. **n8n**  
   Handles:
   - send_email_workflow  
   - book_calendar_workflow  
   - create_order_workflow  
   - human_handoff_workflow  
   Uses secure HMAC-verified webhook triggers.

#############################################################################################################
# IMPLEMENTATION PHASES (THE AGENT MUST EXPAND & DECIDE ORDER)
#############################################################################################################
The following content is *not* necessarily in execution order.  
Your job is to break them down into tasks, sequence them appropriately, and build everything.

──────────────────────────────────────────────────────────────────────────────
PHASE 0 — INFRASTRUCTURE PREP
──────────────────────────────────────────────────────────────────────────────
- Create repo structure for:
  /salesboy-gateway
  /salesboy-core
  /deploy
  /docs
  /examples
- Setup Supabase project and environment variables.
- Prepare Hostinger VPS with Node 20, Nginx, systemd, certbot. (I use pm2 in my vps)

──────────────────────────────────────────────────────────────────────────────
PHASE 1 — SALESBOY GATEWAY (web-whatsapp.js microservice)
──────────────────────────────────────────────────────────────────────────────
Files to produce:
- server.js or server.ts  
- package.json  
- tsconfig.json  
- .env.example  
- utils/hmac.js  
- utils/logger.js  
- lib/session-manager.js  
- lib/message-handler.js  
- routes/*

Behaviors:
- Multi-session support using LocalAuth (`sessionId = userId`)
- SSE QR streaming via GET /session/qr/:userId
- POST /session/start → initializes session; returns metadata
- POST /session/stop
- POST /message/send → supports text + media
- GET  /groups?user_id=...
- Validate all requests with API_SECRET_KEY
- Forward incoming messages to NEXT_WEBHOOK_URL with HMAC
- Rate limiting middleware
- Optional Redis store for session metadata
- Logging with rotating logs
- systemd unit file for VPS deployment
- nginx config for reverse proxy + SSL
- curl and Postman examples

Tests:
- Unit tests for session lifecycle
- Unit tests for message forwarding with HMAC
- Integration test: start → simulate incoming → ensure webhook received

──────────────────────────────────────────────────────────────────────────────
PHASE 2 — SUPABASE SCHEMA + RLS
──────────────────────────────────────────────────────────────────────────────
Produce full SQL migration:
- profiles table
- bot_config table
- whitelists table
- group_settings table
- knowledge_base table
- chat_logs table (encrypted payload column)
- sessions table
- audit_logs table

Create all indexes and foreign keys.  
Enable RLS on all tables with owner-based policies.

Add functions:
- log_audit_action(user_id, action, detail)
- encrypt/decrypt helpers (client-side encryption)

──────────────────────────────────────────────────────────────────────────────
PHASE 3 — NEXT.JS CORE BACKEND
──────────────────────────────────────────────────────────────────────────────
Implement:
- /api/webhook/whatsapp (HMAC validation, pipeline orchestration)
- /api/sessions/start, stop, status
- /api/kb/upload (Supabase storage)
- /api/kb/process (text extraction + chunking)
- /api/kb/embed (embeddings then Pinecone upsert)
- /api/actions/forward-to-n8n (HMAC signed)

Add libraries:
- lib/supabase.ts (service role client)
- lib/pinecone.ts
- lib/embeddings.ts
- lib/intent-classifier.ts (Zod schema + repair loop)
- lib/gateway-client.ts
- lib/encryption.ts (AES-256-GCM wrappers)

Intent classifier must produce strict JSON:
{
  "intent": "Response" | "Task" | "HumanHandoff",
  "confidence": number,
  "task_type": string | null,
  "payload": object | null,
  "raw_analysis": string
}

RAG pipeline:
- Retrieve top K chunks
- Re-rank metadata relevance
- Compose system message + context
- Generate response using Gemini/Mistral/OpenAI (fallback order)

──────────────────────────────────────────────────────────────────────────────
PHASE 4 — NEXT.JS DASHBOARD UI
──────────────────────────────────────────────────────────────────────────────
Pages:
- /dashboard: overview
- /dashboard/sessions: start/stop, QR stream
- /dashboard/kb: upload, list, delete, re-embed
- /dashboard/groups: list groups, toggle reply
- /dashboard/whitelist: CRUD
- /dashboard/logs: chat logs + audit logs
- /settings/bot: system prompt, temperature, metadata fields

Use:
- Tailwind CSS
- Shadcn UI components
- Server components wherever possible

──────────────────────────────────────────────────────────────────────────────
PHASE 5 — N8N WORKFLOWS
──────────────────────────────────────────────────────────────────────────────
Create secure webhook listeners:
- /webhook/email
- /webhook/calendar
- /webhook/order
- /webhook/handoff

Each workflow:
- Validates HMAC
- Executes deterministic action
- Sends success/failure back to the core app

──────────────────────────────────────────────────────────────────────────────
PHASE 6 — TESTING & CI/CD
──────────────────────────────────────────────────────────────────────────────
- Unit test coverage >70% on core logic
- Integration test for WhatsApp pipeline
- E2E pseudo-test using mock gateway
- GitHub Actions CI:
  - Install dependencies
  - Run lint + type-check
  - Run all tests
  - Build Next.js
  - Prepare deployment artifacts

──────────────────────────────────────────────────────────────────────────────
PHASE 7 — DEPLOYMENT
──────────────────────────────────────────────────────────────────────────────
- Deploy gateway to VPS using systemd + nginx
- Deploy Next.js to Vercel or VPS
- Configure DNS and SSL
- Add log rotation + backup strategy
- Hard security audit before production

──────────────────────────────────────────────────────────────────────────────
PHASE 8 — POST-MVP IMPROVEMENTS
──────────────────────────────────────────────────────────────────────────────
- Business WhatsApp Cloud API migration path
- Broadcast automation with template management
- Team inbox roles
- Customer CRM dashboard
- Billing and subscription tiers
- Voice note transcription
- Offline fallback

#############################################################################################################
# GLOBAL CODING STANDARDS
#############################################################################################################
- TypeScript everywhere except where Node requires JS (but prefer TS).
- Use ESM modules.
- All inputs validated using Zod.
- All secrets from env; never committed.
- Adopt clean layered folder structure.
- Include extensive comments and docstrings.
- Ensure idempotency for webhooks.
- Avoid logging PII in plaintext.

#############################################################################################################
# SECURITY MANDATES
#############################################################################################################
- HMAC signature on all webhook transmissions.
- Bearer token or X-API-KEY required for all internal endpoints.
- HTTPS enforced on all ingress.
- RLS must deny by default.
- Encrypt chat logs with AES-256-GCM.
- Rotate secrets periodically.
- Validate all inputs.
- Rate-limit by IP and user.

#############################################################################################################
# DELIVERABLE EXPECTATIONS
#############################################################################################################
Each stage must produce:
- Complete code
- README explaining usage
- Tests + test-results.txt
- Deployment files
- Postman collection
- Curl examples
- Document assumptions and tradeoffs
- Release notes for each milestone

#############################################################################################################
# FIRST ACTION FOR THE AGENT
#############################################################################################################
Begin by planning the build sequence in detail.  
After planning, execute PHASE 1 — Salesboy Gateway — as the first deliverable.  
Produce the entire microservice, tests, systemd, nginx config, README, env example, and smoke-test script.

Continue automatically through all phases until the entire system is complete.
By the End of Step 7, Users should be able to use all the features in the app.
