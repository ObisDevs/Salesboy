import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3001'
const API_SECRET = process.env.API_SECRET_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    const res = await fetch(`${GATEWAY_URL}/message/groups?user_id=${userId}`, {
      headers: { 'X-API-KEY': API_SECRET }
    })

    if (!res.ok) throw new Error('Failed to fetch groups')

    const data = await res.json()
    const groups = data.groups || []

    // Get group settings from database
    const { data: groupSettings } = await supabaseAdmin
      .from('group_settings')
      .select('group_id, auto_reply')
      .eq('user_id', userId)

    // Merge gateway groups with database settings
    const groupsWithSettings = groups.map((group: any) => {
      const setting = groupSettings?.find((s: any) => s.group_id === group.id)
      return {
        ...group,
        auto_reply: setting?.auto_reply || false
      }
    })

    return NextResponse.json({ data: groupsWithSettings })
  } catch (error: any) {
    console.error('Groups API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
