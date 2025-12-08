# Session Persistence Fix

## Issues Fixed

1. ✅ **Session Persistence**: Sessions now persist using LocalAuth (WhatsApp stores auth in `.wwebjs_auth/`)
2. ✅ **Parameter Mismatch**: Fixed `userId` vs `user_id` inconsistency
3. ✅ **Auto-Refresh**: Dashboard now auto-refreshes status every 3 seconds
4. ✅ **Disconnect Button**: Added proper disconnect button with confirmation
5. ✅ **Gateway .env**: Created proper environment configuration

## Changes Made

### 1. Gateway Client (`lib/gateway-client.ts`)
- Fixed `SendMessageRequest` to use `userId` consistently
- Fixed `getSessionStatus` to pass userId in URL path

### 2. Sessions Page (`app/dashboard/sessions/page.tsx`)
- Added auto-refresh every 3 seconds
- Added `disconnectSession` function with confirmation
- Improved UI to show appropriate buttons based on session state
- Auto-cleanup on component unmount

### 3. Webhook Handler (`app/api/webhook/whatsapp/route.ts`)
- Fixed `sendMessage` call to use `userId` instead of `user_id`

### 4. Gateway Environment
- Created `.env` file with proper configuration
- Created `sync-gateway-env.sh` script for easy deployment

## Deployment Steps

### Step 1: Deploy Core Changes to Vercel
```bash
cd salesboy-core
git add .
git commit -m "fix: session persistence and parameter consistency"
git push origin main
```

Vercel will auto-deploy.

### Step 2: Sync Gateway .env to VPS
```bash
./sync-gateway-env.sh
```

Or manually:
```bash
scp salesboy-gateway/.env root@srv892192.hstgr.cloud:/root/salesboy-gateway/.env
ssh root@srv892192.hstgr.cloud "cd /root/salesboy-gateway && pm2 restart salesboy-gateway"
```

### Step 3: Test Session Persistence

1. Go to https://salesboy-lilac.vercel.app/dashboard/sessions
2. Click "Start Session"
3. Scan QR code with WhatsApp
4. Wait for "Connected" status
5. Refresh the page - session should remain connected
6. Send a test message from WhatsApp
7. Check logs: `ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway"`

## How Session Persistence Works

### LocalAuth Storage
WhatsApp sessions are stored in `.wwebjs_auth/session-{userId}/` on the VPS:
- Authentication tokens
- Session data
- Device info

### Session Lifecycle
1. **First Time**: User scans QR → WhatsApp authenticates → Session saved to disk
2. **Subsequent Starts**: Gateway loads session from disk → Auto-connects (no QR needed)
3. **Page Refresh**: Frontend re-fetches status → Shows "Connected" if session exists
4. **Disconnect**: User clicks "Disconnect" → Session destroyed → Auth files deleted

### Auto-Refresh
- Dashboard polls status every 3 seconds
- Shows real-time connection status
- Automatically displays QR when needed
- Stops polling on component unmount

## Troubleshooting

### Session Not Persisting
```bash
# Check if auth files exist on VPS
ssh root@srv892192.hstgr.cloud "ls -la /root/salesboy-gateway/.wwebjs_auth/"

# Should see: session-current-user/
```

### 500/404 Errors
```bash
# Check gateway logs
ssh root@srv892192.hstgr.cloud "pm2 logs salesboy-gateway --lines 50"

# Check if gateway is running
ssh root@srv892192.hstgr.cloud "pm2 status"
```

### QR Not Showing
- Wait 5-10 seconds after clicking "Start Session"
- Check browser console for errors
- Verify gateway is running: `curl http://srv892192.hstgr.cloud:3001/health`

## Testing Checklist

- [ ] Start session and scan QR
- [ ] Verify "Connected" status
- [ ] Refresh page - status remains "Connected"
- [ ] Send WhatsApp message - appears in logs
- [ ] Receive response from bot
- [ ] Click "Disconnect" - session stops
- [ ] Start session again - should auto-connect (no QR)
- [ ] Only shows QR if session was fully disconnected

## Next Steps

1. Add session management for multiple users
2. Add session health monitoring
3. Add automatic reconnection on disconnect
4. Add session expiry handling
5. Add better error messages in UI
