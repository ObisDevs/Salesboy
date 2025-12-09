import { NextRequest, NextResponse } from 'next/server'
import { startSession } from '@/lib/gateway-client'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    // Start session via gateway
    let gatewayResponse
    try {
      gatewayResponse = await startSession(userId)
    } catch (err: any) {
      console.error('Gateway error:', err?.message || err)
      return NextResponse.json({ 
        error: 'Gateway not available. Make sure the gateway is running on your VPS.' 
      }, { status: 503 })
    }

    // Update session status in database
    try {
      await supabaseAdmin
        .from('sessions')
        .upsert({
          session_id: `session_${userId}`,
          user_id: userId,
          status: 'starting'
        }, {
          onConflict: 'session_id'
        })
    } catch (err) {
      console.error('DB error:', err)
    }

    return NextResponse.json(gatewayResponse.data)
  } catch (error: any) {
    console.error('Start session error:', error)
    return NextResponse.json({ error: error.message || 'Failed to start session' }, { status: 500 })
  }
}