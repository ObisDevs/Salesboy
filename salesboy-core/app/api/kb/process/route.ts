import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { chunkText } from '@/lib/embeddings'
// @ts-ignore
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const { file_id } = await request.json()
    
    if (!file_id) {
      return NextResponse.json({ error: 'file_id required' }, { status: 400 })
    }
    
    // Get file metadata
    const { data: kbFile } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('id', file_id)
      .single()
    
    if (!kbFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Download file from storage
    const { data: fileData } = await supabaseAdmin.storage
      .from('knowledge-base')
      .download(kbFile.file_path)
    
    if (!fileData) {
      throw new Error('Failed to download file')
    }
    
    // Extract text based on file type
    let text = ''
    const buffer = await fileData.arrayBuffer()
    
    if (kbFile.mime_type === 'application/pdf') {
      const pdfData = await pdf(Buffer.from(buffer))
      text = pdfData.text
    } else if (kbFile.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      text = result.value
    } else if (kbFile.mime_type === 'text/plain') {
      text = new TextDecoder().decode(buffer)
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    
    // Chunk the text
    const chunks = chunkText(text, 500)
    
    // Update file status
    await supabaseAdmin
      .from('knowledge_base')
      .update({
        status: 'processed',
        chunk_count: chunks.length,
        processed_at: new Date().toISOString()
      })
      .eq('id', file_id)
    
    return NextResponse.json({
      message: 'File processed successfully',
      chunks: chunks.length,
      text_length: text.length
    })
  } catch (error) {
    console.error('Process error:', error)
    
    // Update file status to failed
    const { file_id } = await request.json()
    if (file_id) {
      await supabaseAdmin
        .from('knowledge_base')
        .update({ status: 'failed' })
        .eq('id', file_id)
    }
    
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}