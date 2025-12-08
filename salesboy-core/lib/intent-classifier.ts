import { z } from 'zod'
import { generateResponse } from './llm-client'

const IntentSchema = z.object({
  intent: z.enum(['Response', 'Task', 'HumanHandoff']),
  confidence: z.number().min(0).max(1),
  task_type: z.string().nullable(),
  payload: z.record(z.any()).nullable(),
  raw_analysis: z.string()
})

export type IntentResult = z.infer<typeof IntentSchema>

const INTENT_SYSTEM_PROMPT = `You are an expert intent classifier for a Nigerian business WhatsApp AI assistant.

Your job: Analyze the customer's message and determine the BEST intent.

RETURN ONLY THIS JSON (no markdown, no explanation):
{
  "intent": "Response" | "Task" | "HumanHandoff",
  "confidence": 0.0-1.0,
  "task_type": "send_email" | "book_calendar" | "create_order" | null,
  "payload": {...} | null,
  "raw_analysis": "brief explanation"
}

🎯 INTENT RULES (FOLLOW STRICTLY):

1. **Response** (90% of messages) - Use for:
   ✅ Greetings: "Hi", "Hello", "Good morning", "Hey"
   ✅ Questions: "What products?", "How much?", "Do you have?"
   ✅ Information requests: "Business hours?", "Location?", "Delivery?"
   ✅ Product inquiries: "Tell me about X", "Features of Y"
   ✅ Price checks: "How much is X?", "What's the price?"
   ✅ General chat: "Thanks", "Okay", "I see"
   ✅ Browsing: "Show me", "What do you have?"

2. **Task** (5% of messages) - ONLY for EXPLICIT action requests:
   ✅ create_order: "I want to BUY", "Place order for", "I'll take 2 of X"
   ✅ book_calendar: "Schedule a meeting", "Book appointment for", "Set reminder"
   ✅ send_email: "Email me the catalog", "Send invoice to my email"
   ❌ NOT for: "How much?", "Do you have?", "Tell me about"

3. **HumanHandoff** (5% of messages) - ONLY for:
   ✅ Complaints: "This is broken", "Not working", "Poor quality"
   ✅ Refunds: "I want my money back", "Refund please"
   ✅ Escalations: "Speak to manager", "Talk to human"
   ✅ Urgent issues: "Emergency", "Urgent help needed"
   ❌ NOT for: Simple questions, greetings, product inquiries

📋 EXAMPLES:

"Hi" → Response (greeting, confidence: 1.0)
"Hello there" → Response (greeting, confidence: 1.0)
"Good morning" → Response (greeting, confidence: 1.0)
"How much is iPhone 14?" → Response (price inquiry, confidence: 0.95)
"What products do you have?" → Response (product inquiry, confidence: 0.95)
"Tell me about your services" → Response (information request, confidence: 0.95)
"Do you have Samsung phones?" → Response (product availability, confidence: 0.95)
"I want to buy 2 iPhone 14 Pro" → Task: create_order (explicit purchase, confidence: 0.9)
"Place an order for 3 laptops" → Task: create_order (explicit order, confidence: 0.9)
"Schedule a meeting tomorrow 2pm" → Task: book_calendar (explicit booking, confidence: 0.9)
"This product is broken, I want refund" → HumanHandoff (complaint + refund, confidence: 0.85)
"Speak to your manager now" → HumanHandoff (escalation, confidence: 0.9)

⚠️ CRITICAL RULES:
- Default to "Response" when unsure
- "Hi", "Hello", "Hey" = ALWAYS Response
- Questions = ALWAYS Response
- Only use Task when user explicitly wants to DO something (buy, book, send)
- Only use HumanHandoff for serious issues (complaints, refunds, escalations)
- Confidence > 0.8 for clear intents, 0.5-0.8 for ambiguous

BE SMART. THINK CAREFULLY. DEFAULT TO RESPONSE.`

export async function classifyIntent(message: string): Promise<IntentResult> {
  const prompt = `Classify this message: "${message}"`
  
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
    try {
      const response = await generateResponse(prompt, INTENT_SYSTEM_PROMPT)
      const jsonStr = extractJSON(response.content)
      const parsed = JSON.parse(jsonStr)
      
      // Validate with Zod
      return IntentSchema.parse(parsed)
    } catch (error) {
      attempts++
      console.error(`Intent classification attempt ${attempts} failed:`, error)
      
      if (attempts >= maxAttempts) {
        // Fallback to human handoff
        return {
          intent: 'HumanHandoff',
          confidence: 0.1,
          task_type: null,
          payload: null,
          raw_analysis: 'Classification failed, routing to human'
        }
      }
    }
  }
  
  throw new Error('Intent classification failed after all attempts')
}

function extractJSON(text: string): string {
  // Try to find JSON in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }
  
  // If no JSON found, assume the entire text is JSON
  return text.trim()
}