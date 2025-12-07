import { NextRequest, NextResponse } from 'next/server'
import { startSession } from '@/lib/gateway-client'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }
    
    // Start session via gateway
    let gatewayResponse
    try {
      gatewayResponse = await startSession(user_id)
    } catch (err: any) {
      console.error('Gateway error:', err.message)
      return NextResponse.json({ 
        error: 'Gateway not available. Make sure the gateway is running on your VPS.' 
      }, { status: 503 })
    }
    
    // Update session status in database
    try {
      await supabaseAdmin
        .from('sessions')
        .upsert({
          user_id,
          status: 'starting',
          updated_at: new Date().toISOString()
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