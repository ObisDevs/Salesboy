# Salesboy AI - Implementation Milestones

## Milestone 0: Infrastructure Preparation
**Duration:** 1-2 days  
**Status:** In Progress

### Objectives
Set up foundational infrastructure and project structure

### Setup Guide
📋 **See [docs/MILESTONE-0-SETUP.md](docs/MILESTONE-0-SETUP.md) for detailed instructions**

### Tasks
- [x] VPS access and project folder created (`/root/salesboy-gateway`)
- [ ] Install Node.js 20 via NVM
- [ ] Install PM2 process manager
- [ ] Install and configure Nginx
- [ ] Configure firewall (UFW)
- [ ] Install Certbot for SSL
- [ ] Install Git
- [ ] Install Chrome dependencies for WhatsApp
- [ ] Create Supabase project
- [ ] Create Pinecone index
- [ ] Setup n8n instance
- [ ] Create environment variable templates

### Deliverables
- ✅ VPS access and project directory
- [ ] Complete VPS configuration
- [ ] `.env.example` files for all services
- [ ] All third-party service accounts ready

---

## Milestone 1: Salesboy Gateway (WhatsApp Microservice)
**Duration:** 3-4 days  
**Status:** Not Started  
**Dependencies:** Milestone 0

### Objectives
Build the WhatsApp gateway microservice using web-whatsapp.js

### Tasks
- [ ] Initialize Node.js project with TypeScript
- [ ] Implement multi-session manager
  - Session lifecycle (start/stop/status)
  - LocalAuth with userId as sessionId
  - Session state persistence
- [ ] Build API endpoints
  - `POST /session/start` - Initialize WhatsApp session
  - `GET /session/qr/:userId` - SSE QR code streaming
  - `POST /session/stop` - Terminate session
  - `POST /message/send` - Send text/media messages
  - `GET /groups?user_id=...` - List WhatsApp groups
  - `GET /contacts?user_ids=...` - Get contact info
- [ ] Implement security middleware
  - API key validation (X-API-KEY)
  - Rate limiting by IP
  - HMAC signature generation for outgoing webhooks
- [ ] Build message handler
  - Incoming message listener
  - Forward to NEXT_WEBHOOK_URL with HMAC
  - Message queue for reliability
- [ ] Add utilities
  - Logger with rotating file logs
  - HMAC helper functions
  - Error handling middleware
- [ ] Create deployment files
  - PM2 ecosystem file
  - Nginx reverse proxy config
  - SSL setup with Certbot
- [ ] Write tests
  - Unit tests for session lifecycle
  - HMAC signature validation tests
  - Integration test for message flow

### Deliverables
- Complete gateway microservice
- `README.md` with setup instructions
- `package.json` with all dependencies
- `.env.example`
- PM2 and Nginx configs
- Postman collection
- cURL examples
- Test suite with >70% coverage

---

## Milestone 2: Database Schema & RLS
**Duration:** 2-3 days  
**Status:** Not Started  
**Dependencies:** Milestone 0

### Objectives
Design and implement complete Supabase database schema with security

### Tasks
- [ ] Create SQL migration file
- [ ] Define tables
  - `profiles` - User profiles linked to auth.users
  - `bot_config` - Per-user bot configuration
  - `whitelists` - Allowed phone numbers
  - `group_settings` - WhatsApp group preferences
  - `knowledge_base` - Uploaded documents metadata
  - `chat_logs` - Encrypted conversation history
  - `sessions` - WhatsApp session state
  - `audit_logs` - Security and action audit trail
- [ ] Add indexes and foreign keys
- [ ] Implement RLS policies
  - Owner-based access for all tables
  - Service role bypass for server operations
  - Deny by default
- [ ] Create database functions
  - `log_audit_action(user_id, action, detail)`
  - Helper functions for common queries
- [ ] Set up Supabase Storage buckets
  - `knowledge-base` - Document uploads
  - `media` - WhatsApp media files
- [ ] Configure storage policies

