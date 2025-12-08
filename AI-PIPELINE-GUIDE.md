# Salesboy AI Pipeline Guide

## Overview

The Salesboy AI pipeline is a complete RAG (Retrieval-Augmented Generation) agent with intent classification and task routing to n8n workflows.

## Architecture

```
WhatsApp Message
    ↓
Gateway (web-whatsapp.js)
    ↓
Webhook Handler (/api/webhook/whatsapp)
    ↓
Intent Classification (AI)
    ↓
┌─────────────┬──────────────┬─────────────────┐
│  Response   │    Task      │  HumanHandoff   │
└─────────────┴──────────────┴─────────────────┘
      ↓              ↓                ↓
  RAG Pipeline   n8n Workflow    n8n Handoff
      ↓              ↓                ↓
  AI Response    Task Execution   Team Notification
      ↓              ↓                ↓
  Send to User   Acknowledge      Acknowledge
```

## Components

### 1. Intent Classification

**File:** `lib/intent-classifier.ts`

Classifies incoming messages into three categories:

#### Response Intent
- General questions
- Product inquiries
- Price checks
- Business information
- Greetings

**Example:** "How much is iPhone 14?"

#### Task Intent
- Actionable requests requiring external systems
- Task types:
  - `create_order`: Purchase requests
  - `book_calendar`: Appointment scheduling
  - `send_email`: Email requests
  - `human_handoff`: Complex issues

**Example:** "I want to buy 2 iPhone 14 Pro"

#### HumanHandoff Intent
- Complaints
- Refund requests
- Complex/unclear requests
- Issues requiring human intervention

**Example:** "I want a refund, this is not working"

### 2. RAG Pipeline

**File:** `lib/rag-pipeline.ts`

Handles Response intents using:

1. **Query Embedding**: Convert user message to vector
2. **Vector Search**: Find relevant chunks in Pinecone
3. **Context Retrieval**: Get top K relevant documents
4. **Response Generation**: Use LLM with context to generate answer

**Features:**
- Pinecone vector search
- Multi-provider LLM (Gemini → Mistral → OpenAI)
- Custom system prompts per user
- Nigerian business context

### 3. Task Routing

**File:** `lib/n8n-client.ts`

Routes Task intents to n8n workflows:

1. **Task Forwarding**: Send to n8n webhook
2. **HMAC Signing**: Secure webhook with signature
3. **Acknowledgment**: Immediate response to user
4. **Async Execution**: n8n processes in background

**Workflow Endpoints:**
- `/webhook/create_order`
- `/webhook/book_calendar`
- `/webhook/send_email`
- `/webhook/human_handoff`

## Configuration

### Environment Variables

```bash
# Core App
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=salesboy-vectors
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
N8N_WEBHOOK_URL=https://n8n.srv892192.hstgr.cloud
HMAC_SECRET=your_hmac_secret

# Gateway
GATEWAY_URL=http://srv892192.hstgr.cloud:3001
API_SECRET_KEY=your_api_secret
```

### Bot Configuration

Configure via dashboard at `/dashboard/bot-config`:

- **System Prompt**: Define AI personality and behavior
- **Temperature**: 0.0 (focused) to 1.0 (creative)
- **Model**: gemini-pro, gpt-4, gpt-3.5-turbo
- **Max Tokens**: Response length limit

## Usage

### 1. Upload Knowledge Base

```bash
# Via Dashboard
1. Go to /dashboard/kb
2. Upload documents (PDF, TXT, DOCX)
3. System automatically:
   - Extracts text
   - Chunks content
   - Generates embeddings
   - Stores in Pinecone
```

### 2. Start WhatsApp Session

```bash
# Via Dashboard
1. Go to /dashboard/sessions
2. Click "Start Session"
3. Scan QR code
4. Session active!
```

### 3. Test AI Responses

```bash
# Send WhatsApp message
"What products do you have?"

# AI will:
1. Classify as Response intent
2. Search knowledge base
3. Generate contextual answer
4. Send via WhatsApp
```

### 4. Test Task Execution

