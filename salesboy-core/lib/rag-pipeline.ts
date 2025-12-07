import { generateEmbedding } from './embeddings'
import { queryVectors } from './pinecone'
import { generateResponse } from './llm-client'
import { supabaseAdmin } from './supabase'

export interface RAGContext {
  chunks: Array<{
    text: string
    filename: string
    relevance: number
  }>
  systemPrompt: string
}

export async function retrieveContext(
  userId: string,
  query: string,
  topK: number = 5
): Promise<RAGContext> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query)
  
  // Search Pinecone
  const searchResults = await queryVectors(userId, queryEmbedding, topK)
  
  // Get user's bot config
  const { data: botConfig } = await supabaseAdmin
    .from('bot_config')
    .select('system_prompt, metadata')
    .eq('user_id', userId)
    .single()
  
  const chunks = searchResults.matches?.map(match => ({
    text: match.metadata?.text as string || '',
    filename: match.metadata?.filename as string || '',
    relevance: match.score || 0
  })) || []
  
  return {
    chunks,
    systemPrompt: botConfig?.system_prompt || 'You are a helpful business assistant.'
  }
}

export async function generateRAGResponse(
  userId: string,
  message: string,
  context: RAGContext
): Promise<string> {
  const contextText = context.chunks
    .map(chunk => `[${chunk.filename}]: ${chunk.text}`)
    .join('\n\n')
  
  const prompt = `Context from knowledge base:
${contextText}

User message: ${message}

Please provide a helpful response based on the context above. If the context doesn't contain relevant information, say so politely.`

  const response = await generateResponse(prompt, context.systemPrompt)
  return response.content
}

export async function processMessage(
  userId: string,
  message: string
): Promise<string> {
  try {
    const context = await retrieveContext(userId, message)
    return await generateRAGResponse(userId, message, context)
  } catch (error) {
    console.error('RAG pipeline error:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again or contact support.'
  }
}