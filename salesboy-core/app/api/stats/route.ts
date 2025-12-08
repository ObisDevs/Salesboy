import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET() {
  try {
    const [kbCount, logsCount, sessionStatus] = await Promise.all([
      supabaseAdmin.from('knowledge_base').select('id', { count: 'exact', head: true }).eq('user_id', USER_ID),
      supabaseAdmin.from('chat_logs').select('id', { count: 'exact', head: true }).eq('user_id', USER_ID),
      fetch(`${process.env.GATEWAY_URL}/session/status?user_id=${USER_ID}`, {
        headers: { 'X-API-KEY': process.env.API_SECRET_KEY || '' }
      }).then(r => r.json()).catch(() => ({ ready: false }))
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayMessages } = await supabaseAdmin
      .from('chat_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', USER_ID)
      .gte('timestamp', today.toISOString())

    return NextResponse.json({
      data: {
        sessions: sessionStatus.ready ? 1 : 0,
        documents: kbCount.count || 0,
        messages: todayMessages || 0,
        totalMessages: logsCount.count || 0
      }
    })
  } catch (error: any) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
