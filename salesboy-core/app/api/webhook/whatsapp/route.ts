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
    
    try {
      if (!validateHmac(body, signature)) {
        console.warn('Invalid HMAC signature - proceeding without rejecting')
      }
    } catch (err) {
      console.error('HMAC validation threw an error, proceeding:', err)
    }
    
    const data = JSON.parse(body)
    const { from, message, user_id } = data
    
    console.log('📨 Webhook received:', { from, message, user_id })
    
    if (from.includes('@newsletter') || from.includes('@broadcast') || from.includes('status@')) {
      console.log('🚫 Ignoring newsletter/broadcast/status message')
      return NextResponse.json({ message: 'Broadcast/status ignored' })
    }
    
    const actualUserId = user_id
    
    const isGroupMessage = from.includes('@g.us')
    if (isGroupMessage) {
      const { data: botConfig } = await supabaseAdmin
        .from('bot_config')
        .select('reply_to_groups')
        .eq('user_id', actualUserId)
        .single()
      
      if (!botConfig?.reply_to_groups) {
        console.log('🚫 Ignoring group message - master group replies disabled')
        return NextResponse.json({ message: 'Group replies disabled in config' })
      }
      
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
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, metadata')
      .eq('id', actualUserId)
      .single()
    
    if (!profile) {
      console.log('❌ User not found:', actualUserId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
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
    
    await supabaseAdmin.from('chat_logs').insert({
      user_id: actualUserId,
      from_number: from,
      message_body: message,
      encrypted_payload: message,
      direction: 'incoming'
    })
    
    const { data: chatHistory } = await supabaseAdmin
      .from('chat_logs')
      .select('message_body, direction, timestamp')
      .eq('user_id', actualUserId)
      .eq('from_number', from)
      .order('timestamp', { ascending: false })
      .limit(20)
    
    // Check if this is a new conversation (last message > 6 hours ago)
    const isNewConversation = !chatHistory || chatHistory.length === 0 || 
      (new Date().getTime() - new Date(chatHistory[0].timestamp).getTime()) > (6 * 60 * 60 * 1000)
    
    // Recent context (last 10 messages for active conversation)
    const recentContext = chatHistory?.slice(0, 10).reverse().map((msg: any) => 
      `${msg.direction === 'incoming' ? 'Customer' : 'Assistant'}: ${msg.message_body}`
    ).join('\n') || ''
    
    // Full history context (all 20 messages for reference)
    const fullHistoryContext = chatHistory?.reverse().map((msg: any) => 
      `${msg.direction === 'incoming' ? 'Customer' : 'Assistant'}: ${msg.message_body}`
    ).join('\n') || ''
    
    console.log('💬 Conversation history:', chatHistory?.length || 0, 'messages loaded', '| New conversation:', isNewConversation)
    
    console.log('🧠 Classifying intent...')
    let intent
    try {
      intent = await classifyIntent(actualUserId, from, message, recentContext)
      console.log('✅ Intent classified:', { intent: intent.intent, task_type: intent.task_type, notify_owner: intent.notify_owner, show_customer_notification: intent.show_customer_notification })
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
        email_content: null,
        raw_analysis: 'Classification failed, using fallback',
        notify_owner: false,
        show_customer_notification: false
      }
    }
    
    let responseMessage = ''
    
    // Handle Inquiry (silent notification)
    if (intent.intent === 'Inquiry' && intent.task_type === 'inquiry') {
      console.log('🔍 Handling inquiry - AI answers, owner notified silently')
      responseMessage = await processMessage(actualUserId, message, recentContext, isNewConversation, fullHistoryContext)
      
      // Silent notification to owner
      if (intent.notify_owner) {
        const inquiryPayload = {
          task_type: 'inquiry',
          payload: intent.payload || { inquiry_question: message },
          user_id: actualUserId,
          from_number: from,
          original_message: message,
          ai_response: responseMessage,
          conversation_context: recentContext
        }
        
        try {
          await forwardTaskToN8n(inquiryPayload)
          console.log('🔕 Owner notified silently about inquiry')
        } catch (error) {
          console.error('❌ Failed to notify owner:', error)
        }
      }
    }
    // Handle Task (with customer notification)
    else if (intent.intent === 'Task' && intent.status === 'ready' && intent.task_type) {
      console.log('🔄 Executing task:', intent.task_type)

      const payload = intent.payload || {}
      const hasValidName = payload.customer_name && payload.customer_name !== 'Not provided'
      const hasValidEmail = payload.customer_email && payload.customer_email !== 'Not provided'
      const needsAddress = ['place_order', 'create_order'].includes(intent.task_type)
      const hasValidAddress = !needsAddress || (payload.delivery_address && payload.delivery_address !== 'Not provided')
      
      if (!hasValidName || !hasValidEmail || !hasValidAddress) {
        console.log('⚠️ Task missing required fields:', { hasValidName, hasValidEmail, hasValidAddress })
        responseMessage = `I need a bit more information before I can proceed. Please provide:\n${!hasValidName ? '- Your name' : ''}\n${!hasValidEmail ? '- Your email address' : ''}\n${!hasValidAddress ? '- Your delivery address' : ''}`
        
        await sendMessage({ userId: actualUserId, to: from, message: responseMessage })
        await supabaseAdmin.from('chat_logs').insert({
          user_id: actualUserId,
          from_number: from,
          message_body: responseMessage,
          encrypted_payload: responseMessage,
          direction: 'outgoing'
        })
        
        return NextResponse.json({ message: 'Missing required fields' })
      }
      
      const taskPayload = {
        task_type: intent.task_type,
        payload: payload,
        email_content: intent.email_content || '',
        user_id: actualUserId,
        from_number: from,
        original_message: message,
        conversation_context: recentContext
      }

      console.log('📦 Task payload:', JSON.stringify(taskPayload, null, 2))

      // Notify owner
      if (intent.notify_owner) {
        try {
          await forwardTaskToN8n(taskPayload)
          console.log('✅ Owner notified about task')
        } catch (error) {
          console.error('❌ Failed to notify owner:', error)
        }

        try {
          const intentWebhookUrl = profile?.metadata?.intent_webhook_url || profile?.metadata?.n8n_kb_webhook
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
          console.error('❌ Failed to forward to user webhook:', error)
        }
      }

      // Generate AI confirmation
      console.log('🤖 Generating AI task confirmation...')
      try {
        const confirmationPrompt = `The customer's ${intent.task_type.replace('_', ' ')} has been successfully submitted. Details: ${JSON.stringify(payload)}. Write a brief, friendly confirmation message (2-3 sentences) that:\n1. Confirms the action was completed\n2. Summarizes key details (name, items, date, etc.)\n3. Sets expectations for next steps\n\nBe natural and conversational. Don't use generic templates.`
        
        responseMessage = await processMessage(actualUserId, confirmationPrompt, recentContext, isNewConversation, fullHistoryContext)
        
        // Add "team notified" ONLY if show_customer_notification is true
        if (intent.show_customer_notification) {
          responseMessage += "\n\nOur team has been notified and will follow up shortly."
        }
      } catch (error) {
        console.error('❌ AI confirmation failed:', error)
        responseMessage = `Done! I've processed your ${intent.task_type.replace('_', ' ')} request.`
        if (intent.show_customer_notification) {
          responseMessage += " Our team has been notified."
        }
      }

    } else if (intent.intent === 'Collecting' && intent.next_question) {
      console.log('📝 Collecting info for:', intent.task_type)
      responseMessage = intent.next_question

    } else {
      console.log('💬 Generating AI response...')
      try {
        responseMessage = await processMessage(actualUserId, message, recentContext, isNewConversation, fullHistoryContext)
        console.log('✅ AI response generated')
      } catch (error: any) {
        console.error('❌ AI pipeline failed:', error)
        responseMessage = `Thanks for reaching out. I'm having a bit of trouble right now, but I'm here to help. Could you try asking again?`
      }
    }
    
    try {
      await sendMessage({ userId: actualUserId, to: from, message: responseMessage })
      
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
