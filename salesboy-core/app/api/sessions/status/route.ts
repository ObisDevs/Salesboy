import { NextRequest, NextResponse } from 'next/server'
import { getSessionStatus } from '@/lib/gateway-client'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    let gatewayStatus = null
    let dbStatus = null

    // Try to get status from gateway
    try {
      const response = await getSessionStatus(userId)
      gatewayStatus = response.data
    } catch (err) {
      console.log('Gateway not available:', err)
      gatewayStatus = { ready: false, error: 'Gateway not running' }
    }

    // Get status from database
    try {
      const { data: session } = await supabaseAdmin
        .from('sessions')
        .select('status, updated_at')
        .eq('user_id', userId)
        .single()
      dbStatus = session
    } catch (err) {
      console.log('No session in DB')
    }

    return NextResponse.json({
      gateway_status: gatewayStatus,
      db_status: dbStatus
    })
  } catch (error: any) {
    console.error('Get session status error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get session status' }, { status: 500 })
  }
}