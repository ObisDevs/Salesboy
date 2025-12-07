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
    
    // Get status from gateway
    const response = await getSessionStatus(user_id)
    
    // Get status from database
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('status, updated_at')
      .eq('user_id', user_id)
      .single()
    
    return NextResponse.json({
      gateway_status: response.data,
      db_status: session
    })
  } catch (error) {
    console.error('Get session status error:', error)
    return NextResponse.json({ error: 'Failed to get session status' }, { status: 500 })
  }
}