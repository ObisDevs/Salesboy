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
  temperature?: number
): Promise<string> {
  const contextText = context.chunks
    .map(chunk => `[${chunk.filename}]: ${chunk.text}`)
    .join('\n\n')
  
  const hasContext = context.chunks.length > 0 && context.chunks[0].text
  
  let prompt: string
  
  if (hasContext) {
    prompt = `You have access to this information from the business knowledge base:

${contextText}

---

Customer: ${message}

Respond naturally using the information above. Be conversational and helpful. If the knowledge base has the answer, use it confidently. If not, use your general knowledge or offer to help them connect with someone.`
  } else {
    // No knowledge base context - handle intelligently
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/)) {
      prompt = `Customer: ${message}

This is a greeting. Respond warmly and ask how you can help. Be friendly and welcoming. Keep it brief (1-2 sentences).`
    } else {
      prompt = `Customer: ${message}

No specific information in the knowledge base for this query. Respond helpfully:
- If it's a general question, answer with your knowledge
- If it's about products/services, acknowledge and offer to help
- If you truly don't know, be honest and offer to connect them with someone
- Keep it natural and conversational`
    }
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
  message: string
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
    
    return await generateRAGResponse(userId, message, context, temperature)
  } catch (error) {
    console.error('RAG pipeline error:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again or contact support.'
  }
}