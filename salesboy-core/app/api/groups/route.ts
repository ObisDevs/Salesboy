import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'

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
    return NextResponse.json({ data: data.groups || [] })
  } catch (error: any) {
    console.error('Groups API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
