import { GoogleGenerativeAI } from '@google/generative-ai'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Pad vector to 1536 dimensions
function padTo1536(vector: number[]): number[] {
  if (vector.length === 1536) return vector
  if (vector.length > 1536) return vector.slice(0, 1536)
  return [...vector, ...new Array(1536 - vector.length).fill(0)]
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Try Voyage AI first (free, 1536 dimensions)
  try {
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VOYAGE_API_KEY || 'pa-'}`
      },
      body: JSON.stringify({
        input: text,
        model: 'voyage-2'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.data[0].embedding
    }
  } catch (error) {
    console.log('Voyage AI failed, trying Gemini:', error)
  }

  // Fallback to Gemini (768 dimensions, padded to 1536)
  try {
    const model = gemini.getGenerativeModel({ model: 'embedding-001' })
    const result = await model.embedContent(text)
    const embedding = result.embedding.values
    return padTo1536(embedding)
  } catch (error) {
    console.error('Gemini embedding failed:', error)
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