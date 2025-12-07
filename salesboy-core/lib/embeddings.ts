import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function generateEmbedding(text: string): Promise<number[]> {
  // Try Gemini first
  try {
    const model = gemini.getGenerativeModel({ model: 'embedding-001' })
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error('Gemini embedding failed:', error)
  }

  // Fallback to OpenAI
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('OpenAI embedding failed:', error)
    throw new Error('All embedding providers failed')
  }
}

export function chunkText(text: string, maxTokens: number = 500): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const sentence of sentences) {
    const testChunk = currentChunk + sentence + '. '
    
    // Rough token estimation (1 token ≈ 4 characters)
    if (testChunk.length / 4 > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence + '. '
    } else {
      currentChunk = testChunk
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}