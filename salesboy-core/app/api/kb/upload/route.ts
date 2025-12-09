import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 })
    }
    
    console.log(`📁 Uploading file for user ${userId}: ${file.name}`)

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `uploads/${userId}/${Date.now()}_${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('knowledge-base')
      .upload(fileName, buffer, { contentType: file.type })
    
    if (uploadError) {
      throw uploadError
    }
    
    const { data: kbEntry, error: dbError } = await supabaseAdmin
      .from('knowledge_base')
      .insert({
        user_id: userId,
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
    
    console.log(`✓ File uploaded: ${kbEntry.id}`)
    
    return NextResponse.json({ data: kbEntry })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
