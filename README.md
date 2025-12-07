# Salesboy AI

WhatsApp-based AI automation system for small Nigerian businesses.

## Project Status

- ✅ **Milestone 0:** Infrastructure Preparation
- ✅ **Milestone 1:** Salesboy Gateway (WhatsApp Microservice) 
- ✅ **Milestone 2:** Database Schema & RLS
- ✅ **Milestone 3:** Next.js Core Backend - **COMPLETED**
- ⏳ **Milestone 4:** Dashboard UI (Next)
- ⏳ **Milestone 5:** n8n Workflow Integration
- ⏳ **Milestone 6:** Testing & Quality Assurance
- ⏳ **Milestone 7:** Deployment & Production Launch

## Milestone 3 Deliverables ✅

### Core Backend Implementation
- **WhatsApp Webhook Handler** - Processes messages with HMAC validation
- **RAG Pipeline** - Retrieval-Augmented Generation using Pinecone
- **Intent Classification** - AI-powered message classification with Zod validation
- **Knowledge Base APIs** - Upload, process, and embed documents
- **Session Management** - Start/stop WhatsApp sessions
- **Task Forwarding** - Forward classified tasks to n8n workflows
- **Security Layer** - HMAC validation, encryption, rate limiting

### API Routes Implemented
- `POST /api/webhook/whatsapp` - Main message processor
- `POST /api/sessions/start|stop` - Session management
- `GET /api/sessions/status` - Session status
- `POST /api/kb/upload|process|embed` - Knowledge base operations
- `POST /api/actions/forward-to-n8n` - Task forwarding

### Core Libraries Created
- `lib/supabase.ts` - Database clients
- `lib/pinecone.ts` - Vector operations
- `lib/embeddings.ts` - Embedding generation
- `lib/intent-classifier.ts` - Intent classification
- `lib/rag-pipeline.ts` - RAG processing
- `lib/llm-client.ts` - Multi-provider LLM client
- `lib/gateway-client.ts` - Gateway communication
- `lib/hmac.ts` - Security validation
- `lib/encryption.ts` - Data encryption

## Architecture

```
WhatsApp Message → Gateway → Core Backend → AI Pipeline → Response
                                    ↓
                            RAG + Intent Classification
                                    ↓
                            Response/Task/HumanHandoff
```

## Quick Start

```bash
# Core Backend
cd salesboy-core
npm install
npm run dev

# Gateway (separate terminal)
cd salesboy-gateway  
npm install
npm start
```
