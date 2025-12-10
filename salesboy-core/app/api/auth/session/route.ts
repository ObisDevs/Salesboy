import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/server-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'create') {
      // Create new session and invalidate others
      const sessionToken = uuidv4()
      const userAgent = request.headers.get('user-agent') || 'Unknown'
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'

      // Invalidate all existing sessions for this user
      await supabaseAdmin
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)

      // Create new session
      await supabaseAdmin
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          device_info: userAgent,
          ip_address: ipAddress,
          is_active: true
        })

      return NextResponse.json({ sessionToken })
    }

    if (action === 'validate') {
      const { sessionToken } = await request.json()
      
      const { data: session } = await supabaseAdmin
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single()

      if (!session) {
        return NextResponse.json({ valid: false })
      }

      // Update last active
      await supabaseAdmin
        .from('user_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', session.id)

      return NextResponse.json({ valid: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Session management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}