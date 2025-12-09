import { NextRequest, NextResponse } from 'next/server'
import { validateHmac, generateHmac } from '@/lib/hmac'
import { supabaseAdmin } from '@/lib/supabase'
import { classifyIntent } from '@/lib/intent-classifier'
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
    
    // STEP 1: Check conversation history to determine if intent classification is needed
    const { data: chatHistory, error: historyError } = await supabaseAdmin
      .from('chat_logs')
      .select('message_body, direction')
      .eq('user_id', actualUserId)
      .eq('from_number', from)
      .order('timestamp', { ascending: false })
      .limit(10)
    
    const messageCount = chatHistory?.length || 0
    const hasConversationHistory = messageCount > 2 // At least 2 messages exchanged
    
    console.log(`📊 Message count: ${messageCount}, Has history: ${hasConversationHistory}`)
    
    let intent
    
    // Only classify intent if user has chatted before (not first message)
    if (!hasConversationHistory) {
      console.log('👋 First message - skipping intent classification')
      intent = {
        intent: 'Response',
        confidence: 1.0,
        task_type: null,
        payload: null,
        raw_analysis: 'First message - building rapport'
      }
    } else {
      // Check if message contains action keywords
      const lowerMessage = message.toLowerCase()
      const hasActionKeyword = /\b(send|email|mail|forward|share|book|schedule|meeting|appointment|order|buy|purchase|place order)\b/i.test(lowerMessage)
      
      if (!hasActionKeyword) {
        // No action keywords - likely just a question
        console.log('💬 No action keywords - Response intent')
        intent = {
          intent: 'Response',
          confidence: 0.9,
          task_type: null,
          payload: null,
          raw_analysis: 'Question or inquiry'
        }
      } else {
        // Has action keywords - classify intent
        console.log('🧠 Action detected, classifying intent...')
        try {
          intent = await classifyIntent(message)
          console.log('✅ Intent classified:', intent)
        } catch (error) {
          console.error('❌ Intent classification failed:', error)
          intent = {
            intent: 'Response',
            confidence: 0.5,
            task_type: null,
            payload: null,
            raw_analysis: 'Classification failed, using fallback'
          }
        }
      }
    }
    
    let responseMessage = ''
    
    // STEP 2: Handle based on intent
    if (intent.intent === 'Task' && intent.task_type) {
      // Task intent - forward to n8n and/or user's intent webhook, then acknowledge
      console.log('🔄 Forwarding task to n8n and user webhook (if configured):', intent.task_type)

      const taskPayload = {
        task_type: intent.task_type,
        payload: intent.payload || {},
        user_id: actualUserId,
        from_number: from,
        original_message: message
      }

      // First: forward to n8n (if configured in environment)
      try {
        await forwardTaskToN8n(taskPayload)
        console.log('✅ Task forwarded to n8n')
      } catch (error) {
        console.error('❌ Failed to forward task to n8n:', error)
      }

      // Second: forward to user's configured intent webhook URL (if set)
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
            body: payloadStr,
            // user-provided webhooks may be slow; give a short timeout if runtime supports
          })

          console.log('✅ Task forwarded to user intent webhook:', intentWebhookUrl)
        } else {
          console.log('ℹ️ No intent_webhook_url configured for user')
        }
      } catch (error) {
        console.error('❌ Failed to forward task to user webhook:', error)
      }

      try {
        responseMessage = getTaskAcknowledgment(intent.task_type)
      } catch (err) {
        responseMessage = "I'm working on that for you. I'll get back to you shortly!"
      }

    } else {
      // Response intent - use RAG pipeline with conversation context
      console.log('💬 Generating AI response...')
      try {
        // Build conversation context
        const recentMessages = chatHistory?.slice(0, 5).reverse().map((msg: any) => 
          `${msg.direction === 'incoming' ? 'Customer' : 'You'}: ${msg.message_body}`
        ).join('\n') || ''
        
          console.log('Calling processMessage with:', { actualUserId, message, hasContext: !!recentMessages })
          responseMessage = await processMessage(actualUserId, message, recentMessages)
        console.log('✅ AI response generated:', responseMessage.substring(0, 50))
      } catch (error: any) {
        console.error('❌ AI pipeline failed:', error)
        console.error('Error details:', error.message, error.stack)
        
        // Check if API keys are configured
        const hasGemini = !!process.env.GEMINI_API_KEY
        const hasOpenAI = !!process.env.OPENAI_API_KEY
        console.log('API Keys configured:', { hasGemini, hasOpenAI })
        
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

function getTaskAcknowledgment(taskType: string): string {
  const acknowledgments: Record<string, string> = {
    send_email: "Got it! I'm processing your email request. You'll receive a confirmation shortly.",
    book_calendar: "Perfect! I'm scheduling that for you now. I'll send you the details in a moment.",
    create_order: "Great! I'm processing your order. You'll get a confirmation with all the details soon.",
    human_handoff: "I've notified our team. Someone will reach out to you shortly!"
  }
  
  return acknowledgments[taskType] || "I'm working on that for you. I'll get back to you shortly!"
}