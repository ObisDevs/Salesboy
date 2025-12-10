import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const supabase = createServerClient()
    const userId = paystackData.data.metadata.user_id
    const planType = paystackData.data.metadata.plan_type || 'agent_pro'

    // Update or create user plan
    const { error } = await supabase
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_type: planType,
        paystack_subscription_code: paystackData.data.subscription?.subscription_code || null,
        paystack_customer_code: paystackData.data.customer?.customer_code || null,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('User plan update error:', error)
      return NextResponse.json({ error: 'Failed to update user plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}