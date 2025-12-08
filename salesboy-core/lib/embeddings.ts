import OpenAI from 'openai'

const mistral = process.env.MISTRAL_API_KEY ? new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1'
}) : null

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Mistral embeddings (1536 dimensions, same as OpenAI)
  if (mistral) {
    try {
      const response = await mistral.embeddings.create({
        model: 'mistral-embed',
        input: text
      })
      return response.data[0].embedding
    } catch (error) {
      console.error('Mistral embedding failed:', error)
      throw error
    }
  }
  
  throw new Error('MISTRAL_API_KEY not configured')
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