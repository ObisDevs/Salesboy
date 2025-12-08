# Salesboy AI - Quick Testing Guide

## Current Status ✅

- ✅ Gateway running on VPS: `http://srv892192.hstgr.cloud:3001`
- ✅ Core backend deployed: `https://salesboy-lilac.vercel.app`
- ✅ Supabase connected
- ✅ Pinecone configured (empty - needs data)
- ✅ Gemini & OpenAI APIs configured

## Issue: Pinecone Shows 0 Records

**This is normal!** You haven't uploaded any documents yet. The knowledge base is empty.

## How to Fix: Upload Test Data

### Option 1: Using the Test Script (Recommended)

```bash
cd /workspaces/Salesboy
chmod +x test-kb-simple.sh
./test-kb-simple.sh
```

This will:
1. Create a test document
2. Upload it to Supabase Storage
3. Process and chunk the text
4. Generate embeddings
5. Upload vectors to Pinecone

After running, check Pinecone dashboard - you should see vectors in namespace `user_test-user-123`

### Option 2: Manual Testing

```bash
# 1. Create test file
cat > test.txt << 'EOF'
Salesboy AI is a WhatsApp automation platform.
We offer three pricing plans: Basic (₦5,000), Pro (₦15,000), and Enterprise.
Contact us at support@salesboy.ai or +234 800 123 4567.
Business hours: Monday-Friday 9AM-6PM WAT.
EOF

# 2. Upload
curl -X POST https://salesboy-lilac.vercel.app/api/kb/upload \
  -F "file=@test.txt" \
  -F "user_id=test-user-123"

# Note the file_id from response

# 3. Process (replace FILE_ID)
curl -X POST https://salesboy-lilac.vercel.app/api/kb/process \
  -H "Content-Type: application/json" \
  -d '{"file_id": "FILE_ID"}'

# 4. Embed (replace FILE_ID)
curl -X POST https://salesboy-lilac.vercel.app/api/kb/embed \
  -H "Content-Type: application/json" \
  -d '{"file_id": "FILE_ID"}'
```

## WhatsApp QR Code Issue

Your logs show the session is generating QR codes but they're not being retrieved. This happens because:

1. **Session already authenticated** - Check if `ready: true` in status
2. **Timing issue** - QR generated but not queried at right time
3. **Session in weird state** - Needs reset

### Solution: Reset and Get Fresh QR

```bash
cd /workspaces/Salesboy
chmod +x reset-and-get-qr.sh
./reset-and-get-qr.sh
```

This will:
1. Stop existing session
2. Wait for cleanup
3. Start new session
4. Wait for QR generation
5. Retrieve and display QR code

### Alternative: Check if Already Connected

```bash
curl http://srv892192.hstgr.cloud:3001/session/status/current-user \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"
```

If you see `"ready": true`, your WhatsApp is already connected! No QR needed.

## Testing End-to-End Flow

### 1. Ensure Session is Ready

```bash
# Check status
curl http://srv892192.hstgr.cloud:3001/session/status/current-user \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"

# Should return: {"exists": true, "ready": true, "qr": null}
```

### 2. Upload Knowledge Base Data

```bash
./test-kb-simple.sh
```

### 3. Send Test Message to Your WhatsApp

From another phone, send a message to the WhatsApp number connected to the gateway.

Example: "What are your pricing plans?"

### 4. Check Logs

On VPS:
```bash
ssh root@srv892192.hstgr.cloud
pm2 logs salesboy-gateway --lines 50
```

Look for:
- "Message received from..."
- "Message forwarded to webhook..."

On Vercel:
- Go to your deployment
- Click "Logs" tab
- Look for webhook processing

## Expected Flow

```
Customer WhatsApp Message
    ↓
Gateway receives message
    ↓
Gateway forwards to webhook (with HMAC)
    ↓
Core backend validates HMAC
    ↓
Checks whitelist (will fail if not whitelisted)
    ↓
Classifies intent
    ↓
Retrieves context from Pinecone
    ↓
Generates AI response
    ↓
Sends back via gateway
    ↓
Customer receives response
```

## Common Issues

### 1. "Message ignored - not whitelisted"

**Solution:** Add the phone number to whitelist in Supabase:

```sql
INSERT INTO whitelists (user_id, phone_number, active)
VALUES ('current-user', '2348012345678@c.us', true);
```

### 2. "Gateway not available"

**Solution:** Check if gateway is running:
```bash
ssh root@srv892192.hstgr.cloud
pm2 status
pm2 restart salesboy-gateway
```

### 3. "No relevant context found"

**Solution:** Upload documents to knowledge base (see above)

### 4. "HMAC validation failed"

**Solution:** Ensure HMAC_SECRET matches in both gateway and core:
- Gateway: `/root/salesboy-gateway/.env`
- Core: Vercel environment variables

## Quick Commands Reference

```bash
# Check system status
./check-system-status.sh

# Reset WhatsApp session and get QR
./reset-and-get-qr.sh

# Upload test knowledge base
./test-kb-simple.sh

# Check gateway logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 50"

# Restart gateway
ssh root@srv892192.hstgr.cloud "pm2 restart salesboy-gateway"
```

## Success Criteria

✅ Gateway status shows `ready: true`  
✅ Pinecone shows vectors in `user_*` namespace  
✅ Test message receives AI response  
✅ Response includes context from knowledge base  

## Next Steps After Testing

1. **Add real business data** to knowledge base
2. **Configure bot settings** in Supabase `bot_config` table
3. **Set up whitelists** for customer phone numbers
4. **Configure n8n workflows** for task automation
5. **Build dashboard UI** for easier management (Milestone 4)

---

**Need Help?**
- Check logs: `pm2 logs salesboy-gateway`
- Check Vercel logs in dashboard
- Review error messages in responses
- Ensure all environment variables are set correctly
