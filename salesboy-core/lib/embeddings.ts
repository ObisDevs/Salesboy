// Pad vector to 1536 dimensions
function padTo1536(vector: number[]): number[] {
  if (vector.length === 1536) return vector
  if (vector.length > 1536) return vector.slice(0, 1536)
  return [...vector, ...new Array(1536 - vector.length).fill(0)]
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Hugging Face Inference API (free, no key needed for public models)
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: text })
      }
    )
    
    if (response.ok) {
      const embedding = await response.json()
      // all-MiniLM-L6-v2 produces 384 dimensions, pad to 1536
      return padTo1536(embedding)
    }
    
    const errorText = await response.text()
    console.error('Hugging Face error:', errorText)
  } catch (error) {
    console.error('Hugging Face failed:', error)
  }

  // Fallback: Use Jina AI (free, no key needed)
  try {
    const response = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: [text],
        model: 'jina-embeddings-v2-base-en'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      const embedding = data.data[0].embedding
      return padTo1536(embedding)
    }
  } catch (error) {
    console.error('Jina AI failed:', error)
  }

  throw new Error('All embedding providers failed. Please check your internet connection.')
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