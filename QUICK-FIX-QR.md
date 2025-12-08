# QR Code Fix - Quick Solution

## The Problem
QR codes are generated but `GET /session/status` returns `qr: null`

## Quick Fix Commands

```bash
# 1. Stop current session completely
curl -X POST http://srv892192.hstgr.cloud:3001/session/stop

# 2. Wait 2 seconds
sleep 2

# 3. Start fresh session
curl -X POST http://srv892192.hstgr.cloud:3001/session/start

# 4. Get QR immediately
curl http://srv892192.hstgr.cloud:3001/session/status
```

## If Still No QR, Run This Test Script

```bash
# Create and run direct test
cat > test-qr-fix.js << 'EOF'
const axios = require('axios');

async function fixQR() {
  try {
    console.log('1. Stopping session...');
    await axios.post('http://srv892192.hstgr.cloud:3001/session/stop');
    
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('2. Starting fresh session...');
    await axios.post('http://srv892192.hstgr.cloud:3001/session/start');
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('3. Getting QR...');
    const response = await axios.get('http://srv892192.hstgr.cloud:3001/session/status');
    
    if (response.data.qr) {
      console.log('✅ QR Retrieved Successfully!');
      console.log('QR Length:', response.data.qr.length);
    } else {
      console.log('❌ Still no QR');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixQR();
EOF

node test-qr-fix.js
```

## Root Cause
The session manager generates QR but doesn't properly store it in the session object when requested.