### Deliverables
- Complete SQL migration file
- RLS policy documentation
- Database schema diagram
- Supabase setup guide
- Test data seeding script

---

## Milestone 3: Next.js Core Backend
**Duration:** 5-6 days  
**Status:** Not Started  
**Dependencies:** Milestones 1, 2

### Objectives
Build the core backend API and AI pipeline

### Tasks
- [ ] Initialize Next.js 14 project (App Router)
- [ ] Set up Supabase client
  - Service role client for server operations
  - Anonymous client for auth
- [ ] Implement API routes
  - `POST /api/webhook/whatsapp` - Receive messages from gateway
  - `POST /api/sessions/start` - Start WhatsApp session
  - `POST /api/sessions/stop` - Stop session
  - `GET /api/sessions/status` - Check session status
  - `POST /api/kb/upload` - Upload documents
  - `POST /api/kb/process` - Extract and chunk text
  - `POST /api/kb/embed` - Generate embeddings and upsert to Pinecone
  - `DELETE /api/kb/:id` - Delete document
  - `POST /api/actions/forward-to-n8n` - Forward tasks to n8n
- [ ] Build core libraries
  - `lib/supabase.ts` - Supabase clients
  - `lib/pinecone.ts` - Pinecone operations
  - `lib/embeddings.ts` - Embedding generation (Gemini/OpenAI)
  - `lib/intent-classifier.ts` - Intent classification with Zod
  - `lib/rag-pipeline.ts` - RAG retrieval and response generation
  - `lib/gateway-client.ts` - Gateway API client
  - `lib/encryption.ts` - AES-256-GCM encryption
  - `lib/hmac.ts` - HMAC validation
  - `lib/llm-client.ts` - Multi-provider LLM client (Gemini/Mistral/OpenAI)
- [ ] Implement RAG pipeline
  - Query embedding generation
  - Pinecone similarity search
  - Context ranking and filtering
  - Prompt composition
  - Response generation with fallback
- [ ] Build intent classifier
  - Strict JSON schema with Zod
  - Output: `{intent, confidence, task_type, payload, raw_analysis}`
  - Repair loop for malformed JSON
  - Intent types: Response, Task, HumanHandoff
- [ ] Implement webhook handler
  - HMAC signature validation
  - Message preprocessing
  - Whitelist/group filtering
  - Pipeline orchestration
  - Response delivery via gateway
- [ ] Add middleware
  - Authentication check
  - Rate limiting
  - Error handling
  - Request logging
- [ ] Write tests
  - Unit tests for each library
  - Integration tests for API routes
  - Mock tests for LLM responses

### Deliverables
- Complete Next.js backend
- All API routes functional
- RAG pipeline working end-to-end
- Intent classification with validation
- Comprehensive test suite
- API documentation

---

## Milestone 4: Next.js Dashboard UI
**Duration:** 4-5 days  
**Status:** Not Started  
**Dependencies:** Milestone 3

### Objectives
Build user-facing dashboard for managing the AI assistant

### Tasks
- [ ] Set up UI framework
  - Install Tailwind CSS
  - Install Shadcn UI components
  - Configure theme and styling
- [ ] Implement authentication
  - Login page
  - Signup page
  - Password reset flow
  - Protected route middleware
- [ ] Build dashboard pages
  - `/dashboard` - Overview with stats
  - `/dashboard/sessions` - WhatsApp session management
    - Start/stop session
    - QR code display with SSE
    - Session status indicator
  - `/dashboard/kb` - Knowledge base manager
    - Upload documents
    - List uploaded files
    - Delete documents
    - Re-embed documents
    - Processing status
  - `/dashboard/groups` - Group management
    - List WhatsApp groups
    - Toggle auto-reply per group
    - Group settings
  - `/dashboard/whitelist` - Contact whitelist
    - Add/remove phone numbers
    - Bulk import
    - List view with search
  - `/dashboard/logs` - Activity logs
    - Chat logs (decrypted)
    - Audit logs
    - Filtering and search
  - `/dashboard/settings/bot` - Bot configuration
    - System prompt editor
    - Temperature and model settings
    - Metadata fields
    - Response preferences
- [ ] Build reusable components
  - Navigation sidebar
  - Header with user menu
  - Loading states
  - Error boundaries
  - Toast notifications
  - Confirmation modals
- [ ] Implement real-time features
  - SSE for QR code updates
  - Live session status
  - Real-time log streaming (optional)
- [ ] Add form validation
  - Zod schemas for all forms
  - Client-side validation
  - Error display
- [ ] Optimize performance
  - Server components where possible
  - Lazy loading
  - Image optimization

### Deliverables
- Complete dashboard UI
- All pages functional and styled
- Responsive design
- User guide documentation
- Screenshots for documentation

---

## Milestone 5: n8n Workflow Integration
**Duration:** 2-3 days  
**Status:** Not Started  
**Dependencies:** Milestone 3

### Objectives
Create n8n workflows for task automation

### Tasks
- [ ] Set up n8n instance
  - Install and configure n8n
  - Set up authentication
  - Configure webhook URLs
- [ ] Create workflow templates
  - `send_email_workflow` - Send emails via SMTP/SendGrid
  - `book_calendar_workflow` - Create calendar events
  - `create_order_workflow` - Process orders
  - `human_handoff_workflow` - Notify human agent
- [ ] Implement webhook security
  - HMAC signature validation node
  - Request validation
  - Error handling
- [ ] Build workflow logic
  - Parse incoming payload
  - Execute business logic
  - External API integrations
  - Success/failure response
- [ ] Create callback mechanism
  - Send results back to core app
  - Update task status
  - Log execution
- [ ] Test workflows
  - Unit test each workflow
  - Integration test with core app
  - Error scenario testing

### Deliverables
- n8n workflow JSON exports
- Workflow documentation
- Setup guide for n8n
- Test scripts
- Integration examples

---

## Milestone 6: Testing & Quality Assurance
**Duration:** 3-4 days  
**Status:** Not Started  
**Dependencies:** Milestones 1-5

### Objectives
Comprehensive testing and quality assurance

### Tasks
- [ ] Unit testing
  - Gateway: >70% coverage
  - Core backend: >70% coverage
  - Utility functions: 100% coverage
- [ ] Integration testing
  - End-to-end message flow
  - WhatsApp → Gateway → Core → RAG → Response
  - Task forwarding to n8n
  - Knowledge base upload and retrieval
- [ ] Security testing
  - HMAC validation
  - RLS policy enforcement
  - Encryption/decryption
  - Rate limiting
  - Input validation
- [ ] Performance testing
  - Load test gateway endpoints
  - RAG pipeline latency
  - Database query optimization
  - Concurrent session handling
- [ ] Set up CI/CD
  - GitHub Actions workflow
  - Automated testing on push
  - Linting and type checking
  - Build verification
  - Deployment preparation
- [ ] Create test documentation
  - Test plan
  - Test cases
  - Coverage reports
  - Performance benchmarks

### Deliverables
- Complete test suite
- CI/CD pipeline configured
- Test coverage reports
- Performance test results
- Bug fixes and optimizations

---

## Milestone 7: Deployment & Production Launch
**Duration:** 3-4 days  
**Status:** Not Started  
**Dependencies:** Milestone 6

### Objectives
Deploy all services to production and go live

### Tasks
- [ ] Deploy Salesboy Gateway to VPS
  - Transfer code to VPS
  - Install dependencies
  - Configure PM2
  - Set up Nginx reverse proxy
  - Configure SSL with Certbot
  - Test endpoints
  - Set up log rotation
- [ ] Deploy Next.js Core
  - Deploy to Vercel (or VPS)
  - Configure environment variables
  - Set up custom domain
  - Configure SSL
  - Test all routes
- [ ] Configure DNS
  - Point domains to servers
  - Set up subdomains
  - Verify SSL certificates
- [ ] Set up monitoring
  - Error tracking (Sentry/similar)
  - Uptime monitoring
  - Log aggregation
  - Performance monitoring
