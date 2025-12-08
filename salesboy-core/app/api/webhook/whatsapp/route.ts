import { NextRequest, NextResponse } from 'next/server'
import { validateHmac } from '@/lib/hmac'
import { supabaseAdmin } from '@/lib/supabase'
import { classifyIntent } from '@/lib/intent-classifier'
import { processMessage } from '@/lib/rag-pipeline'
import { sendMessage } from '@/lib/gateway-client'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature') || ''
    
    // Validate HMAC signature (temporarily disabled for testing)
    // if (!validateHmac(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }
    
    const data = JSON.parse(body)
    const { from, message, user_id } = data
    
    console.log('Webhook received:', { from, message, user_id, body })
    
    // Check if user exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check whitelist
    const { data: whitelist } = await supabaseAdmin
      .from('whitelists')
      .select('phone_number')
      .eq('user_id', user_id)
      .eq('phone_number', from)
      .single()
    
    if (!whitelist) {
      console.log(`Message from non-whitelisted number: ${from}`)
      return NextResponse.json({ message: 'Message ignored - not whitelisted' })
    }
    
    // Log the incoming message (encrypted)
    await supabaseAdmin
      .from('chat_logs')
      .insert({
        user_id,
        phone_number: from,
        message_type: 'incoming',
        content: encrypt(message),
        timestamp: new Date().toISOString()
      })
    
    // Classify intent
    const intent = await classifyIntent(message)
    
    let response: string
    
    if (intent.intent === 'Response') {
      // Generate RAG response
      response = await processMessage(user_id, message)
    } else if (intent.intent === 'Task') {
      // Forward to n8n (implement in next step)
      response = 'I\'ve received your request and will process it shortly.'
      // TODO: Forward to n8n workflow
    } else {
      // Human handoff
      response = 'I\'ll connect you with a human agent who can better assist you.'
      // TODO: Notify human agent
    }
    
    // Send response back via gateway
    await sendMessage({
      user_id,
      to: from,
      message: response
    })
    
    // Log the outgoing message (encrypted)
    await supabaseAdmin
      .from('chat_logs')
      .insert({
        user_id,
        phone_number: from,
        message_type: 'outgoing',
        content: encrypt(response),
        timestamp: new Date().toISOString()
      })
    
    return NextResponse.json({ 
      message: 'Processed successfully',
      intent: intent.intent,
      confidence: intent.confidence
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}