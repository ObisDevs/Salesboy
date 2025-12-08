// Simple hash function for text
function simpleHash(str: string, seed: number): number {
  let hash = seed
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}

// Generate deterministic embedding from text
function generateLocalEmbedding(text: string): number[] {
  const embedding: number[] = []
  const normalized = text.toLowerCase().trim()
  
  // Generate 1536 dimensions using multiple hash seeds
  for (let i = 0; i < 1536; i++) {
    const hash = simpleHash(normalized, i)
    // Normalize to [-1, 1] range
    const value = (hash % 2000) / 1000 - 1
    embedding.push(value)
  }
  
  // Normalize vector to unit length
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use local embedding generation (always works, no API needed)
  try {
    return generateLocalEmbedding(text)
  } catch (error) {
    console.error('Local embedding failed:', error)
    throw new Error('Failed to generate embeddings')
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