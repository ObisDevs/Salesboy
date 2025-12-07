import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const user_id = formData.get('user_id') as string
    
    if (!file || !user_id) {
      return NextResponse.json({ error: 'File and user_id required' }, { status: 400 })
    }
    
    // Upload to Supabase Storage
    const fileName = `${user_id}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('knowledge-base')
      .upload(fileName, file)
    
    if (uploadError) {
      throw uploadError
    }
    
    // Save metadata to database
    const { data: kbEntry, error: dbError } = await supabaseAdmin
      .from('knowledge_base')
      .insert({
        user_id,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        status: 'uploaded',
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (dbError) {
      throw dbError
    }
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      file_id: kbEntry.id,
      filename: file.name
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}