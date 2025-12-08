import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')

    // Direct query - bypass RPC
    const { data, error } = await supabaseAdmin
      .from('chat_logs')
      .select('*')
      .eq('user_id', USER_ID)
      .order('timestamp', { ascending: false })
      .limit(limit)

    console.log('Logs API - data count:', data?.length, 'error:', error)
    
    if (error) throw error
    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Logs API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
