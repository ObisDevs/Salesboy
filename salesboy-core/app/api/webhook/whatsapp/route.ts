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
    
    // Simple test response (bypassing AI for now)
    const response = `Hello! I received your message: "${message}". This is a test response from Salesboy AI.`
    
    // Send response back via gateway
    try {
      await sendMessage({
        user_id,
        to: from,
        message: response
      })
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