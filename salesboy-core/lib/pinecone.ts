import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = process.env.PINECONE_API_KEY ? new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
}) : null

const index = pinecone && process.env.PINECONE_INDEX_NAME ? pinecone.index(process.env.PINECONE_INDEX_NAME) : null

export interface VectorMetadata {
  user_id: string
  filename: string
  chunk_index: number
  text: string
  [key: string]: any
}

export async function upsertVectors(
  userId: string,
  vectors: Array<{
    id: string
    values: number[]
    metadata: VectorMetadata
  }>
) {
  if (!index) throw new Error('Pinecone not configured')
  return await index.namespace(`user_${userId}`).upsert(vectors)
}

export async function queryVectors(
  userId: string,
  queryVector: number[],
  topK: number = 5
) {
  if (!index) throw new Error('Pinecone not configured')
  return await index.namespace(`user_${userId}`).query({
    vector: queryVector,
    topK,
    includeMetadata: true
  })
}

export async function deleteVectors(userId: string, ids: string[]) {
  if (!index) throw new Error('Pinecone not configured')
  return await index.namespace(`user_${userId}`).deleteMany(ids)
}

export async function clearAllVectors(userId: string) {
  if (!index) throw new Error('Pinecone not configured')
  return await index.namespace(`user_${userId}`).deleteAll()
}