import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userPlan, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('User plan fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch user plan' }, { status: 500 })
    }

    const hasActivePlan = userPlan && 
      userPlan.status === 'active' && 
      new Date(userPlan.expires_at) > new Date()

    return NextResponse.json({
      hasActivePlan,
      plan: userPlan || null
    })
  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}