import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateEmbedding, chunkText } from '@/lib/embeddings'
import { upsertVectors } from '@/lib/pinecone'

export async function POST(request: NextRequest) {
  try {
    const { file_id } = await request.json()
    
    if (!file_id) {
      return NextResponse.json({ error: 'file_id required' }, { status: 400 })
    }
    
    // Get file and re-extract text (or store chunks in DB)
    const { data: kbFile } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('id', file_id)
      .single()
    
    if (!kbFile || kbFile.status !== 'processed') {
      return NextResponse.json({ error: 'File not found or not processed' }, { status: 404 })
    }
    
    // Download and re-extract text (simplified for now)
    const { data: fileData } = await supabaseAdmin.storage
      .from('knowledge-base')
      .download(kbFile.file_path)
    
    if (!fileData) {
      throw new Error('Failed to download file')
    }
    
    // For simplicity, assume text file for now
    const buffer = await fileData.arrayBuffer()
    const text = new TextDecoder().decode(buffer)
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
    
    // Update file status
    await supabaseAdmin
      .from('knowledge_base')
      .update({
        status: 'embedded',
        embedded_at: new Date().toISOString()
      })
      .eq('id', file_id)
    
    return NextResponse.json({
      message: 'Embeddings generated successfully',
      vectors: vectors.length
    })
  } catch (error) {
    console.error('Embed error:', error)
    
    // Update file status to failed
    const { file_id } = await request.json()
    if (file_id) {
      await supabaseAdmin
        .from('knowledge_base')
        .update({ status: 'failed' })
        .eq('id', file_id)
    }
    
    return NextResponse.json({ error: 'Failed to generate embeddings' }, { status: 500 })
  }
}