```bash
# Send WhatsApp message
"I want to buy 2 iPhone 14 Pro"

# AI will:
1. Classify as Task intent (create_order)
2. Extract: product="iPhone 14 Pro", quantity=2
3. Forward to n8n /webhook/create_order
4. Send acknowledgment: "Got it! I'm processing your order..."
5. n8n executes order creation
6. (Optional) n8n sends completion notification
```

## Testing

### Run Test Script

```bash
cd salesboy-core
node test-ai-pipeline.js
```

Tests:
- ✅ Product inquiry (Response)
- ✅ Price check (Response)
- ✅ Order placement (Task: create_order)
- ✅ Meeting booking (Task: book_calendar)
- ✅ Email request (Task: send_email)
- ✅ Complaint (HumanHandoff)
- ✅ Greeting (Response)

### Manual Testing

```bash
# Test webhook directly
curl -X POST https://salesboy-lilac.vercel.app/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256=YOUR_HMAC" \
  -d '{
    "from": "2349058653283@c.us",
    "message": "How much is iPhone 14?",
    "user_id": "current-user"
  }'
```

## n8n Integration

### Setup Workflows

1. **Import Templates**
   ```bash
   # In n8n dashboard
   - Import n8n-workflows/create_order_template.json
   - Import other workflow templates
   ```

2. **Configure Webhooks**
   - Each workflow has webhook trigger
   - URL: `https://n8n.srv892192.hstgr.cloud/webhook/{task_type}`
   - Method: POST
   - Authentication: HMAC signature

3. **Customize Actions**
   - Add your database connections
   - Configure email/SMS services
   - Set up calendar integrations
   - Add notification channels

### Workflow Structure

```javascript
// 1. Webhook Trigger
// Receives task from Salesboy AI

// 2. Validate HMAC (optional but recommended)
const crypto = require('crypto');
const signature = $node["Webhook"].json["headers"]["x-signature"];
// Validate signature...

// 3. Extract Data
const payload = $node["Webhook"].json.payload;
const userId = $node["Webhook"].json.user_id;

// 4. Execute Action
// Your custom logic here:
// - Create order in database
// - Send email
// - Book calendar
// - Notify team

// 5. Return Response
return {
  success: true,
  message: "Task completed",
  data: { /* result */ }
};
```

## Monitoring

### Logs

```bash
# Check webhook logs
tail -f /var/log/salesboy/webhook.log

# Check n8n execution logs
# In n8n dashboard → Executions
```

### Database

```sql
-- Check chat logs
SELECT * FROM chat_logs 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY timestamp DESC 
LIMIT 10;

-- Check by intent
SELECT 
  direction,
  message_body,
  metadata->>'intent' as intent,
  metadata->>'task_type' as task_type
FROM chat_logs
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY timestamp DESC;
```

## Troubleshooting

### AI Not Responding

1. Check WhatsApp session status
2. Verify Pinecone connection
3. Check LLM API keys
4. Review webhook logs

### Tasks Not Executing

1. Verify n8n is running
2. Check n8n webhook URLs
3. Validate HMAC secret matches
4. Review n8n execution logs

### Wrong Intent Classification

1. Review intent classifier prompt
2. Adjust confidence thresholds
3. Add more examples to prompt
4. Check LLM model settings

## Best Practices

1. **Knowledge Base**
   - Upload comprehensive product info
   - Include FAQs
   - Update regularly
   - Use clear, structured content

2. **System Prompts**
   - Be specific about business context
   - Define tone and personality
   - Include response guidelines
   - Set boundaries

3. **Task Payloads**
   - Extract all relevant data
   - Validate before forwarding
   - Include original message for context
   - Add timestamps

4. **Error Handling**
   - Always acknowledge user
   - Provide fallback responses
   - Log errors for debugging
   - Escalate to human when needed

## Next Steps

1. ✅ Upload knowledge base documents
2. ✅ Configure bot settings
3. ✅ Test AI responses
4. ⏳ Set up n8n workflows
5. ⏳ Configure task integrations
6. ⏳ Test end-to-end flow
7. ⏳ Monitor and optimize

## Support

For issues:
- Check logs in `/workspaces/Salesboy/salesboy-core`
- Review n8n execution history
- Test with `test-ai-pipeline.js`
- Check Supabase logs
- Verify all environment variables
