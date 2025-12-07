import { NextRequest, NextResponse } from 'next/server'
import { getSessionStatus } from '@/lib/gateway-client'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }
    
    let gatewayStatus = null
    let dbStatus = null
    
    // Try to get status from gateway
    try {
      const response = await getSessionStatus(user_id)
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
        .eq('user_id', user_id)
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