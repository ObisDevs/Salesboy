import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(request: NextRequest) {
  try {
    const { file_id } = await request.json()
    
    const { data: file } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('id', file_id)
      .single()
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Get user's n8n webhook
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('metadata')
      .eq('id', USER_ID)
      .single()
    
    const n8nWebhook = profile?.metadata?.n8n_kb_webhook
    if (!n8nWebhook) {
      return NextResponse.json({ error: 'n8n webhook not configured' }, { status: 400 })
    }
    
    // Trigger n8n webhook
    const response = await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_id: file.id,
        user_id: USER_ID,
        filename: file.filename,
        file_path: file.file_path,
        mime_type: file.mime_type,
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        bucket: 'knowledge-base'
      })
    })
    
    if (!response.ok) {
      throw new Error('n8n webhook failed')
    }
    
    // Update status to processing
    await supabaseAdmin
      .from('knowledge_base')
      .update({ status: 'processing' })
      .eq('id', file_id)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Trigger embed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
