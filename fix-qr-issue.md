# Fix QR Code Issue

## Problem Analysis
From your logs, I can see:
1. ✅ QR codes ARE being generated (logs show "QR code generated for user current-user")
2. ✅ Session exists
3. ❌ But when you query `/session/status/current-user`, the QR returns `null`

## Root Cause
The session was logged out and restarted, but there's a timing issue. The QR code is generated asynchronously, and when you immediately query for it, it might not be ready yet.

## Solution: Use the SSE endpoint instead

### On Your VPS, run this command:

```bash
curl -N http://localhost:3001/session/qr/current-user \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"
```

This will stream the QR code as soon as it's available.

### Or use this complete flow:

```bash
# 1. Stop existing session
curl -X POST http://localhost:3001/session/stop \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d '{"userId": "current-user"}'

# 2. Wait 2 seconds
sleep 2

# 3. Delete the old session data (this forces a fresh QR)
rm -rf /root/Salesboy/salesboy-gateway/.wwebjs_auth/session-current-user

# 4. Start new session
curl -X POST http://localhost:3001/session/start \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d '{"userId": "current-user"}'

# 5. Wait 5 seconds for initialization
sleep 5

# 6. Get QR code
curl http://localhost:3001/session/status/current-user \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"
```

## Alternative: Check if session is already authenticated

Your logs show the session was authenticated at 00:22:14. Run this to check current status:

```bash
curl http://localhost:3001/session/status/current-user \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"
```

If it returns `{"exists": true, "ready": true, "qr": null}`, then **the session is already connected** and you don't need a QR code!

## Test if messages work

If the session is ready, test sending a message to yourself:

```bash
# Replace with your WhatsApp number in format: 2348012345678@c.us
curl -X POST http://localhost:3001/message/send \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "current-user",
    "to": "YOUR_NUMBER@c.us",
    "message": "Test from Salesboy"
  }'
```

## Why QR is null

The QR code is `null` in these cases:
1. Session is already authenticated (no QR needed)
2. QR hasn't been generated yet (timing issue)
3. QR expired and session is waiting for next refresh

## Recommended Action

Run this on your VPS:

```bash
cd /root/Salesboy/salesboy-gateway
pm2 logs salesboy-gateway --lines 50
```

Look for:
- "User current-user authenticated" → Session is connected, no QR needed
- "QR code generated" → QR is being created
- "WhatsApp client ready" → Session is fully operational

If you see "ready", your session is working and you can send/receive messages!
