import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!

    const [kbCount, logsCount, sessionStatus] = await Promise.all([
      supabaseAdmin.from('knowledge_base').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabaseAdmin.from('chat_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      fetch(`${process.env.GATEWAY_URL}/session/status?user_id=${userId}`, {
        headers: { 'X-API-KEY': process.env.API_SECRET_KEY || '' }
      }).then(r => r.json()).catch(err => {
        console.error('Gateway status error:', err)
        return { exists: false, ready: false }
      })
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayMessages } = await supabaseAdmin
      .from('chat_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('timestamp', today.toISOString())

    return NextResponse.json({
      data: {
        sessions: (sessionStatus.exists && sessionStatus.ready) ? 1 : 0,
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
