import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export interface LLMResponse {
  content: string
  provider: 'gemini' | 'openai'
}

export async function generateResponse(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.7
): Promise<LLMResponse> {
  // Try Gemini first
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

  // Fallback to OpenAI
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
    throw new Error('All LLM providers failed')
  }
}