# Deploy Session Persistence Fixes

## Quick Deployment Guide

### Step 1: Sync Gateway .env to VPS
```bash
./sync-gateway-env.sh
```

Or manually:
```bash
scp salesboy-gateway/.env root@srv892192.hstgr.cloud:/root/salesboy-gateway/.env
ssh root@srv892192.hstgr.cloud "cd /root/salesboy-gateway && pm2 restart salesboy-gateway"
```

### Step 2: Deploy Core to Vercel
The core changes are already in your local files. Vercel will auto-deploy when you push to GitHub.

```bash
cd /workspaces/Salesboy
git add .
git commit -m "fix: session persistence, parameter consistency, and UI improvements"
git push origin main
```

### Step 3: Verify Deployment

#### Check Gateway
```bash
# Check if gateway is running
curl http://srv892192.hstgr.cloud:3001/health

# Check PM2 status
ssh root@srv892192.hstgr.cloud "pm2 status"

# View logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 20"
```

#### Check Core
```bash
# Visit dashboard
open https://salesboy-lilac.vercel.app/dashboard/sessions

# Check Vercel deployment
# Go to: https://vercel.com/your-project/deployments
```

### Step 4: Test Session Persistence

1. **Start Session**
   - Go to https://salesboy-lilac.vercel.app/dashboard/sessions
   - Click "Start Session"
   - Wait for QR code (5-10 seconds)

2. **Scan QR Code**
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Scan the QR code

3. **Verify Connection**
   - Wait for "Connected" status (green dot)
   - Status should show `"ready": true`

4. **Test Persistence**
   - Refresh the page (F5)
   - Status should still show "Connected"
   - No QR code should appear

5. **Test Messaging**
   - Send a WhatsApp message to the connected number
   - Check logs: `ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway"`
   - You should see the message in logs
   - You should receive an auto-response

6. **Test Disconnect**
   - Click "Disconnect Session"
   - Confirm the dialog
   - Status should change to "Disconnected"
   - WhatsApp should show device disconnected

### Step 5: Verify Fixes

#### ✅ Session Persistence
- [ ] Session remains connected after page refresh
- [ ] No QR code shown on refresh if already connected
- [ ] Auth files exist: `ssh root@srv892192.hstgr.cloud "ls -la /root/salesboy-gateway/.wwebjs_auth/"`

#### ✅ Parameter Consistency
- [ ] No 400 errors about missing parameters
- [ ] Gateway logs show correct userId
- [ ] Messages send successfully

#### ✅ Auto-Refresh
- [ ] Status updates automatically every 3 seconds
- [ ] QR code appears automatically when needed
- [ ] No need to manually click "Refresh Status"

#### ✅ UI Improvements
- [ ] "Start Session" button when disconnected
- [ ] "Disconnect Session" button when connected (red)
- [ ] "Cancel Session" button when connecting
- [ ] Confirmation dialog on disconnect

#### ✅ No More 500/404 Errors
- [ ] Webhook processes messages without errors
- [ ] Check Vercel logs for any errors
- [ ] Gateway logs show successful message forwarding

## Troubleshooting

### Gateway Not Running
```bash
ssh root@srv892192.hstgr.cloud
cd /root/salesboy-gateway
pm2 restart salesboy-gateway
pm2 logs salesboy-gateway
```

### Session Not Persisting
```bash
# Check auth directory
ssh root@srv892192.hstgr.cloud "ls -la /root/salesboy-gateway/.wwebjs_auth/"

# Should see: session-current-user/

# If missing, delete and recreate:
ssh root@srv892192.hstgr.cloud "rm -rf /root/salesboy-gateway/.wwebjs_auth/ && pm2 restart salesboy-gateway"
```

### Still Getting 500 Errors
```bash
# Check Vercel logs
# Go to: https://vercel.com/your-project/logs

# Check gateway logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 50"

# Check if .env is correct
ssh root@srv892192.hstgr.cloud "cat /root/salesboy-gateway/.env"
```

### QR Code Not Showing
- Wait 10 seconds after clicking "Start Session"
- Check browser console for errors (F12)
- Verify gateway is running: `curl http://srv892192.hstgr.cloud:3001/health`
- Check gateway logs for QR generation

## Files Changed

### Core (salesboy-core/)
- `lib/gateway-client.ts` - Fixed parameter naming
- `app/api/webhook/whatsapp/route.ts` - Fixed sendMessage call
- `app/dashboard/sessions/page.tsx` - Added auto-refresh and disconnect button

### Gateway (salesboy-gateway/)
- `.env` - Created with proper configuration

### New Files
- `sync-gateway-env.sh` - Deployment script
- `FIX-SESSION-PERSISTENCE.md` - Detailed fix documentation
- `PROJECT-STATUS.md` - Complete project status
- `DEPLOY-FIXES.md` - This file

## Next Actions After Deployment

1. **Test End-to-End Flow**
   - Send message from WhatsApp
   - Verify response received
   - Check message logged to database

2. **Add Whitelist Entry**
   - Go to dashboard/whitelist
   - Add your phone number
   - Test that only whitelisted numbers get responses

3. **Upload Knowledge Base**
   - Go to dashboard/kb
   - Upload a test document
   - Test RAG responses

4. **Configure Bot Settings**
   - Go to dashboard/settings
   - Set system prompt
   - Configure AI behavior

## Success Indicators

✅ **Deployment Successful If**:
- Gateway health check returns 200
- Dashboard loads without errors
- Session starts and shows QR
- QR scan connects successfully
- Status shows "Connected" with green dot
- Page refresh keeps connection
- Messages send and receive
- Disconnect button works
- No 500/404 errors in logs

## Support

If issues persist:
1. Check all logs (Vercel + PM2)
2. Verify all environment variables
3. Ensure VPS has enough resources
4. Check network connectivity
5. Review error messages carefully

---

**Ready to deploy?** Run `./sync-gateway-env.sh` and push to GitHub!
