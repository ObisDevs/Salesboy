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

const INTENT_SYSTEM_PROMPT = `You are an intent classifier for a Nigerian business WhatsApp AI assistant. Analyze the message and classify the intent.

Return ONLY valid JSON with this exact structure:
{
  "intent": "Response" | "Task" | "HumanHandoff",
  "confidence": 0.0-1.0,
  "task_type": "send_email" | "book_calendar" | "create_order" | "human_handoff" | null,
  "payload": {...} | null,
  "raw_analysis": "brief explanation"
}

Intent Guidelines:
- Response: General questions, product inquiries, greetings, information requests, price checks
- Task: Specific actionable requests that require external systems
- HumanHandoff: Complex issues, complaints, refund requests, unclear/ambiguous requests

Task Types:
- send_email: User explicitly wants to send an email or contact via email
- book_calendar: User wants to schedule appointment, book a meeting, set a reminder
- create_order: User wants to place an order, buy a product, make a purchase
- human_handoff: User needs human assistance, has complaint, or request is too complex
- null: For Response intents (questions that can be answered directly)

Payload Structure:
For create_order: { "product": "product name", "quantity": number, "notes": "any special requests" }
For book_calendar: { "date": "preferred date/time", "purpose": "reason for booking" }
For send_email: { "subject": "email subject", "message": "email content" }
For human_handoff: { "reason": "why human is needed", "urgency": "low|medium|high" }

Examples:
- "How much is iPhone 14?" → Response (product inquiry)
- "I want to buy 2 iPhone 14" → Task: create_order
- "Can I schedule a meeting tomorrow?" → Task: book_calendar
- "I want a refund" → HumanHandoff
- "What are your business hours?" → Response`

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