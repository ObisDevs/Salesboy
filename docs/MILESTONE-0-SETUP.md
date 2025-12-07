# Milestone 0: Infrastructure Setup

**Status:** In Progress  
**Location:** You are logged in as root at `/root/salesboy-gateway`

---

## Remaining Setup Tasks

### 1. Install Node.js 20
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node -v
```

### 2. Install PM2
```bash
npm install -g pm2
pm2 startup
pm2 -v
```

### 3. Install Nginx
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

### 4. Configure Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

### 5. Install SSL (Certbot)
```bash
apt install certbot python3-certbot-nginx -y
```

### 6. Install Git
```bash
apt install git -y
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 7. Install Chrome Dependencies
```bash
apt install build-essential -y
apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget chromium-browser
```

### 8. Setup Supabase
- Go to https://supabase.com
- Create new project
- Save these credentials:
  - Project URL
  - Anon Key
  - Service Role Key

### 9. Setup Pinecone
- Go to https://www.pinecone.io
- Create account and project
- Create index:
  - Name: `salesboy-vectors`
  - Dimensions: `768` (for Gemini embeddings) or `1536` (for OpenAI)
  - Metric: `cosine`
- Save API key

### 10. Setup n8n
- Go to https://n8n.io
- Create cloud account OR
- Self-host: `npx n8n` (run on separate port)
- Save webhook URL

### 11. Setup Redis (Vercel)
- Will be configured during Next.js deployment
- Or use Upstash: https://upstash.com

---

## Environment Variables Template

Create `.env.example` in project root:

```env
# Gateway Service
NODE_ENV=production
PORT=3001
API_SECRET_KEY=generate-random-secret-here
NEXT_WEBHOOK_URL=https://your-nextjs-app.vercel.app/api/webhook/whatsapp
HMAC_SECRET=generate-random-secret-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=salesboy-vectors

# LLM Providers
GEMINI_API_KEY=your-gemini-api-key
MISTRAL_API_KEY=your-mistral-api-key
OPENAI_API_KEY=your-openai-api-key

# n8n
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# Redis (Optional)
REDIS_URL=your-redis-url
```

---

## Checklist

- [ ] Node.js 20 installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Firewall configured
- [ ] Certbot installed
- [ ] Git installed
- [ ] Chrome dependencies installed
- [ ] Supabase project created
- [ ] Pinecone index created
- [ ] n8n instance ready
- [ ] Environment variables documented

---

## Next Steps

Once all tasks are complete:
1. Mark Milestone 0 as complete
2. Begin Milestone 1: Salesboy Gateway development
3. Initialize Node.js project in `/root/salesboy-gateway`
