# Test WhatsApp Message Flow

**Goal**: Verify end-to-end message processing and AI response

---

## Prerequisites

1. ✅ WhatsApp session connected (scan QR code)
2. ✅ Knowledge base file uploaded and embedded
3. ✅ Bot config set with system prompt
4. ✅ Test phone number NOT in whitelist

---

## Test Steps

### 1. Verify Session is Connected

**Dashboard → Sessions**
- Status should show "Connected" with green indicator
- If not connected, click "Start Session" and scan QR

### 2. Check Bot Configuration

**Dashboard → Bot Config**
- Verify system prompt is set
- Note the model being used (Mistral/Groq)
- Temperature should be 0.7

### 3. Send Test Message

**From your phone, send to the connected WhatsApp:**

```
Hello, can you help me?
```

### 4. Monitor Logs

**Check Gateway Logs (VPS):**
```bash
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 50"
```

**Expected:**
```
info: Message received from 234XXXXXXXXX@c.us: Hello, can you help me?
info: Message forwarded to webhook: 200
```

**Check Vercel Logs:**
- Go to https://vercel.com/dashboard
- Click on your project
- Go to "Logs" tab
- Filter by "Functions"

**Expected:**
```
📨 Webhook received: { from: '234XXXXXXXXX@c.us', message: 'Hello, can you help me?' }
📊 Message count: X, Has history: false/true
💬 Generating AI response...
✅ AI response generated
✅ Response sent successfully
```

### 5. Verify Response Received

**On your phone:**
- You should receive an AI response within 5 seconds
- Response should be relevant and professional
- Should use your bot's system prompt personality

---

## Test Scenarios

### Scenario 1: First Message (No History)
**Send:** `Hi`

**Expected:**
- Bot responds with greeting
- Asks how it can help
- No intent classification (first message)

### Scenario 2: Question (With KB Context)
**Send:** `What services do you offer?`

**Expected:**
- Bot retrieves context from knowledge base
- Response includes information from uploaded documents
- Professional and helpful tone

### Scenario 3: Action Request
**Send:** `Can you email me the details?`

**Expected:**
- Intent classified as "Task: send_email"
- Bot acknowledges: "I'm processing your email request..."
- Task forwarded to n8n (if configured)

### Scenario 4: Newsletter/Broadcast (Should Ignore)
**From a broadcast channel:**

**Expected:**
- No response sent
- Logs show: "🚫 Ignoring newsletter/broadcast message"

### Scenario 5: Whitelisted Number (Should Ignore)
**Add your number to whitelist, then send message**

**Expected:**
- No response sent
- Logs show: "🚫 Message from whitelisted number (ignored)"

---

## Verification Checklist

### Gateway (VPS)
- [ ] Message received logged
- [ ] Message forwarded to webhook (200 status)
- [ ] No errors in PM2 logs

### Core (Vercel)
- [ ] Webhook received
- [ ] User authenticated
- [ ] Whitelist checked
- [ ] Intent classified (if applicable)
- [ ] RAG context retrieved (if KB exists)
- [ ] AI response generated
- [ ] Response sent to gateway
- [ ] Chat log saved to database

### Database (Supabase)
- [ ] Incoming message logged in `chat_logs`
- [ ] Outgoing message logged in `chat_logs`
- [ ] Both messages have correct `user_id`
- [ ] Direction field correct (incoming/outgoing)

### User Experience
- [ ] Response received within 5 seconds
- [ ] Response is relevant and helpful
- [ ] Response uses bot's personality
- [ ] Response includes KB context (if relevant)

---

## Troubleshooting

### No Response Received

**Check 1: Gateway Logs**
```bash
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 50"
```
- Look for "Message received"
- Look for "Message forwarded to webhook"
- Check for errors

**Check 2: Vercel Logs**
- Go to Vercel dashboard → Logs
- Look for webhook received
- Check for errors

**Check 3: Whitelist**
- Dashboard → Whitelist
- Verify your number is NOT in the list
- If it is, remove it

**Check 4: Session Status**
- Dashboard → Sessions
- Verify status is "Connected"
- If not, restart session

### Response is Generic (No KB Context)

**Check 1: KB Status**
- Dashboard → Knowledge Base
- Verify file status is "embedded"
- If not, click "Embed" button

**Check 2: Pinecone**
- Go to Pinecone dashboard
- Check namespace `user_{your_userId}`
- Verify vectors exist

**Check 3: Logs**
- Check Vercel logs for:
  - "Retrieving context for query"
  - "Pinecone results: X matches"
  - If 0 matches, KB is empty or query doesn't match

### Response is Slow (>10 seconds)

**Check 1: LLM Provider**
- Check Vercel logs for:
  - "Trying Mistral..."
  - "Trying Groq..."
- If both fail, check API keys

**Check 2: VPS Performance**
```bash
ssh root@srv892192.hstgr.cloud "top -bn1 | head -10"
```
- CPU should be < 50%
- If high, check for runaway processes

---

## Expected Performance

| Metric | Target | Acceptable |
|--------|--------|------------|
| Gateway → Core | < 500ms | < 1s |
| Core Processing | < 2s | < 5s |
| AI Response | < 3s | < 8s |
| Total Time | < 5s | < 10s |

---

## Success Criteria

✅ **Pass if:**
1. Message received on WhatsApp
2. AI response sent within 10 seconds
3. Response is relevant and helpful
4. Logs show no errors
5. Chat logs saved to database

❌ **Fail if:**
1. No response received after 30 seconds
2. Error in gateway or core logs
3. Response is generic when KB exists
4. Chat logs not saved

---

## Quick Test Commands

**Send test message via API:**
```bash
curl -X POST https://salesboy-lilac.vercel.app/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-signature: test" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "from": "234XXXXXXXXX@c.us",
    "message": "Hello, can you help me?",
    "timestamp": 1234567890
  }'
```

**Check chat logs:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  direction,
  from_number,
  message_body,
  timestamp
FROM chat_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY timestamp DESC
LIMIT 10;
```

---

## Next Steps After Testing

1. ✅ If all tests pass → Document results
2. ⚠️ If some tests fail → Debug and fix
3. 📝 Update bot config based on response quality
4. 🚀 Ready for production use

---

**Ready to test?** Send a message to your connected WhatsApp! 📱
