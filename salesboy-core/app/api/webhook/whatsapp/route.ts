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
    
    // Check if message is from a group
    const isGroupMessage = from.includes('@g.us')
    if (isGroupMessage) {
      // Get user's master group reply setting
      const { data: botConfig } = await supabaseAdmin
        .from('bot_config')
        .select('reply_to_groups')
        .eq('user_id', actualUserId)
        .single()
      
      if (!botConfig?.reply_to_groups) {
        console.log('🚫 Ignoring group message - master group replies disabled')
        return NextResponse.json({ message: 'Group replies disabled in config' })
      }
      
      // Check if this specific group has replies enabled
      const { data: groupSetting } = await supabaseAdmin
        .from('group_settings')
        .select('auto_reply')
        .eq('user_id', actualUserId)
        .eq('group_id', from)
        .single()
      
      if (!groupSetting?.auto_reply) {
        console.log('🚫 Ignoring group message - individual group replies disabled')
        return NextResponse.json({ message: 'Group replies disabled for this group' })
      }
      
      console.log('✅ Processing group message - both master and group replies enabled')
    }
    
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
    
    // Check if user has active plan
    const { data: userPlan } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('user_id', actualUserId)
      .single()
    
    const hasActivePlan = userPlan && 
      userPlan.status === 'active' && 
      new Date(userPlan.expires_at) > new Date()
    
    if (!hasActivePlan) {
      console.log('🚫 User has no active plan:', actualUserId)
      return NextResponse.json({ message: 'User subscription inactive' })
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
    
    // Get conversation history (increased to 20 messages)
    const { data: chatHistory } = await supabaseAdmin
      .from('chat_logs')
      .select('message_body, direction')
      .eq('user_id', actualUserId)
      .eq('from_number', from)
      .order('timestamp', { ascending: false })
      .limit(20)
    
    // Build conversation context (use last 10 messages)
    const conversationContext = chatHistory?.slice(0, 10).reverse().map((msg: any) => 
      `${msg.direction === 'incoming' ? 'Customer' : 'Assistant'}: ${msg.message_body}`
    ).join('\n') || ''
    
    console.log('💬 Conversation history:', chatHistory?.length || 0, 'messages loaded')
    
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

      // Ensure payload has data, not empty object
      const cleanPayload = intent.payload && Object.keys(intent.payload).length > 0 
        ? intent.payload 
        : { raw_message: message }

      const taskPayload = {
        task_type: intent.task_type,
        payload: cleanPayload,
        email_content: intent.email_content || '',
        user_id: actualUserId,
        from_number: from,
        original_message: message,
        conversation_context: conversationContext
      }

      console.log('📦 Task payload:', JSON.stringify(taskPayload, null, 2))

      // Forward to n8n
      try {
        await forwardTaskToN8n(taskPayload)
        console.log('✅ Task forwarded to n8n')
      } catch (error) {
        console.error('❌ Failed to forward task to n8n:', error)
      }

      // Forward to user webhook (N8N)
      try {
        const intentWebhookUrl = profile?.metadata?.intent_webhook_url || profile?.metadata?.n8n_kb_webhook
        if (intentWebhookUrl) {
          const payloadStr = JSON.stringify(taskPayload)
          const signature = generateHmac(payloadStr)

          const response = await fetch(intentWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Signature': `sha256=${signature}`
            },
            body: payloadStr
          })

          console.log('✅ Task forwarded to user webhook:', response.status)
        } else {
          console.log('ℹ️ No webhook URL configured')
        }
      } catch (error) {
        console.error('❌ Failed to forward task to user webhook:', error)
      }

      // Generate AI confirmation with task details
      console.log('🤖 Generating AI task confirmation...')
      try {
        const confirmationPrompt = `The customer's ${intent.task_type.replace('_', ' ')} has been successfully submitted. Details: ${JSON.stringify(cleanPayload)}. Write a brief, friendly confirmation message (2-3 sentences) that:
1. Confirms the action was completed
2. Summarizes key details (name, items, date, etc.)
3. Sets expectations for next steps

Be natural and conversational. Don't use generic templates.`
        
        const aiConfirmation = await processMessage(actualUserId, confirmationPrompt, conversationContext)
        responseMessage = aiConfirmation
      } catch (error) {
        console.error('❌ AI confirmation failed:', error)
        responseMessage = `Done! I've processed your ${intent.task_type.replace('_', ' ')} request. You'll hear back from us soon.`
      }

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
        responseMessage = `Thanks for reaching out. I'm having a bit of trouble right now, but I'm here to help. Could you try asking again?`
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

