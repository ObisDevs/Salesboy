import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()

    if (!subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // Get user ID from auth header or session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      token.split('.')[0] // This is a simplified approach; in production, verify the JWT properly
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Store push subscription in database
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        auth: subscription.keys?.auth,
        p256dh: subscription.keys?.p256dh,
        user_agent: request.headers.get('user-agent'),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to store subscription:', error)
      return NextResponse.json({ error: 'Failed to store subscription' }, { status: 500 })
    }

    console.log('✅ Push subscription stored for user:', user.id)
    return NextResponse.json({ success: true, message: 'Subscription saved' })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
