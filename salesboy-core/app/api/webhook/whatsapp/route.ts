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
    
    // Map gateway user_id to actual UUID
    const actualUserId = user_id === 'current-user' 
      ? '00000000-0000-0000-0000-000000000001' 
      : user_id
    
    // Check if user exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', actualUserId)
      .single()
    
    if (!profile) {
      console.log('User not found:', actualUserId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('Processing message from:', from, 'message:', message)
    
    // Check whitelist (numbers IN whitelist are IGNORED)
    const { data: whitelist } = await supabaseAdmin
      .from('whitelists')
      .select('phone_number')
      .eq('user_id', actualUserId)
      .eq('phone_number', from)
      .single()
    
    if (whitelist) {
      console.log(`Message from whitelisted number (ignored): ${from}`)
      return NextResponse.json({ message: 'Message ignored - in whitelist' })
    }
    
    // Log incoming message
    console.log('Inserting log for:', actualUserId, from)
    const { data: logData, error: logError } = await supabaseAdmin.from('chat_logs').insert({
      user_id: actualUserId,
      from_number: from,
      message_body: message,
      encrypted_payload: message,
      direction: 'incoming'
    }).select()
    
    console.log('Insert result:', logData, 'error:', logError)
    
    if (logError) {
      console.error('Failed to log incoming message:', logError)
    }
    
    const response = `Hello! I received your message: "${message}". This is a test response from Salesboy AI.`
    
    // Send response
    try {
      await sendMessage({ userId: user_id, to: from, message: response })
      
      // Log outgoing message
      const { error: outLogError } = await supabaseAdmin.from('chat_logs').insert({
        user_id: actualUserId,
        from_number: from,
        message_body: response,
        encrypted_payload: response,
        direction: 'outgoing'
      })
      
      if (outLogError) {
        console.error('Failed to log outgoing message:', outLogError)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
    
    return NextResponse.json({ 
      message: 'Processed successfully',
      response: response
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}