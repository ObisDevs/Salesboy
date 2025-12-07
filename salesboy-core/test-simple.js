// Simple test for core backend
const crypto = require('crypto')

// Test HMAC generation
function testHmac() {
  const HMAC_SECRET = '13304926a75f01750cd1d170245ef8fd699108c2c4d151d5250b84c996f6aa6e'
  const payload = '{"test": "data"}'
  const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex')
  console.log('✅ HMAC Test:', hmac)
  return hmac
}

// Test environment variables
function testEnv() {
  console.log('🔍 Environment Variables:')
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing')
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing')
}

async function testAPI() {
  console.log('🚀 Testing Core Backend Components\n')
  
  // Environment loaded by Next.js
  
  testEnv()
  console.log()
  testHmac()
  
  console.log('\n✅ Basic tests completed!')
  console.log('Next: Start the server with "npm run dev"')
}

testAPI().catch(console.error)