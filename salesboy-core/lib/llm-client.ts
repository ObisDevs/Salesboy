import OpenAI from 'openai'
import Groq from 'groq-sdk'

// Mistral (Primary - fast & cheap)
const mistral = process.env.MISTRAL_API_KEY ? new OpenAI({ 
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1'
}) : null

// Groq (Fallback - ultra fast & free)
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null

export interface LLMResponse {
  content: string
  provider: 'mistral' | 'groq'
}

export async function generateResponse(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.7
): Promise<LLMResponse> {
  const errors: string[] = []
  
  // Try Mistral first (primary - fast & cheap)
  if (mistral) {
    try {
      console.log('🔵 Trying Mistral...')
      const messages: any[] = []
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const completion = await mistral.chat.completions.create({
        model: 'mistral-small-latest',
        messages,
        temperature,
        max_tokens: 500
      })

      console.log('✅ Mistral succeeded')
      return {
        content: completion.choices[0].message.content || '',
        provider: 'mistral'
      }
    } catch (error: any) {
      const errMsg = `Mistral: ${error.message}`
      console.error('❌', errMsg)
      errors.push(errMsg)
    }
  } else {
    errors.push('Mistral: API key not configured')
  }

  // Try Groq as fallback (ultra fast & free)
  if (groq) {
    try {
      console.log('🟢 Trying Groq...')
      const messages: any[] = []
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature,
        max_tokens: 500
      })

      console.log('✅ Groq succeeded')
      return {
        content: completion.choices[0].message.content || '',
        provider: 'groq'
      }
    } catch (error: any) {
      const errMsg = `Groq: ${error.message}`
      console.error('❌', errMsg)
      errors.push(errMsg)
    }
  } else {
    errors.push('Groq: API key not configured')
  }
  
  const errorDetails = errors.join(' | ')
  console.error('🔴 All providers failed:', errorDetails)
  throw new Error(`All LLM providers failed: ${errorDetails}`)
}