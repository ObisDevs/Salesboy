# Deploy Salesboy Gateway to VPS

## Step 1: Upload Files to VPS

From your local machine, copy the gateway folder to VPS:

```bash
scp -r salesboy-gateway root@srv892192.hstgr.cloud:/root/
```

Or use Git:

```bash
# On VPS
cd /root/salesboy-gateway
git init
git remote add origin your-repo-url
git pull origin main
```

## Step 2: Install Dependencies

```bash
ssh root@srv892192.hstgr.cloud
cd /root/salesboy-gateway
npm install
```

## Step 3: Copy Environment File

The `.env` file should already exist from Milestone 0. Verify it:

```bash
cat .env
```

## Step 4: Test the Gateway

```bash
npm start
```

Press Ctrl+C to stop after verifying it starts without errors.

## Step 5: Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 list
```

## Step 6: Test API Endpoints

```bash
# Health check
curl https://srv892192.hstgr.cloud:3001/health

# Start a session (replace API key) 
curl -X POST https://srv892192.hstgr.cloud:3001/session/start \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-1"}'

# Check session status
curl https://srv892192.hstgr.cloud:3001/session/status/test-user-1 \
  -H "X-API-KEY: 0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f"
```

## Step 7: Monitor Logs

```bash
# PM2 logs
pm2 logs salesboy-gateway

# Application logs
tail -f logs/gateway-*.log
```

## Troubleshooting

### Port already in use
```bash
lsof -i :3001
kill -9 <PID>
pm2 restart salesboy-gateway
```

### Permission errors
```bash
chmod -R 755 /root/salesboy-gateway
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

## Success Criteria

- ✅ Gateway starts without errors
- ✅ Health endpoint returns `{"status":"ok"}`
- ✅ Can start a WhatsApp session
- ✅ QR code generates successfully
- ✅ PM2 shows app as "online"

## Next Steps

Once gateway is running:
1. Test WhatsApp QR code scanning
2. Verify message forwarding to webhook
3. Begin Milestone 2: Database setup
