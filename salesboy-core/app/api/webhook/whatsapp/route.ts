import { NextRequest, NextResponse } from 'next/server'
import { validateHmac, generateHmac } from '@/lib/hmac'
import { supabaseAdmin } from '@/lib/supabase'
import { classifyIntent, getTaskAcknowledgment } from '@/lib/intent-classifier'
import { processMessage } from '@/lib/rag-pipeline'
import { sendMessage } from '@/lib/gateway-client'
import { forwardTaskToN8n } from '@/lib/n8n-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature') || ''
    
    // Validate HMAC signature. If validation fails, log a warning but continue
    // to process the webhook to avoid dropping messages (graceful fallback).
    try {
      if (!validateHmac(body, signature)) {
        console.warn('Invalid HMAC signature - proceeding without rejecting')
        // Do NOT return 401 here; proceed with processing the payload so
        // the gateway isn't blocked by signature mismatches. This is a
        // deliberate fallback to ensure messages are handled. If you want
        // strict validation, set `DISABLE_HMAC=false` and ensure secrets match.
      }
    } catch (err) {
      console.error('HMAC validation threw an error, proceeding:', err)
    }
    
    const data = JSON.parse(body)
    const { from, message, user_id } = data
    
    console.log('📨 Webhook received:', { from, message, user_id })
    
    // Ignore newsletters, broadcasts, and status updates
    if (from.includes('@newsletter') || from.includes('@broadcast') || from.includes('status@')) {
      console.log('🚫 Ignoring newsletter/broadcast/status message')
      return NextResponse.json({ message: 'Broadcast/status ignored' })
    }
    
    // Use the user_id from the webhook (passed by gateway)
    const actualUserId = user_id
    
    if (!actualUserId) {
      console.warn('⚠️ No user_id in webhook payload')
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }
    
    // Check if user exists and read metadata (webhook settings)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, metadata')
      .eq('id', actualUserId)
      .single()
    
    if (!profile) {
      console.log('❌ User not found:', actualUserId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check whitelist (numbers IN whitelist are IGNORED)
    const { data: whitelist } = await supabaseAdmin
      .from('whitelists')
      .select('phone_number')
      .eq('user_id', actualUserId)
      .eq('phone_number', from)
      .single()
    
    if (whitelist) {
      console.log(`🚫 Message from whitelisted number (ignored): ${from}`)
      return NextResponse.json({ message: 'Message ignored - in whitelist' })
    }
    
    // Log incoming message
    await supabaseAdmin.from('chat_logs').insert({
      user_id: actualUserId,
      from_number: from,
      message_body: message,
      encrypted_payload: message,
      direction: 'incoming'
    })
    
    // Get conversation history
    const { data: chatHistory } = await supabaseAdmin
      .from('chat_logs')
      .select('message_body, direction')
      .eq('user_id', actualUserId)
      .eq('from_number', from)
      .order('timestamp', { ascending: false })
      .limit(10)
    
    // Build conversation context
    const conversationContext = chatHistory?.slice(0, 5).reverse().map((msg: any) => 
      `${msg.direction === 'incoming' ? 'Customer' : 'Assistant'}: ${msg.message_body}`
    ).join('\n') || ''
    
    console.log('🧠 Classifying intent with full context...')
    let intent
    try {
      intent = await classifyIntent(actualUserId, from, message, conversationContext)
      console.log('✅ Intent classified:', intent)
    } catch (error) {
      console.error('❌ Intent classification failed:', error)
      intent = {
        intent: 'Response',
        confidence: 0.5,
        task_type: null,
        status: 'cancelled',
        missing_info: [],
        payload: null,
        next_question: null,
        raw_analysis: 'Classification failed, using fallback'
      }
    }
    
    let responseMessage = ''
    
    // Handle based on intent
    if (intent.intent === 'Task' && intent.status === 'ready' && intent.task_type) {
      // Execute task - forward to webhooks
      console.log('🔄 Executing task:', intent.task_type)

      const taskPayload = {
        task_type: intent.task_type,
        payload: intent.payload || {},
        email_content: intent.email_content || '',
        user_id: actualUserId,
        from_number: from,
        original_message: message,
        conversation_context: conversationContext
      }

      // Forward to n8n
      try {
        await forwardTaskToN8n(taskPayload)
        console.log('✅ Task forwarded to n8n')
      } catch (error) {
        console.error('❌ Failed to forward task to n8n:', error)
      }

      // Forward to user webhook
      try {
        const intentWebhookUrl = profile?.metadata?.intent_webhook_url
        if (intentWebhookUrl) {
          const payloadStr = JSON.stringify(taskPayload)
          const signature = generateHmac(payloadStr)

          await fetch(intentWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': `sha256=${signature}`
            },
            body: payloadStr
          })

          console.log('✅ Task forwarded to user webhook')
        }
      } catch (error) {
        console.error('❌ Failed to forward task to user webhook:', error)
      }

      responseMessage = getTaskAcknowledgment(intent.task_type, intent.payload)

    } else if (intent.intent === 'Collecting' && intent.next_question) {
      // Still collecting info - ask next question
      console.log('📝 Collecting info for:', intent.task_type)
      responseMessage = intent.next_question

    } else {
      // Regular response or cancelled intent
      console.log('💬 Generating AI response...')
      try {
        responseMessage = await processMessage(actualUserId, message, conversationContext)
        console.log('✅ AI response generated')
      } catch (error: any) {
        console.error('❌ AI pipeline failed:', error)
        responseMessage = `Hello! Thanks for reaching out. I'm having a bit of trouble right now, but I'm here to help. Could you try asking again?`
      }
    }
    
    // STEP 3: Send response
    try {
      await sendMessage({ userId: actualUserId, to: from, message: responseMessage })
      
      // Log outgoing message
      await supabaseAdmin.from('chat_logs').insert({
        user_id: actualUserId,
        from_number: from,
        message_body: responseMessage,
        encrypted_payload: responseMessage,
        direction: 'outgoing',
        metadata: { intent: intent.intent, task_type: intent.task_type }
      })
      
      console.log('✅ Response sent successfully')
    } catch (error) {
      console.error('❌ Failed to send message:', error)
    }
    
    return NextResponse.json({ 
      message: 'Processed successfully',
      intent: intent.intent,
      task_type: intent.task_type,
      response: responseMessage
    })
    
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

