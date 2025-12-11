import { z } from 'zod'
import { generateResponse } from './llm-client'
import { supabaseAdmin } from './supabase'

const IntentSchema = z.object({
  intent: z.enum(['Response', 'Task', 'Collecting', 'Inquiry']),
  confidence: z.number().min(0).max(1),
  task_type: z.enum(['inquiry', 'send_email', 'book_meeting', 'place_order', 'create_order', 'human_handoff']).nullable(),
  status: z.enum(['ready', 'collecting', 'cancelled']),
  missing_info: z.array(z.string()),
  payload: z.record(z.any()).nullable(),
  next_question: z.string().nullable(),
  email_content: z.string().nullable(),
  raw_analysis: z.string(),
  notify_owner: z.boolean().default(true),
  show_customer_notification: z.boolean().default(false)
})

export type IntentResult = z.infer<typeof IntentSchema>

const INTENT_SYSTEM_PROMPT = `You are an intelligent intent classifier that tracks conversations and notifies business owners.

ANALYZE the conversation and determine:
1. What the customer wants (intent)
2. Whether to notify the business owner
3. Whether to show "team notified" message to customer

INTENT TYPES:
- **Inquiry**: Customer asking about products, prices, availability (NO fields required)
- **Task**: Customer wants to book, order, or request something (fields required)
- **Collecting**: Gathering required info for a task
- **Response**: Normal chat, greetings

TASK TYPES & REQUIRED INFO:
- **inquiry**: Customer asking questions (NO fields required, notify_owner: true, show_customer_notification: false)
  Examples: "How much is X?", "Is X available?", "What colors?"
  
- **book_meeting**: customer_name (REQUIRED), customer_email (REQUIRED), reason, preferred_date, preferred_time (optional)
  notify_owner: true, show_customer_notification: true
  
- **place_order**: customer_name (REQUIRED), customer_email (REQUIRED), items, quantity, delivery_address (REQUIRED)
  notify_owner: true, show_customer_notification: true
  
- **create_order**: customer_name (REQUIRED), customer_email (REQUIRED), items, quantity, price, delivery_address (REQUIRED)
  notify_owner: true, show_customer_notification: true
  
- **send_email**: customer_name (REQUIRED), customer_email (REQUIRED), reason, email_content
  notify_owner: true, show_customer_notification: true
  
- **human_handoff**: customer_name (REQUIRED), customer_email (REQUIRED), reason, urgency (optional)
  notify_owner: true, show_customer_notification: true

CRITICAL RULES:
1. NEVER mark task as "ready" if customer_name is "Not provided" or missing
2. NEVER mark task as "ready" if customer_email is "Not provided" or missing
3. For orders: NEVER mark as "ready" if delivery_address is missing
4. ALWAYS ask for missing info explicitly
5. Extract info from conversation history if already provided
6. Do NOT use placeholders - keep status as "collecting" until real data is provided

NOTIFICATION LOGIC:
- **Inquiry** (notify_owner: true, show_customer_notification: false)
  Customer gets answer, owner gets notified silently
  
- **Task** (notify_owner: true, show_customer_notification: true)
  Customer sees "team notified", owner gets full details

RETURN JSON:
{
  "intent": "Response" | "Task" | "Collecting" | "Inquiry",
  "confidence": 0.0-1.0,
  "task_type": "inquiry" | "send_email" | "book_meeting" | "place_order" | "create_order" | "human_handoff" | null,
  "status": "ready" | "collecting" | "cancelled",
  "missing_info": ["field1", "field2"],
  "payload": {"collected_data": "here", "inquiry_question": "what they asked"},
  "next_question": "What should I ask next?" | null,
  "email_content": "AI-generated email content" | null,
  "raw_analysis": "brief explanation",
  "notify_owner": true (always true for Inquiry and Task),
  "show_customer_notification": false (false for Inquiry, true for Task)
}

VALIDATION RULES:
- **Response**: Normal chat, greetings (notify_owner: false, show_customer_notification: false)
- **Inquiry**: Questions about products/prices (notify_owner: true, show_customer_notification: false)
- **Collecting**: Missing required info (notify_owner: false, show_customer_notification: false)
- **Task**: All required fields collected (notify_owner: true, show_customer_notification: true)

COLLECTION ORDER:
1. customer_name (FIRST - always required for tasks)
2. customer_email (SECOND - always required for tasks)
3. delivery_address (THIRD - only for orders)
4. Other task-specific fields

EXTRACTION:
- Extract from conversation: "I'm John" → customer_name: "John"
- Extract email: "john@example.com" → customer_email: "john@example.com"
- Extract address: "123 Main St, Lagos" → delivery_address: "123 Main St, Lagos"
- Use conversation history to avoid re-asking
- Store ALL collected data in payload as key-value pairs

NEVER PROCEED TO "ready" STATUS WITH:
- customer_name: "Not provided"
- customer_email: "Not provided"
- delivery_address: "Not provided" (for orders)
- Empty or missing required fields`

export async function classifyIntent(
  userId: string,
  fromNumber: string,
  message: string,
  conversationHistory: string
): Promise<IntentResult> {
  const { data: activeIntent } = await supabaseAdmin
    .from('intent_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('from_number', fromNumber)
    .eq('status', 'collecting')
    .single()

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
      
      const result = IntentSchema.parse(parsed)
      
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
          raw_analysis: 'Classification failed, using fallback',
          notify_owner: false,
          show_customer_notification: false
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
