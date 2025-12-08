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
  
  const defaultPrompt = `You are a helpful AI assistant for a Nigerian business. You help customers with:
- Product information and pricing
- Business hours and location
- General inquiries about services
- Answering questions based on the knowledge base

Be friendly, professional, and concise. Use Nigerian English where appropriate. If you don't know something, say so politely and offer to connect them with a human agent.`
  
  return {
    chunks,
    systemPrompt: botConfig?.system_prompt || defaultPrompt
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
  
  const hasContext = context.chunks.length > 0 && context.chunks[0].text
  
  const prompt = hasContext
    ? `Context from knowledge base:
${contextText}

Customer message: ${message}

Provide a helpful, friendly response based on the context above. If the context doesn't fully answer the question, use your general knowledge but mention that you're providing general information.`
    : `Customer message: ${message}

No specific information found in the knowledge base. Provide a helpful, friendly response using your general knowledge. Be honest that you don't have specific details and offer to connect them with someone who can help if needed.`

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