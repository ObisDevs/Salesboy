import { NextResponse } from 'next/server'
import { generateResponse } from '@/lib/llm-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await generateResponse('Say hello in one sentence')
    return NextResponse.json({ 
      success: true, 
      response: response.content,
      provider: response.provider 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      env_check: {
        gemini: !!process.env.GEMINI_API_KEY,
        openai: !!process.env.OPENAI_API_KEY
      }
    }, { status: 500 })
  }
}
