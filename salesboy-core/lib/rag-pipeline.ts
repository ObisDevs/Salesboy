import { generateEmbedding } from './embeddings'
import { queryVectors } from './pinecone'
import { generateResponse } from './llm-client'
import { supabaseAdmin } from './supabase'
import { searchProducts } from './product-search'

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
  console.log('🔍 Retrieving context for query:', query.substring(0, 50))
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query)
  console.log('✅ Query embedding generated:', queryEmbedding.length, 'dimensions')
  
  // Search Pinecone
  const searchResults = await queryVectors(userId, queryEmbedding, topK)
  console.log('📊 Pinecone results:', {
    matches: searchResults.matches?.length || 0,
    namespace: `user_${userId}`,
    topScores: searchResults.matches?.slice(0, 3).map(m => m.score)
  })
  
  // Get user's bot config with business info
  const { data: botConfig } = await supabaseAdmin
    .from('bot_config')
    .select('system_prompt, business_name, business_email, metadata')
    .eq('user_id', userId)
    .single()
  
  const chunks = searchResults.matches?.map(match => ({
    text: match.metadata?.text as string || '',
    filename: match.metadata?.filename as string || '',
    relevance: match.score || 0
  })) || []
  
  console.log('📚 Knowledge base chunks:', chunks.length, 'chunks retrieved')
  if (chunks.length > 0) {
    console.log('Top chunk preview:', chunks[0].text.substring(0, 100))
  }
  
  console.log('Bot config in retrieveContext:', { hasConfig: !!botConfig, prompt: botConfig?.system_prompt?.substring(0, 50) })
  
  // Search for relevant products
  const products = await searchProducts(userId, query)
  let productContext = ''
  if (products.length > 0) {
    productContext = `\n\nPRODUCT CATALOG:\n${products.map(p => 
      `- ${p.product_name}: $${p.price} ${p.in_stock ? '(In Stock)' : '(Out of Stock)'}${p.description ? ' - ' + p.description : ''}`
    ).join('\n')}`
  }
  
  // Build enhanced system prompt with business context
  let enhancedPrompt = botConfig?.system_prompt || 'You are a helpful AI assistant.'
  
  if (botConfig?.business_name || botConfig?.business_email) {
    const businessContext = `\n\nBUSINESS CONTEXT:\n- You represent: ${botConfig.business_name || 'this business'}\n- Business email: ${botConfig.business_email || 'not provided'}\n- When customers want to contact the business, use this email\n- When sending info TO customers, ask for their email first`
    enhancedPrompt += businessContext
  }
  
  enhancedPrompt += productContext
  
  return {
    chunks,
    systemPrompt: enhancedPrompt
  }
}

export async function generateRAGResponse(
  userId: string,
  message: string,
  context: RAGContext,
  temperature?: number,
  conversationContext?: string
): Promise<string> {
  const contextText = context.chunks
    .map(chunk => `[${chunk.filename}]: ${chunk.text}`)
    .join('\n\n')
  
  const hasContext = context.chunks.length > 0 && context.chunks[0].text
  
  let prompt: string
  let contextSection = ''
  
  if (conversationContext) {
    contextSection = `Recent conversation:
${conversationContext}

`
  }
  
  if (hasContext) {
    prompt = `${contextSection}Knowledge base:
${contextText}

Customer: ${message}

Respond helpfully using the knowledge base.`
  } else {
    prompt = `${contextSection}Customer: ${message}

Respond helpfully.`
  }

  const response = await generateResponse(prompt, context.systemPrompt, temperature || 0.7)
  
  // Clean up response - remove placeholders
  let cleanedResponse = response.content.trim()
  cleanedResponse = cleanedResponse.replace(/\[Your Name\]/g, '')
  cleanedResponse = cleanedResponse.replace(/\[Name\]/g, '')
  cleanedResponse = cleanedResponse.replace(/Best regards,\s*/g, '')
  cleanedResponse = cleanedResponse.replace(/Sincerely,\s*/g, '')
  
  return cleanedResponse.trim()
}

export async function processMessage(
  userId: string,
  message: string,
  conversationContext?: string
): Promise<string> {
  try {
    // Get bot config with business info
    const { data: botConfig } = await supabaseAdmin
      .from('bot_config')
      .select('system_prompt, temperature, business_name, business_email')
      .eq('user_id', userId)
      .single()
    
    console.log('Bot config fetched:', { hasConfig: !!botConfig, prompt: botConfig?.system_prompt?.substring(0, 50) })
    
    const temperature = botConfig?.temperature || 0.7
    const systemPrompt = botConfig?.system_prompt || 'You are a helpful AI assistant.'
    
    // Try to get knowledge base context, but don't fail if embeddings fail
    let context: RAGContext
    try {
      context = await retrieveContext(userId, message)
    } catch (error) {
      console.log('Knowledge base unavailable, using direct AI response')
      context = {
        chunks: [],
        systemPrompt
      }
    }
    
    return await generateRAGResponse(userId, message, context, temperature, conversationContext)
  } catch (error) {
    console.error('RAG pipeline error:', error)
    throw error
  }
}