import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await supabaseAdmin
      .from('chat_logs')
      .select('*')
      .eq('user_id', USER_ID)
      .order('timestamp', { ascending: false })
      .limit(limit)

    console.log('Logs API - data:', data, 'error:', error)
    
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Logs API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
