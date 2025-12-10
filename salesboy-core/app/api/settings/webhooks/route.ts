import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    const { data } = await supabaseAdmin
      .from('profiles')
      .select('metadata')
      .eq('id', userId)
      .limit(1)
      .single()

    return NextResponse.json({ 
      data: {
        n8n_kb_webhook: data?.metadata?.n8n_kb_webhook || '',
        intent_webhook_url: data?.metadata?.intent_webhook_url || ''
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Webhook PUT request:', body)
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    const { data: profile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('metadata')
      .eq('id', userId)
      .limit(1)
      .single()

    if (selectError) {
      console.error('Profile select error:', selectError)
      throw selectError
    }

    const updatedMetadata = {
      ...(profile?.metadata || {}),
      n8n_kb_webhook: body.n8n_kb_webhook,
      intent_webhook_url: body.intent_webhook_url || profile?.metadata?.intent_webhook_url || ''
    }

    console.log('Updating metadata:', updatedMetadata)

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      throw error
    }

    console.log('Webhook saved successfully')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
