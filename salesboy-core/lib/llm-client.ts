import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

// Mistral via OpenAI-compatible API
const mistral = process.env.MISTRAL_API_KEY ? new OpenAI({ 
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1'
}) : null

export interface LLMResponse {
  content: string
  provider: 'mistral' | 'gemini' | 'openai'
}

export async function generateResponse(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.7
): Promise<LLMResponse> {
  const errors: string[] = []
  
  // Try Mistral first (fastest and cheapest)
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
        temperature: temperature,
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

  // Try Gemini second
  if (gemini) {
    try {
      console.log('🟢 Trying Gemini...')
      const model = gemini.getGenerativeModel({ 
        model: 'models/gemini-pro',
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 500,
          topP: 0.9,
          topK: 40
        }
      })
      
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
      
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      
      console.log('✅ Gemini succeeded')
      return {
        content: response.text(),
        provider: 'gemini'
      }
    } catch (error: any) {
      const errMsg = `Gemini: ${error.message}`
      console.error('❌', errMsg)
      errors.push(errMsg)
    }
  } else {
    errors.push('Gemini: API key not configured')
  }

  // Fallback to OpenAI
  if (openai) {
    try {
      console.log('🟠 Trying OpenAI...')
      const messages: any[] = []
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: temperature,
        max_tokens: 500
      })

      console.log('✅ OpenAI succeeded')
      return {
        content: completion.choices[0].message.content || '',
        provider: 'openai'
      }
    } catch (error: any) {
      const errMsg = `OpenAI: ${error.message}`
      console.error('❌', errMsg)
      errors.push(errMsg)
    }
  } else {
    errors.push('OpenAI: API key not configured')
  }
  
  const errorDetails = errors.join(' | ')
  console.error('🔴 All providers failed:', errorDetails)
  throw new Error(`All LLM providers failed: ${errorDetails}`)
}