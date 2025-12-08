import { z } from 'zod'
import { generateResponse } from './llm-client'

const IntentSchema = z.object({
  intent: z.enum(['Response', 'Task']),
  confidence: z.number().min(0).max(1),
  task_type: z.enum(['send_email']).nullable(),
  payload: z.record(z.any()).nullable(),
  raw_analysis: z.string()
})

export type IntentResult = z.infer<typeof IntentSchema>

const INTENT_SYSTEM_PROMPT = `You are a simple intent classifier. Your ONLY job: detect if customer wants to receive an EMAIL.

RETURN ONLY THIS JSON:
{
  "intent": "Response" | "Task",
  "confidence": 0.0-1.0,
  "task_type": "send_email" | null,
  "payload": {"email": "user@example.com", "subject": "what they want"} | null,
  "raw_analysis": "brief note"
}

RULES:

**Task (send_email)** - ONLY when customer explicitly wants email:
- "Email me the catalog"
- "Send me details via email"
- "Can you email that to me?"
- "Forward the info to my email"
- Must mention: email, send, forward, mail

**Response** - Everything else:
- All questions
- All greetings
- All product inquiries
- All general chat

EXAMPLES:
"Email me your product list" → Task: send_email
"Send catalog to my email" → Task: send_email
"What's your email?" → Response (they're asking, not requesting)
"How much is this?" → Response
"Hi" → Response

DEFAULT TO RESPONSE. Only use Task if they explicitly want an EMAIL sent to them.`

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
        // Fallback to Response
        return {
          intent: 'Response',
          confidence: 0.1,
          task_type: null,
          payload: null,
          raw_analysis: 'Classification failed, using fallback'
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