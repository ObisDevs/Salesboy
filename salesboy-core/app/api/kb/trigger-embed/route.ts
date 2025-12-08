import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateEmbedding, chunkText } from '@/lib/embeddings'
import { upsertVectors } from '@/lib/pinecone'
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
    
    // Update status to processing
    await supabaseAdmin
      .from('knowledge_base')
      .update({ status: 'processing' })
      .eq('id', file_id)
    
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
    } else if (kbFile.mime_type === 'text/plain' || kbFile.mime_type === 'text/markdown') {
      text = new TextDecoder().decode(buffer)
    } else {
      // Try as text anyway
      text = new TextDecoder().decode(buffer)
    }
    
    // Chunk the text
    const chunks = chunkText(text, 500)
    
    // Generate embeddings and upsert to Pinecone
    const vectors = []
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedding = await generateEmbedding(chunk)
      
      vectors.push({
        id: `${file_id}_chunk_${i}`,
        values: embedding,
        metadata: {
          user_id: kbFile.user_id,
          filename: kbFile.filename,
          chunk_index: i,
          text: chunk
        }
      })
    }
    
    await upsertVectors(kbFile.user_id, vectors)
    
    // Update file status to embedded
    await supabaseAdmin
      .from('knowledge_base')
      .update({
        status: 'embedded',
        chunk_count: chunks.length,
        processed_at: new Date().toISOString(),
        embedded_at: new Date().toISOString()
      })
      .eq('id', file_id)
    
    return NextResponse.json({
      success: true,
      message: 'File embedded successfully',
      chunks: chunks.length,
      vectors: vectors.length,
      text_length: text.length,
      filename: kbFile.filename
    })
  } catch (error: any) {
    console.error('Embed error:', error)
    
    // Update file status to failed
    const body = await request.json().catch(() => ({}))
    if (body.file_id) {
      await supabaseAdmin
        .from('knowledge_base')
        .update({ status: 'failed' })
        .eq('id', body.file_id)
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to embed file' 
    }, { status: 500 })
  }
}
