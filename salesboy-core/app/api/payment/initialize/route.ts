import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId, email } = auth!
    const { plan_type = 'agent_pro' } = await request.json()

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        amount: 2500000,
        plan: process.env.PAYSTACK_PLAN_CODE,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/payment?cancelled=true`,
        metadata: {
          user_id: userId,
          plan_type,
          cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/payment?cancelled=true`
        }
      })
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return NextResponse.json({ error: 'Payment initialization failed' }, { status: 400 })
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
