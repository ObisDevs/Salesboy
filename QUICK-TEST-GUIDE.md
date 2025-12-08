# Quick Test Guide - Salesboy AI

## Test the AI Pipeline NOW (Without n8n)

The AI is fully functional and ready to test! n8n is optional for now.

### What Works Right Now:

✅ **AI Responses** - Questions, product inquiries, greetings
✅ **RAG Pipeline** - Knowledge base retrieval + AI generation
✅ **Intent Classification** - Automatically detects Response/Task/HumanHandoff
✅ **Task Acknowledgment** - Confirms task processing (even without n8n)
✅ **WhatsApp Integration** - Full send/receive

### Quick Test Steps:

#### 1. Start WhatsApp Session

```bash
# Go to dashboard
https://salesboy-lilac.vercel.app/dashboard/sessions

# Click "Start Session"
# Scan QR code with your WhatsApp
# Wait for "Connected" status
```

#### 2. Upload Knowledge Base (Optional)

```bash
# Go to KB page
https://salesboy-lilac.vercel.app/dashboard/kb

# Upload a document with product info
# Example content:
"""
Products:
- iPhone 14 Pro: ₦850,000
- iPhone 14: ₦750,000
- Samsung S23: ₦650,000

Business Hours: Mon-Sat 9AM-6PM
Location: Lagos, Nigeria
"""
```

#### 3. Test AI Responses

Send these messages from WhatsApp:

**Test 1: Simple Question**
```
You: What products do you have?
AI: [Lists products from knowledge base or general response]
```

**Test 2: Price Check**
```
You: How much is iPhone 14?
AI: [Provides price if in knowledge base]
```

**Test 3: Greeting**
```
You: Hello, good morning!
AI: [Friendly greeting response]
```

**Test 4: Order (Task Intent)**
```
You: I want to buy 2 iPhone 14 Pro
AI: Got it! I'm processing your order. You'll get a confirmation shortly.
```
*Note: Task is acknowledged but won't execute until n8n is configured*

**Test 5: Booking (Task Intent)**
```
You: Can I schedule a meeting tomorrow at 2pm?
AI: Perfect! I'm scheduling that for you now. I'll send you the details in a moment.
```

**Test 6: Complaint (HumanHandoff)**
```
You: I want a refund, this is not working
AI: I've notified our team about your request. Someone will get back to you shortly.
```

### Alternative: Test via Script

```bash
cd salesboy-core
node test-ai-pipeline.js
```

This runs 7 automated tests covering all intent types.

### Check Logs

**Dashboard Logs:**
```
https://salesboy-lilac.vercel.app/dashboard/logs
```

**Supabase Logs:**
```sql
SELECT 
  direction,
  message_body,
  metadata->>'intent' as intent,
  metadata->>'task_type' as task_type,
  timestamp
FROM chat_logs
ORDER BY timestamp DESC
LIMIT 20;
```

### Expected Behavior:

| Message Type | Intent | AI Action |
|-------------|--------|-----------|
| "What products?" | Response | RAG search + AI answer |
| "How much is X?" | Response | RAG search + AI answer |
| "I want to buy X" | Task: create_order | Acknowledge + forward to n8n |
| "Schedule meeting" | Task: book_calendar | Acknowledge + forward to n8n |
| "Send me email" | Task: send_email | Acknowledge + forward to n8n |
| "I want refund" | HumanHandoff | Acknowledge + notify team |

### Troubleshooting:

**AI not responding?**
1. Check session status: `/dashboard/sessions`
2. Verify Vercel deployment is live
3. Check environment variables in Vercel
4. Review logs in Vercel dashboard

**Wrong responses?**
1. Upload better knowledge base content
2. Adjust bot config: `/dashboard/bot-config`
3. Modify system prompt
4. Check intent classification in logs

**Tasks not working?**
Tasks will be acknowledged but won't execute until n8n workflows are set up. This is expected!

### Next Steps:

1. ✅ Test AI responses (do this now!)
2. ✅ Upload knowledge base documents
3. ✅ Adjust bot configuration
4. ⏳ Set up n8n workflows (optional, for task execution)
5. ⏳ Configure task integrations (email, calendar, etc.)

### Performance Tips:

- **Response Time**: 2-5 seconds typical
- **Knowledge Base**: Upload 5-10 documents for best results
- **System Prompt**: Be specific about your business
- **Temperature**: 0.7 for balanced responses

### What Happens Without n8n:

- ✅ AI still responds to questions
- ✅ Tasks are classified correctly
- ✅ User gets acknowledgment
- ❌ Tasks don't execute (no email sent, no order created)
- ✅ Everything logged for later processing

You can use the system fully for Q&A and information, then add n8n later for task automation!

## Ready to Test?

1. Go to: https://salesboy-lilac.vercel.app/dashboard/sessions
2. Start session and scan QR
3. Send a WhatsApp message
4. Watch the magic happen! ✨
