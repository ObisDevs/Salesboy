// Simple test script to verify API endpoints
const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testAPIs() {
  console.log('Testing Salesboy Core APIs...\n')
  
  // Test session status (should fail without user_id)
  try {
    const response = await axios.get(`${BASE_URL}/sessions/status`)
    console.log('❌ Session status should require user_id')
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Session status correctly requires user_id')
    }
  }
  
  // Test webhook without signature (should fail)
  try {
    const response = await axios.post(`${BASE_URL}/webhook/whatsapp`, {
      from: '+1234567890',
      message: 'Hello',
      user_id: 'test-user'
    })
    console.log('❌ Webhook should require HMAC signature')
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Webhook correctly requires HMAC signature')
    }
  }
  
  console.log('\nAPI structure tests completed!')
}

if (require.main === module) {
  testAPIs().catch(console.error)
}

module.exports = { testAPIs }