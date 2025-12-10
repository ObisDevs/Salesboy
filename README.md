# Salesboy AI

**Enterprise-grade WhatsApp AI Automation Platform for Nigerian Businesses**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

## 🎯 Overview

Salesboy AI is a production-ready, scalable WhatsApp automation platform that leverages advanced AI technologies including Retrieval-Augmented Generation (RAG), intent classification, and multi-provider LLM support to automate customer communications for small and medium businesses.

**Live Application:** [https://salesboy-lilac.vercel.app/](https://salesboy-lilac.vercel.app/)

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   WhatsApp      │─────▶│  Gateway Service │─────▶│  Core Backend   │
│   Business API  │      │  (Node.js/WA-JS) │      │  (Next.js 14)   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                             │
                         ┌───────────────────────────────────┼───────────────────┐
                         │                                   │                   │
                    ┌────▼─────┐                    ┌────────▼────────┐   ┌─────▼──────┐
                    │ Supabase │                    │    Pinecone     │   │  n8n       │
                    │ Postgres │                    │  Vector Store   │   │ Workflows  │
                    └──────────┘                    └─────────────────┘   └────────────┘
```

### Core Components

1. **Salesboy Core** (`/salesboy-core`)
   - Next.js 14 application with App Router
   - RESTful API endpoints for all business logic
   - Server-side rendering and static generation
   - Middleware for authentication and rate limiting

2. **Salesboy Gateway** (`/salesboy-gateway`)
   - Standalone Node.js service
   - WhatsApp Web.js integration
   - QR code generation and session management
   - Message queue handling

3. **Database Layer** (Supabase PostgreSQL)
   - Row-Level Security (RLS) policies
   - Real-time subscriptions
   - Automated backups and point-in-time recovery

4. **Vector Store** (Pinecone)
   - Semantic search capabilities
   - Document embeddings storage
   - Fast similarity search

## 🚀 Technology Stack

### Frontend
- **Framework:** Next.js 14.2.0 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** CSS Modules + Tailwind CSS
- **UI Components:** Custom React components
- **Icons:** React Icons

### Backend
- **Runtime:** Node.js 18+
- **API:** Next.js API Routes (Edge & Node runtime)
- **Authentication:** Supabase Auth (JWT-based)
- **Session Management:** Server-side sessions with encryption

### Database & Storage
- **Primary Database:** Supabase (PostgreSQL 15)
- **Vector Database:** Pinecone (1536-dimensional embeddings)
- **File Storage:** Supabase Storage
- **Caching:** In-memory + Redis (optional)

### AI/ML Stack
- **LLM Providers:** 
  - OpenAI GPT-4/GPT-3.5
  - Anthropic Claude
  - Google Gemini
- **Embeddings:** OpenAI text-embedding-3-small
- **RAG Framework:** Custom implementation with Pinecone
- **Intent Classification:** Zod schema validation + LLM

### Infrastructure
- **Hosting:** Vercel (Core) + VPS (Gateway)
- **CI/CD:** GitHub Actions + Vercel Auto-deploy
- **Monitoring:** Built-in logging system
- **Payment:** Paystack integration

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 15+ (or Supabase account)
- Pinecone account
- OpenAI API key
- WhatsApp Business API access
- Paystack account (for payments)

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/ObisDevs/Salesboy.git
cd Salesboy
```

### 2. Install Dependencies

```bash
# Core Backend
cd salesboy-core
npm install

# Gateway Service
cd ../salesboy-gateway
npm install
```

### 3. Environment Configuration

#### Core Backend (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=salesboy-kb

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Gateway
GATEWAY_URL=http://localhost:3001
GATEWAY_SECRET=your_gateway_secret

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Security
ENCRYPTION_KEY=your_32_char_encryption_key
HMAC_SECRET=your_hmac_secret_key

# App
NEXT_PUBLIC_APP_URL=https://salesboy-lilac.vercel.app
```

#### Gateway Service (`.env`)

```env
PORT=3001
CORE_BACKEND_URL=https://salesboy-lilac.vercel.app
GATEWAY_SECRET=your_gateway_secret
HMAC_SECRET=your_hmac_secret_key
SESSION_DIR=./sessions
```

### 4. Database Setup

```bash
# Run migrations
cd salesboy-core
npx supabase db push

# Or manually execute SQL files in library/sql/
```

### 5. Start Services

```bash
# Terminal 1: Core Backend
cd salesboy-core
npm run dev

# Terminal 2: Gateway Service
cd salesboy-gateway
npm start
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (handled by Supabase)
- `POST /api/auth/password` - Password reset
- `GET /api/auth/session` - Get current session

### WhatsApp Session Management

- `POST /api/sessions/start` - Initialize WhatsApp session
- `POST /api/sessions/stop` - Terminate session
- `GET /api/sessions/status` - Check session status
- `GET /api/sessions/qr` - Get QR code for authentication

### Knowledge Base

- `POST /api/kb/upload` - Upload document
- `POST /api/kb/process` - Process uploaded document
- `POST /api/kb/embed` - Generate embeddings
- `GET /api/kb/list` - List all documents
- `DELETE /api/kb/delete` - Delete document

### Product Catalog

- `POST /api/products/create` - Create product
- `GET /api/products/list` - List products
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Webhook

- `POST /api/webhook/whatsapp` - WhatsApp message webhook (HMAC validated)

## 🔐 Security Features

1. **Authentication & Authorization**
   - JWT-based authentication via Supabase
   - Row-Level Security (RLS) policies
   - Session validation middleware

2. **Data Protection**
   - AES-256 encryption for sensitive data
   - HMAC signature verification for webhooks
   - Environment variable isolation

3. **Rate Limiting**
   - API endpoint rate limiting
   - Per-user request throttling
   - DDoS protection via Vercel

4. **Input Validation**
   - Zod schema validation
   - SQL injection prevention
   - XSS protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📦 Deployment

### Vercel (Core Backend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd salesboy-core
vercel --prod
```

### VPS (Gateway Service)

```bash
# SSH to VPS
ssh user@your-vps-ip

# Clone and setup
git clone https://github.com/ObisDevs/Salesboy.git
cd Salesboy/salesboy-gateway
npm install
npm install -g pm2

# Start with PM2
pm2 start npm --name "salesboy-gateway" -- start
pm2 save
pm2 startup
```

## 🔄 Domain Migration Guide

When migrating from `https://salesboy-lilac.vercel.app/` to your custom domain:

### 1. Update Environment Variables

**Core Backend:**
```env
NEXT_PUBLIC_APP_URL=https://your-new-domain.com
```

**Gateway Service:**
```env
CORE_BACKEND_URL=https://your-new-domain.com
```

### 2. Update Vercel Project Settings

```bash
# Add custom domain in Vercel dashboard
# Settings → Domains → Add Domain

# Or via CLI
vercel domains add your-new-domain.com
```

### 3. Update DNS Records

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Add `https://your-new-domain.com/**` to allowed redirect URLs
- Update site URL to `https://your-new-domain.com`

### 5. Update Paystack Webhook URL

In Paystack Dashboard → Settings → Webhooks:
- Update webhook URL to `https://your-new-domain.com/api/payment/verify`

### 6. Update WhatsApp Business API

Update webhook URL in WhatsApp Business API configuration:
```
https://your-new-domain.com/api/webhook/whatsapp
```

### 7. Redeploy Services

```bash
# Core
cd salesboy-core
vercel --prod

# Gateway (restart)
pm2 restart salesboy-gateway
```

### 8. SSL Certificate

Vercel automatically provisions SSL certificates. Verify:
```bash
curl -I https://your-new-domain.com
```

## 📊 Project Structure

```
Salesboy/
├── salesboy-core/              # Next.js core application
│   ├── app/                    # App router pages
│   │   ├── api/               # API routes
│   │   ├── components/        # React components
│   │   ├── dashboard/         # Dashboard pages
│   │   └── lib/               # Utility libraries
│   ├── public/                # Static assets
│   ├── supabase/              # Database migrations
│   └── middleware.ts          # Next.js middleware
│
├── salesboy-gateway/          # WhatsApp gateway service
│   ├── src/                   # Source code
│   ├── sessions/              # WhatsApp sessions
│   └── server.js              # Express server
│
├── library/                   # Documentation & scripts
│   ├── docs/                  # Project documentation
│   ├── sql/                   # Database scripts
│   └── scripts/               # Utility scripts
│
└── n8n-workflows/             # Automation workflows
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **ObisDevs** - *Initial work* - [@obisdev](https://x.com/obisdev)

## 🙏 Acknowledgments

- WhatsApp Web.js community
- Supabase team
- Vercel platform
- OpenAI API

## 📞 Support

- **Email:** obisdev@gmail.com
- **Discord:** [Join our Discord](https://discord.gg/5N7tdxe6)
- **Twitter:** [@obisdev](https://x.com/obisdev)

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Voice message handling
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] WhatsApp Business API integration
- [ ] Multi-tenant architecture
- [ ] Advanced workflow builder

---

**Built with ❤️ for Nigerian businesses**
