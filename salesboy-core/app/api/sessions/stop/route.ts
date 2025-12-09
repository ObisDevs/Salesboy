import { NextRequest, NextResponse } from 'next/server'
import { stopSession } from '@/lib/gateway-client'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    // Stop session via gateway
    const response = await stopSession(userId)

    // Update session status in database
    await supabaseAdmin
      .from('sessions')
      .upsert({
        session_id: `session_${userId}`,
        user_id: userId,
        status: 'stopped'
      }, {
        onConflict: 'session_id'
      })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Stop session error:', error)
    return NextResponse.json({ error: 'Failed to stop session' }, { status: 500 })
  }
}