import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 })
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${USER_ID}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('knowledge-base')
      .upload(fileName, buffer, { contentType: file.type })
    
    if (uploadError) {
      throw uploadError
    }
    
    const { data: kbEntry, error: dbError } = await supabaseAdmin
      .from('knowledge_base')
      .insert({
        user_id: USER_ID,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        status: 'uploaded'
      })
      .select()
      .single()
    
    if (dbError) {
      throw dbError
    }
    
    // Get user's n8n webhook from profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('metadata')
      .eq('id', USER_ID)
      .single()
    
    const n8nWebhook = profile?.metadata?.n8n_kb_webhook
    if (n8nWebhook) {
      fetch(n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: kbEntry.id,
          user_id: USER_ID,
          filename: file.name,
          file_path: uploadData.path,
          mime_type: file.type,
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          bucket: 'knowledge-base'
        })
      }).catch(err => console.error('n8n webhook failed:', err))
    }
    
    return NextResponse.json({ data: kbEntry })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}