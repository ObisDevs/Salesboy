// Integration test script for Salesboy Core
const axios = require('axios')
const crypto = require('crypto')

const CORE_URL = 'http://localhost:3000/api'
const GATEWAY_URL = 'https://srv892192.hstgr.cloud:3001'
const API_SECRET_KEY = '0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f'
const HMAC_SECRET = '13304926a75f01750cd1d170245ef8fd699108c2c4d151d5250b84c996f6aa6e'

function generateHmac(payload) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
}

async function testGatewayHealth() {
  console.log('🔍 Testing Gateway Health...')
  try {
    const response = await axios.get(`${GATEWAY_URL}/health`)
    console.log('✅ Gateway is healthy:', response.data)
    return true
  } catch (error) {
    console.log('❌ Gateway health check failed:', error.message)
    return false
  }
}

async function testCoreWebhook() {
  console.log('🔍 Testing Core Webhook...')
  
  const payload = {
    from: '+1234567890',
    message: 'Hello AI assistant',
    user_id: 'test-user-123'
  }
  
  const payloadStr = JSON.stringify(payload)
  const signature = generateHmac(payloadStr)
  
  try {
    const response = await axios.post(`${CORE_URL}/webhook/whatsapp`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`
      }
    })
    console.log('✅ Webhook processed:', response.data)
    return true
  } catch (error) {
    console.log('❌ Webhook test failed:', error.response?.data || error.message)
    return false
  }
}

async function testSessionManagement() {
  console.log('🔍 Testing Session Management...')
  
  try {
    // Test session start
    const startResponse = await axios.post(`${CORE_URL}/sessions/start`, {
      user_id: 'test-user-123'
    })
    console.log('✅ Session start:', startResponse.data)
    
    // Test session status
    const statusResponse = await axios.get(`${CORE_URL}/sessions/status?user_id=test-user-123`)
    console.log('✅ Session status:', statusResponse.data)
    
    return true
  } catch (error) {
    console.log('❌ Session management test failed:', error.response?.data || error.message)
    return false
  }
}

async function testKnowledgeBase() {
  console.log('🔍 Testing Knowledge Base APIs...')
  
  try {
    // Test upload endpoint structure (will fail without actual file)
    const response = await axios.post(`${CORE_URL}/kb/upload`, {})
    console.log('❌ Should not reach here')
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ KB upload correctly validates input')
    } else {
      console.log('❌ Unexpected KB error:', error.message)
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Salesboy Integration Tests\n')
  
  const results = {
    gateway: await testGatewayHealth(),
    webhook: await testCoreWebhook(),
    sessions: await testSessionManagement(),
    kb: await testKnowledgeBase()
  }
  
  console.log('\n📊 Test Results:')
  console.log('Gateway Health:', results.gateway ? '✅' : '❌')
  console.log('Core Webhook:', results.webhook ? '✅' : '❌')
  console.log('Session Management:', results.sessions ? '✅' : '❌')
  console.log('Knowledge Base:', results.kb ? '✅' : '❌')
  
  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed! Ready for deployment.')
  } else {
    console.log('⚠️  Some tests failed. Check implementation or dependencies.')
  }
}

if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests }