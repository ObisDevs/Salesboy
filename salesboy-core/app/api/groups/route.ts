import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3001'
const API_SECRET = process.env.API_SECRET_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id') || '00000000-0000-0000-0000-000000000001'
    
    const res = await fetch(`${GATEWAY_URL}/groups?user_id=${userId}`, {
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
