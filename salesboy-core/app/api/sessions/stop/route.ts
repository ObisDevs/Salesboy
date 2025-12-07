import { NextRequest, NextResponse } from 'next/server'
import { stopSession } from '@/lib/gateway-client'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }
    
    // Stop session via gateway
    const response = await stopSession(user_id)
    
    // Update session status in database
    await supabaseAdmin
      .from('sessions')
      .upsert({
        user_id,
        status: 'stopped',
        updated_at: new Date().toISOString()
      })
    
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Stop session error:', error)
    return NextResponse.json({ error: 'Failed to stop session' }, { status: 500 })
  }
}