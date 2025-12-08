#!/usr/bin/env node

/**
 * AI Pipeline Test Script
 * Tests the complete RAG + Intent Classification + Task Routing pipeline
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://salesboy-lilac.vercel.app/api/webhook/whatsapp'
const HMAC_SECRET = process.env.HMAC_SECRET || '13304926a75f01750cd1d170245ef8fd699108c2c4d151d5250b84c996f6aa6e'

const crypto = require('crypto')

function generateHmac(body) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(body).digest('hex')
}

async function testMessage(message, description) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`TEST: ${description}`)
  console.log(`MESSAGE: "${message}"`)
  console.log('='.repeat(60))
  
  const payload = {
    from: '2349058653283@c.us',
    message: message,
    user_id: 'current-user',
    timestamp: new Date().toISOString()
  }
  
  const body = JSON.stringify(payload)
  const signature = generateHmac(body)
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`
      },
      body: body
    })
    
    const data = await response.json()
    
    console.log(`\n✅ Status: ${response.status}`)
    console.log(`📊 Intent: ${data.intent || 'N/A'}`)
    console.log(`🎯 Task Type: ${data.task_type || 'N/A'}`)
    console.log(`💬 Response: ${data.response || data.message}`)
    
    return data
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`)
    return null
  }
}

async function runTests() {
  console.log('\n🚀 Starting AI Pipeline Tests...\n')
  
  // Test 1: Simple question (Response intent)
  await testMessage(
    'What products do you have?',
    'Simple Product Inquiry (Response Intent)'
  )
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 2: Price check (Response intent)
  await testMessage(
    'How much is iPhone 14 Pro?',
    'Price Check (Response Intent)'
  )
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 3: Order placement (Task intent - create_order)
  await testMessage(
    'I want to buy 2 iPhone 14 Pro Max',
    'Order Placement (Task Intent - create_order)'
  )
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 4: Booking request (Task intent - book_calendar)
  await testMessage(
    'Can I schedule a meeting for tomorrow at 2pm?',
    'Meeting Booking (Task Intent - book_calendar)'
  )
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 5: Email request (Task intent - send_email)
  await testMessage(
    'Please send me an email with your product catalog',
    'Email Request (Task Intent - send_email)'
  )
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 6: Complaint (HumanHandoff intent)
  await testMessage(
    'I want a refund, this product is not working',
    'Complaint/Refund (HumanHandoff Intent)'
  )
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 7: Greeting (Response intent)
  await testMessage(
    'Hello, good morning!',
    'Greeting (Response Intent)'
  )
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ All tests completed!')
  console.log('='.repeat(60) + '\n')
}

// Run tests
runTests().catch(console.error)