- [ ] Implement backup strategy
  - Database backups (Supabase)
  - File storage backups
  - Configuration backups
  - Backup restoration testing
- [ ] Security hardening
  - Firewall configuration
  - SSH key-only access
  - Fail2ban setup
  - Security audit
  - Penetration testing
- [ ] Create operational documentation
  - Deployment guide
  - Troubleshooting guide
  - Monitoring guide
  - Backup/restore procedures
  - Incident response plan
- [ ] User onboarding
  - User documentation
  - Video tutorials
  - FAQ
  - Support channels

### Deliverables
- Fully deployed production system
- All services running and monitored
- Complete operational documentation
- User documentation
- Backup and recovery procedures
- Security audit report
- Launch checklist completed

---

## Success Criteria

### Milestone 0
- ✅ All accounts and services provisioned
- ✅ VPS accessible and configured
- ✅ Project structure created

### Milestone 1
- ✅ Gateway can manage multiple WhatsApp sessions
- ✅ QR codes stream via SSE
- ✅ Messages forward to webhook with HMAC
- ✅ All tests passing

### Milestone 2
- ✅ All tables created with proper relationships
- ✅ RLS policies enforce security
- ✅ Storage buckets configured
- ✅ Migration runs without errors

### Milestone 3
- ✅ Webhook receives and processes messages
- ✅ RAG pipeline retrieves relevant context
- ✅ Intent classifier produces valid JSON
- ✅ Responses sent back via gateway
- ✅ All API routes functional

### Milestone 4
- ✅ Users can sign up and log in
- ✅ WhatsApp session starts and shows QR
- ✅ Documents upload and embed successfully
- ✅ All dashboard features work
- ✅ UI is responsive and polished

### Milestone 5
- ✅ n8n workflows receive and process tasks
- ✅ HMAC validation works
- ✅ Results return to core app
- ✅ All workflow types functional

### Milestone 6
- ✅ Test coverage >70%
- ✅ All integration tests pass
- ✅ CI/CD pipeline runs successfully
- ✅ No critical security issues
- ✅ Performance meets requirements

### Milestone 7
- ✅ All services deployed and accessible
- ✅ SSL certificates valid
- ✅ Monitoring and alerts configured
- ✅ Backups running automatically
- ✅ Documentation complete
- ✅ First user successfully onboarded

---

## Timeline Overview

| Milestone | Duration | Cumulative |
|-----------|----------|------------|
| M0: Infrastructure | 1-2 days | 2 days |
| M1: Gateway | 3-4 days | 6 days |
| M2: Database | 2-3 days | 9 days |
| M3: Core Backend | 5-6 days | 15 days |
| M4: Dashboard UI | 4-5 days | 20 days |
| M5: n8n Integration | 2-3 days | 23 days |
| M6: Testing & QA | 3-4 days | 27 days |
| M7: Deployment | 3-4 days | 31 days |

**Total Estimated Time:** 4-5 weeks

---

## Risk Management

### Technical Risks
- **WhatsApp session instability** - Mitigation: Implement auto-reconnect and session recovery
- **Rate limiting by WhatsApp** - Mitigation: Implement message queuing and throttling
- **LLM API failures** - Mitigation: Multi-provider fallback system
- **Vector search latency** - Mitigation: Optimize chunk size and implement caching

### Operational Risks
- **VPS downtime** - Mitigation: Monitoring, alerts, and quick recovery procedures
- **Cost overruns** - Mitigation: Set up billing alerts and usage monitoring
- **Security breaches** - Mitigation: Regular audits, HMAC validation, encryption

### Mitigation Strategies
- Comprehensive error handling and logging
- Automated backups and recovery procedures
- Load testing before production launch
- Gradual rollout with beta users
- 24/7 monitoring and alerting

---

## Next Steps

1. Review and approve this milestone plan
2. Set up project management board (GitHub Projects/Trello)
3. Begin Milestone 0: Infrastructure Preparation
4. Schedule regular progress reviews
5. Adjust timeline based on actual progress

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Planning Phase
