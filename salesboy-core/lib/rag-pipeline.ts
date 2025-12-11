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
  
  // ALWAYS fetch ALL products for sales context
  const { data: allProducts } = await supabaseAdmin
    .from('product_catalog')
    .select('*')
    .eq('user_id', userId)
    .order('product_name', { ascending: true })
  
  let productContext = ''
  if (allProducts && allProducts.length > 0) {
    productContext = `\n\nAVAILABLE PRODUCTS (You MUST use this to answer product questions):\n${allProducts.map((p: any) => 
      `- ${p.product_name}: ₦${p.price.toLocaleString()} ${p.in_stock ? '✅ In Stock' : '❌ Out of Stock'}${p.category ? ` [${p.category}]` : ''}${p.description ? ` - ${p.description}` : ''}`
    ).join('\n')}\n\nIMPORTANT: Proactively recommend products based on customer needs. Act as a sales agent.`
  }
  
  // Build enhanced system prompt with business context
  let enhancedPrompt = botConfig?.system_prompt || 'You are a professional sales agent.'
  
  // Add sales agent behavior
  enhancedPrompt += `\n\nYOU ARE A SALES AGENT:\n- Proactively recommend products from the catalog\n- Know ALL product prices, availability, and details\n- Suggest alternatives when products are out of stock\n- Upsell and cross-sell when appropriate\n- Be helpful, friendly, and persuasive`
  
  if (botConfig?.business_name || botConfig?.business_email) {
    const businessContext = `\n\nBUSINESS CONTEXT:\n- You represent: ${botConfig.business_name || 'this business'}\n- Business email: ${botConfig.business_email || 'not provided'}`
    enhancedPrompt += businessContext
  }
  
  enhancedPrompt += productContext
  
  console.log('📊 Products loaded:', allProducts?.length || 0)
  
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