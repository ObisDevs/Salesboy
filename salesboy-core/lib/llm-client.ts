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
  // Try Mistral first (fastest and cheapest)
  if (mistral) {
    try {
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

      return {
        content: completion.choices[0].message.content || '',
        provider: 'mistral'
      }
    } catch (error) {
      console.error('Mistral failed:', error)
    }
  }

  // Try Gemini second
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ 
        model: 'gemini-pro',
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
      
      return {
        content: response.text(),
        provider: 'gemini'
      }
    } catch (error) {
      console.error('Gemini failed:', error)
    }
  }

  // Fallback to OpenAI
  if (openai) {
    try {
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

      return {
        content: completion.choices[0].message.content || '',
        provider: 'openai'
      }
    } catch (error) {
      console.error('OpenAI failed:', error)
    }
  }
  
  throw new Error('All LLM providers failed')
}