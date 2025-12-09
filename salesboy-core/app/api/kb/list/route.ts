import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!

    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    console.log(`KB list: ${data?.length || 0} files for user ${userId}`)
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('KB list error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
