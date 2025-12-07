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

const INTENT_SYSTEM_PROMPT = `You are an intent classifier for a business WhatsApp AI assistant. Analyze the message and classify the intent.

Return ONLY valid JSON with this exact structure:
{
  "intent": "Response" | "Task" | "HumanHandoff",
  "confidence": 0.0-1.0,
  "task_type": "send_email" | "book_calendar" | "create_order" | null,
  "payload": {...} | null,
  "raw_analysis": "brief explanation"
}

Intent Guidelines:
- Response: General questions, greetings, information requests
- Task: Specific actions like booking, ordering, emailing
- HumanHandoff: Complex issues, complaints, unclear requests

Task Types:
- send_email: When user wants to send an email
- book_calendar: When user wants to schedule something
- create_order: When user wants to place an order
- null: For Response or HumanHandoff intents`

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