import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('bot_config')
      .select('*')
      .eq('user_id', USER_ID)
      .single()

    if (error && error.code === 'PGRST116') {
      // No config found - return null, let frontend handle defaults
      return NextResponse.json({ data: null })
    }
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Upsert with onConflict on user_id (unique constraint)
    const { data, error } = await supabaseAdmin
      .from('bot_config')
      .upsert({
        user_id: USER_ID,
        system_prompt: body.system_prompt,
        temperature: body.temperature,
        model: body.model,
        max_tokens: body.max_tokens,
        metadata: body.metadata || {}
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Bot config upsert error:', error)
      throw error
    }
    
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Bot config update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
