import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use OpenAI text-embedding-3-small (1536 dimensions)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('OpenAI embedding failed:', error)
    throw new Error('Failed to generate embeddings: ' + (error as any).message)
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