import { z } from 'zod'
import { generateResponse } from './llm-client'
import { supabaseAdmin } from './supabase'

const IntentSchema = z.object({
  intent: z.enum(['Response', 'Task', 'Collecting']),
  confidence: z.number().min(0).max(1),
  task_type: z.enum(['send_email', 'book_meeting', 'place_order', 'create_order', 'human_handoff']).nullable(),
  status: z.enum(['ready', 'collecting', 'cancelled']),
  missing_info: z.array(z.string()),
  payload: z.record(z.any()).nullable(),
  next_question: z.string().nullable(),
  email_content: z.string().nullable(),
  raw_analysis: z.string()
})

export type IntentResult = z.infer<typeof IntentSchema>

const INTENT_SYSTEM_PROMPT = `You are an intelligent intent classifier that can track multi-message conversations to complete tasks.

ANALYZE the conversation and determine:
1. What the customer wants (intent)
2. What information is still needed
3. Whether to execute the task or keep collecting

TASK TYPES & REQUIRED INFO:
- **send_email**: 
  - To business: customer_name, reason, urgency (optional), email_content
  - To customer: customer_name, customer_email, reason, email_content
- **book_meeting**: customer_name, reason, preferred_date, preferred_time (optional)
- **place_order**: customer_name, items, quantity, customer_phone (optional)
- **create_order**: customer_name, items, quantity, price (if available), customer_phone (optional)
- **human_handoff**: customer_name, reason, urgency (optional)

IMPORTANT: ALWAYS collect customer_name first for ALL task types. Ask "May I have your name?" if not provided.

EMAIL LOGIC:
- "Email me", "Send to my email" = send TO customer (need customer_email)
- "Email your team", "Notify via email" = send TO business (no email needed)

RETURN JSON:
{
  "intent": "Response" | "Task" | "Collecting",
  "confidence": 0.0-1.0,
  "task_type": "send_email" | "book_meeting" | "place_order" | "create_order" | "human_handoff" | null,
  "status": "ready" | "collecting" | "cancelled",
  "missing_info": ["field1", "field2"],
  "payload": {"collected_data": "here"},
  "next_question": "What should I ask next?" | null,
  "email_content": "AI-generated email content based on conversation" | null,
  "raw_analysis": "brief explanation"
}

RULES:
- **Response**: Normal chat, greetings, questions
- **Collecting**: Customer wants task but missing info - ask for missing fields ONE AT A TIME
- **Task**: All required info collected - execute task
- If customer says "stop", "cancel", "never mind" → status: "cancelled"
- ALWAYS ask for customer_name FIRST before other details
- Extract names from conversation (e.g., "I'm John" → customer_name: "John")
- Be patient and helpful while collecting information
- Use conversation history to avoid re-asking for info already provided
- Store ALL collected data in payload as key-value pairs (not empty objects)`

export async function classifyIntent(
  userId: string,
  fromNumber: string,
  message: string,
  conversationHistory: string
): Promise<IntentResult> {
  // Get any active intent session
  const { data: activeIntent } = await supabaseAdmin
    .from('intent_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('from_number', fromNumber)
    .eq('status', 'collecting')
    .single()

  // Get business context
  const { data: botConfig } = await supabaseAdmin
    .from('bot_config')
    .select('business_name, business_email')
    .eq('user_id', userId)
    .single()

  const businessContext = botConfig ? `\nBUSINESS: ${botConfig.business_name || 'Unknown'} (${botConfig.business_email || 'no email'})` : ''

  const prompt = `CONVERSATION HISTORY:
${conversationHistory}

CURRENT MESSAGE: "${message}"

ACTIVE INTENT: ${activeIntent ? JSON.stringify(activeIntent) : 'None'}${businessContext}

Analyze and classify this message in context.`
  
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
    try {
      const response = await generateResponse(prompt, INTENT_SYSTEM_PROMPT)
      const jsonStr = extractJSON(response.content)
      const parsed = JSON.parse(jsonStr)
      
      // Validate with Zod
      const result = IntentSchema.parse(parsed)
      
      // Save/update intent session if collecting or ready
      if (result.intent === 'Collecting' || (result.intent === 'Task' && result.status === 'ready')) {
        await supabaseAdmin
          .from('intent_sessions')
          .upsert({
            user_id: userId,
            from_number: fromNumber,
            task_type: result.task_type,
            status: result.status,
            payload: result.payload || {},
            missing_info: result.missing_info,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,from_number'
          })
      }
      
      // Clear session if cancelled or completed
      if (result.status === 'cancelled' || result.status === 'ready') {
        await supabaseAdmin
          .from('intent_sessions')
          .delete()
          .eq('user_id', userId)
          .eq('from_number', fromNumber)
      }
      
      return result
    } catch (error) {
      attempts++
      console.error(`Intent classification attempt ${attempts} failed:`, error)
      
      if (attempts >= maxAttempts) {
        return {
          intent: 'Response',
          confidence: 0.1,
          task_type: null,
          status: 'cancelled',
          missing_info: [],
          payload: null,
          next_question: null,
          email_content: null,
          raw_analysis: 'Classification failed, using fallback'
        }
      }
    }
  }
  
  throw new Error('Intent classification failed after all attempts')
}

function extractJSON(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }
  return text.trim()
}

export function getTaskAcknowledgment(taskType: string, payload?: any): string {
  return ''
}