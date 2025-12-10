import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/server-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('[Payment Status] Auth check:', { hasUser: !!user, userId: user?.id, authError: authError?.message })

    if (authError || !user) {
      console.error('[Payment Status] Unauthorized:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS
    const { data: userPlan, error } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('[Payment Status] Query result:', { 
      hasData: !!userPlan, 
      error: error?.message, 
      errorCode: error?.code,
      planStatus: userPlan?.status,
      expiresAt: userPlan?.expires_at
    })

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[Payment Status] User plan fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch user plan' }, { status: 500 })
    }

    const hasActivePlan = userPlan && 
      userPlan.status === 'active' && 
      new Date(userPlan.expires_at) > new Date()

    console.log('[Payment Status] Final result:', { hasActivePlan, planData: userPlan })

    return NextResponse.json({
      hasActivePlan,
      plan: userPlan || null
    })
  } catch (error: any) {
    console.error('[Payment Status] Unexpected error:', error.message, error.stack)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}