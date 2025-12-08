# Scaling Salesboy AI to 100+ Users

## Current Capacity

### What Can Handle 100+ Users NOW
- ✅ **Vercel (Core Backend)**: Unlimited scaling
- ✅ **Supabase**: 500MB DB, handles 100+ users easily
- ✅ **Pinecone**: 100K vectors (enough for 100 users)
- ✅ **LLM APIs**: Pay-per-use, auto-scales

### Bottleneck: WhatsApp Gateway
- ❌ **Single VPS**: Can handle ~5-10 sessions safely
- ❌ **Memory**: 100MB+ per WhatsApp session
- ❌ **100 sessions**: Requires ~10GB RAM + CPU

## Scaling Options

### Option 1: Multi-VPS Gateway (Recommended for Now)

**Architecture:**
```
                Load Balancer
                      ↓
    ┌─────────────┬──────────────┬─────────────┐
    │   VPS 1     │    VPS 2     │    VPS 3    │
    │ 30 sessions │  30 sessions │ 40 sessions │
    │ 4GB RAM     │  4GB RAM     │  4GB RAM    │
    └─────────────┴──────────────┴─────────────┘
                      ↓
            Core Backend (Vercel)
                      ↓
              Supabase + Pinecone
```

**Implementation Steps:**

1. **Add Session Routing to Core**
   ```typescript
   // lib/gateway-router.ts
   const GATEWAY_INSTANCES = [
     'http://vps1.example.com:3001',
     'http://vps2.example.com:3001',
     'http://vps3.example.com:3001'
   ]
   
   function getGatewayForUser(userId: string): string {
     const hash = hashUserId(userId)
     const index = hash % GATEWAY_INSTANCES.length
     return GATEWAY_INSTANCES[index]
   }
   ```

2. **Deploy Gateway to Multiple VPS**
   ```bash
   # On each VPS
   cd salesboy-gateway
   npm install
   pm2 start ecosystem.config.cjs
   ```

3. **Update Core to Route Requests**
   ```typescript
   // Use getGatewayForUser() instead of hardcoded GATEWAY_URL
   const gatewayUrl = getGatewayForUser(userId)
   await fetch(`${gatewayUrl}/session/start`, ...)
   ```

**Pros:**
- ✅ Can scale to 100+ users
- ✅ Relatively cheap (~$30-50/month)
- ✅ No code changes to gateway
- ✅ Gradual scaling (add VPS as needed)

**Cons:**
- ❌ Manual VPS management
- ❌ Need load balancer or routing logic
- ❌ Session persistence across restarts

**Cost Estimate:**
- 3-5 VPS @ $10/month = $30-50/month
- Total: ~$50-70/month (including other services)

---

### Option 2: WhatsApp Business Cloud API (Best for 100+)

**Architecture:**
```
WhatsApp Business API (Meta)
            ↓
    Core Backend (Vercel)
            ↓
    Supabase + Pinecone
```

**Benefits:**
- ✅ Official API, fully supported
- ✅ Unlimited scaling
- ✅ No session management
- ✅ No VPS needed
- ✅ Better reliability
- ✅ Advanced features (templates, buttons)

**Drawbacks:**
- ❌ Requires business verification (1-2 weeks)
- ❌ Pay per message (~$0.005-0.01)
- ❌ Template approval process
- ❌ More complex setup

**Cost Estimate:**
- Setup: Free
- Per message: $0.005-0.01
- 100 users × 50 messages/month = 5,000 messages
- Cost: ~$25-50/month + Vercel/Supabase

**Migration Effort:** Medium (2-3 days)

---

### Option 3: Hybrid Approach (Recommended Path)

**Phase 1: Now - 10 Users (Current Setup)**
```
Single VPS → Core Backend
```
- ✅ Works now
- Monitor: CPU, RAM, session count
- Optimize: Session cleanup, memory leaks

**Phase 2: 10-50 Users (Add 2nd VPS)**
```
VPS 1 (25 users) + VPS 2 (25 users) → Core Backend
```
- Add session routing
- Implement Redis for session state
- Cost: +$10/month

**Phase 3: 50-100 Users (Multi-VPS)**
```
VPS 1-4 (25 users each) → Core Backend
```
- Add load balancer
- Implement health checks
- Auto-scaling logic
- Cost: +$30-40/month

**Phase 4: 100+ Users (Migrate to Business API)**
```
WhatsApp Business API → Core Backend
```
- No VPS needed
- Unlimited scaling
- Better reliability

---

## Immediate Actions for Scaling

### 1. Add Resource Monitoring

```typescript
// salesboy-gateway/src/utils/monitor.ts
export function getSystemStats() {
  const used = process.memoryUsage()
  return {
    memory: {
      rss: Math.round(used.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB'
    },
    uptime: process.uptime(),
    activeSessions: sessionManager.getActiveCount()
  }
}

// Add endpoint
app.get('/health', (req, res) => {
  res.json(getSystemStats())
})
```

### 2. Implement Session Limits

```typescript
// salesboy-gateway/src/lib/session-manager.js
const MAX_SESSIONS = process.env.MAX_SESSIONS || 10

async function startSession(userId) {
  if (activeSessions.size >= MAX_SESSIONS) {
    throw new Error('Maximum sessions reached')
  }
  // ... rest of code
}
```

### 3. Add Session Cleanup

