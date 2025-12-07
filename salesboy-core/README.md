# Salesboy Core Backend

The core Next.js backend for Salesboy AI - handles WhatsApp message processing, RAG pipeline, and AI orchestration.

## Features

- **WhatsApp Webhook Handler** - Processes incoming messages with HMAC validation
- **RAG Pipeline** - Retrieval-Augmented Generation using Pinecone and LLMs
- **Intent Classification** - Classifies messages as Response, Task, or HumanHandoff
- **Knowledge Base Management** - Upload, process, and embed documents
- **Session Management** - Start/stop WhatsApp sessions via gateway
- **Task Forwarding** - Forward classified tasks to n8n workflows
- **Security** - HMAC validation, encryption, rate limiting

## API Endpoints

### Webhook
- `POST /api/webhook/whatsapp` - Main message processor

### Sessions
- `POST /api/sessions/start` - Start WhatsApp session
- `POST /api/sessions/stop` - Stop WhatsApp session  
- `GET /api/sessions/status` - Get session status

### Knowledge Base
- `POST /api/kb/upload` - Upload documents
- `POST /api/kb/process` - Extract and chunk text
- `POST /api/kb/embed` - Generate embeddings

### Actions
- `POST /api/actions/forward-to-n8n` - Forward tasks to n8n

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GATEWAY_URL=your_gateway_url
API_SECRET_KEY=your_api_secret
HMAC_SECRET=your_hmac_secret
N8N_WEBHOOK_URL=your_n8n_url
```

## Installation

```bash
cd salesboy-core
npm install
npm run dev
```

## Architecture

```
Message Flow:
WhatsApp → Gateway → Webhook → Validation → RAG → Intent → Response/Task → Gateway → WhatsApp

Libraries:
- lib/supabase.ts - Database clients
- lib/pinecone.ts - Vector operations
- lib/embeddings.ts - Embedding generation
- lib/intent-classifier.ts - Intent classification
- lib/rag-pipeline.ts - RAG processing
- lib/llm-client.ts - Multi-provider LLM
- lib/gateway-client.ts - Gateway communication
- lib/hmac.ts - Security validation
- lib/encryption.ts - Data encryption
```

## Testing

```bash
node test-api.js
```

## Security Features

- HMAC signature validation on all webhooks
- AES-256-GCM encryption for chat logs
- Input validation with Zod schemas
- Rate limiting and authentication
- RLS policies enforced via Supabase

## Dependencies

- Next.js 14 with App Router
- Supabase for database and storage
- Pinecone for vector search
- Google Gemini and OpenAI for LLMs
- Zod for validation
- PDF parsing and document processing