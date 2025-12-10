import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!
    const { group_id, auto_reply } = await request.json()

    if (!group_id) {
      return NextResponse.json({ error: 'group_id required' }, { status: 400 })
    }

    // Check if master group replies is enabled
    const { data: botConfig } = await supabaseAdmin
      .from('bot_config')
      .select('reply_to_groups')
      .eq('user_id', userId)
      .single()

    if (!botConfig?.reply_to_groups && auto_reply) {
      return NextResponse.json({ 
        error: 'Enable group replies in Bot Config first' 
      }, { status: 400 })
    }

    // Update or insert group setting
    const { error } = await supabaseAdmin
      .from('group_settings')
      .upsert({
        user_id: userId,
        group_id,
        auto_reply,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,group_id'
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Group toggle error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}