```typescript
// Auto-cleanup inactive sessions
setInterval(() => {
  for (const [userId, session] of activeSessions) {
    if (session.lastActivity < Date.now() - 24 * 60 * 60 * 1000) {
      console.log(`Cleaning up inactive session: ${userId}`)
      session.client.destroy()
      activeSessions.delete(userId)
    }
  }
}, 60 * 60 * 1000) // Every hour
```

### 4. Optimize Memory Usage

```typescript
// Reduce WhatsApp client cache
const client = new Client({
  authStrategy: new LocalAuth({ clientId: userId }),
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
})
```

---

## Database Scaling

### Supabase Limits (Free Tier)
- ✅ 500MB database (enough for 100 users)
- ✅ 1GB file storage
- ✅ 50K monthly active users
- ✅ Unlimited API requests

### When to Upgrade
- Database > 400MB: Upgrade to Pro ($25/month)
- Storage > 800MB: Upgrade storage
- Need more connections: Pro tier has more

### Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_chat_logs_user_timestamp 
ON chat_logs(user_id, timestamp DESC);

CREATE INDEX idx_knowledge_base_user 
ON knowledge_base(user_id) WHERE status = 'embedded';

-- Cleanup old logs (optional)
DELETE FROM chat_logs 
WHERE timestamp < NOW() - INTERVAL '90 days';
```

---

## Pinecone Scaling

### Free Tier Limits
- ✅ 1 index
- ✅ 100K vectors
- ✅ 1 pod

### Capacity Calculation
- Average: 50 documents per user
- Average: 20 chunks per document
- Total: 1,000 vectors per user
- **100 users = 100K vectors** (at limit!)

### When to Upgrade
- > 80 users: Upgrade to Starter ($70/month)
- Need faster queries: Add more pods
- Need more indexes: Upgrade tier

### Optimization
```typescript
// Use namespaces efficiently
const namespace = `user_${userId}`

// Cleanup old embeddings
await pinecone.delete({
  namespace,
  filter: { created_at: { $lt: oldDate } }
})
```

---

## LLM API Scaling

### Rate Limits
- **Gemini**: 60 requests/minute (free)
- **OpenAI**: 3,500 requests/minute (paid)

### Cost Estimate (100 users)
- Average: 50 messages/user/month = 5,000 messages
- Gemini: ~$0.001/message = $5/month
- OpenAI (fallback): ~$0.01/message = $50/month
- **Total: ~$10-20/month** (mostly Gemini)

### Optimization
```typescript
// Cache common responses
const cache = new Map()

async function generateResponse(prompt, systemPrompt) {
  const cacheKey = hash(prompt + systemPrompt)
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const response = await llm.generate(prompt, systemPrompt)
  cache.set(cacheKey, response)
  return response
}
```

---

## Cost Breakdown (100 Users)

### Current Setup (Single VPS)
- VPS: $10/month
- Supabase: Free
- Pinecone: Free (at limit!)
- LLM APIs: ~$10-20/month
- **Total: ~$20-30/month**
- **Capacity: 5-10 users max**

### Multi-VPS Setup (100 Users)
- VPS (4x): $40/month
- Supabase Pro: $25/month
- Pinecone Starter: $70/month
- LLM APIs: ~$20/month
- **Total: ~$155/month**
- **Capacity: 100 users**

### WhatsApp Business API (100 Users)
- WhatsApp: ~$25-50/month
- Supabase Pro: $25/month
- Pinecone Starter: $70/month
- LLM APIs: ~$20/month
- **Total: ~$140-165/month**
- **Capacity: Unlimited**

---

## Recommended Path

### For 1-10 Users (Now)
✅ Use current setup
✅ Add monitoring
✅ Optimize memory

### For 10-50 Users (Next Month)
1. Add 2nd VPS
2. Implement session routing
3. Upgrade Pinecone if needed

### For 50-100 Users (2-3 Months)
1. Add 2-3 more VPS instances
2. Implement load balancer
3. Upgrade Supabase to Pro
4. Consider Business API migration

### For 100+ Users (Long Term)
1. Migrate to WhatsApp Business API
2. Remove VPS dependency
3. Focus on feature development

---

## Monitoring & Alerts

### Key Metrics to Track
- Gateway: CPU, RAM, active sessions
- Database: Size, query time, connections
- Pinecone: Vector count, query latency
- LLM: Request count, cost, errors

### Tools
- **Vercel**: Built-in analytics
- **Supabase**: Dashboard metrics
- **Pinecone**: Dashboard metrics
- **Custom**: Add `/health` endpoints

### Alerts
- Gateway RAM > 80%: Add VPS
- Database > 400MB: Upgrade tier
- Pinecone > 80K vectors: Upgrade tier
- Error rate > 5%: Investigate

---

## Summary

**Can you scale to 100 users?**
✅ YES, but requires:
1. Multi-VPS gateway setup (~$40/month)
2. Pinecone upgrade (~$70/month)
3. Possibly Supabase Pro (~$25/month)

**Total cost: ~$155/month for 100 users**

**Recommended approach:**
1. Start with current setup (1-10 users)
2. Add VPS as you grow (10-50 users)
3. Migrate to Business API (100+ users)

**Next steps:**
1. Add monitoring to current VPS
2. Test with 5-10 users first
3. Scale gradually based on metrics
