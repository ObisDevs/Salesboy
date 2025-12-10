import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!

    const { data, error } = await supabaseAdmin
      .from('bot_config')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ data: null })
    }
    
    if (error) throw error
    
    return NextResponse.json({ data }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      }
    })
  } catch (error: any) {
    console.error('Bot config GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('bot_config')
      .upsert({
        user_id: userId,
        system_prompt: body.system_prompt,
        temperature: body.temperature,
        model: body.model,
        max_tokens: body.max_tokens,
        business_name: body.business_name,
        business_email: body.business_email,
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
