// Test script for API endpoints
const http = require('http')
const crypto = require('crypto')

const HMAC_SECRET = '13304926a75f01750cd1d170245ef8fd699108c2c4d151d5250b84c996f6aa6e'

function generateHmac(payload) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        })
      })
    })
    
    req.on('error', reject)
    
    if (data) {
      req.write(data)
    }
    req.end()
  })
}

async function testEndpoints() {
  console.log('🔍 Testing Core Backend Endpoints...\n')
  
  // Test webhook endpoint
  const webhookPayload = JSON.stringify({
    from: '+1234567890',
    message: 'Hello test',
    user_id: 'test-user'
  })
  
  const signature = generateHmac(webhookPayload)
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook/whatsapp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`,
        'Content-Length': Buffer.byteLength(webhookPayload)
      }
    }, webhookPayload)
    
    console.log('✅ Webhook endpoint response:', response.status)
    console.log('   Body:', response.body)
  } catch (error) {
    console.log('❌ Webhook test failed:', error.message)
  }
  
  // Test session status endpoint
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/sessions/status?user_id=test-user',
      method: 'GET'
    })
    
    console.log('✅ Session status response:', response.status)
    console.log('   Body:', response.body)
  } catch (error) {
    console.log('❌ Session status test failed:', error.message)
  }
}

if (require.main === module) {
  testEndpoints().catch(console.error)
}

module.exports = { testEndpoints }