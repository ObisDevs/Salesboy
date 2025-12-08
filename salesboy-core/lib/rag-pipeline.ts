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
  
  const defaultPrompt = `You are a friendly, intelligent AI sales assistant for a Nigerian business.

Your personality:
- Warm and welcoming (use Nigerian expressions naturally)
- Professional but conversational
- Helpful and knowledgeable
- Quick to respond, concise but complete

Your capabilities:
- Answer questions about products, prices, and services
- Provide business information (hours, location, delivery)
- Help customers make informed decisions
- Use the knowledge base to give accurate information

How to respond:
1. Greet warmly if it's a greeting ("Hello! How can I help you today?")
2. Answer questions directly and clearly
3. Use emojis sparingly but naturally 😊
4. If you don't know something, be honest: "Let me connect you with someone who can help with that!"
5. Keep responses under 3-4 sentences unless more detail is needed
6. Use Nigerian English naturally ("How far?", "No wahala", etc.)

NEVER:
- Say you've "notified the team" unless it's actually a complaint
- Be overly formal or robotic
- Give long explanations for simple questions
- Apologize excessively`
  
  return {
    chunks,
    systemPrompt: botConfig?.system_prompt || defaultPrompt
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
  
  // Build prompt with conversation context
  let contextSection = ''
  
  if (conversationContext) {
    contextSection = `Recent conversation:
${conversationContext}

---

`
  }
  
  if (hasContext) {
    prompt = `${contextSection}Knowledge base information:
${contextText}

---

Customer's latest message: ${message}

Respond naturally and helpfully. Use the knowledge base if relevant. Keep the conversation flowing naturally. Be warm and professional.`
  } else {
    prompt = `${contextSection}Customer's latest message: ${message}

Respond naturally and helpfully:
- If it's a greeting, respond warmly and ask how you can help
- If it's a question, answer with your knowledge
- If it's about products/services, be helpful and engaging
- Keep it conversational and friendly
- Use Nigerian expressions naturally when appropriate`
  }

  const response = await generateResponse(prompt, context.systemPrompt, temperature || 0.7)
  
  // Clean up response
  let cleanedResponse = response.content.trim()
  
  // Remove any "I've notified" phrases if this isn't actually a handoff
  if (!message.toLowerCase().includes('refund') && 
      !message.toLowerCase().includes('complaint') && 
      !message.toLowerCase().includes('broken')) {
    cleanedResponse = cleanedResponse.replace(/I'?ve notified (our|the) team.*?\./gi, '')
    cleanedResponse = cleanedResponse.replace(/Someone will get back to you.*?\./gi, '')
  }
  
  return cleanedResponse.trim()
}

export async function processMessage(
  userId: string,
  message: string,
  conversationContext?: string
): Promise<string> {
  try {
    const context = await retrieveContext(userId, message)
    
    // Get bot config for temperature
    const { data: botConfig } = await supabaseAdmin
      .from('bot_config')
      .select('temperature')
      .eq('user_id', userId)
      .single()
    
    const temperature = botConfig?.temperature || 0.7
    
    return await generateRAGResponse(userId, message, context, temperature, conversationContext)
  } catch (error) {
    console.error('RAG pipeline error:', error)
    throw error
  }
}