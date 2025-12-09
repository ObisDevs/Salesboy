import { NextRequest, NextResponse } from 'next/server'
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

    const { data, error } = await supabaseAdmin
      .from('whitelists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!
    const { phone_number, name, notes } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('whitelists')
      .insert({ user_id: userId, phone_number, name, notes })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Verify whitelist belongs to user
    const { data: whitelist } = await supabaseAdmin
      .from('whitelists')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!whitelist || whitelist.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('whitelists')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
