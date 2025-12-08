import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('metadata')
      .eq('id', USER_ID)
      .single()

    return NextResponse.json({ 
      data: {
        n8n_kb_webhook: data?.metadata?.n8n_kb_webhook || ''
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
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('metadata')
      .eq('id', USER_ID)
      .single()

    const updatedMetadata = {
      ...(profile?.metadata || {}),
      n8n_kb_webhook: body.n8n_kb_webhook
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', USER_ID)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
