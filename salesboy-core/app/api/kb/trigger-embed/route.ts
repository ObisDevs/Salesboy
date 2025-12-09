import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'
import { generateEmbedding } from '@/lib/embeddings'
import { upsertVectors } from '@/lib/pinecone'
import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!
    const { file_id } = await request.json()

    if (!file_id) {
      return NextResponse.json({ error: 'file_id required' }, { status: 400 })
    }

    console.log(`📦 Starting embed for file ${file_id}, user ${userId}`)

    const { data: file } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('id', file_id)
      .eq('user_id', userId)
      .single()

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('knowledge-base')
      .download(file.file_path)

    if (downloadError) throw downloadError

    const buffer = Buffer.from(await fileData.arrayBuffer())
    let text = ''

    if (file.mime_type === 'application/pdf') {
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    } else if (file.mime_type?.includes('word')) {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      text = buffer.toString('utf-8')
    }

    console.log(`📄 Extracted ${text.length} characters`)

    const chunks = chunkText(text, 500, 50)
    console.log(`✂️ Created ${chunks.length} chunks`)

    const vectors = []
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i])
      vectors.push({
        id: `${file_id}_chunk_${i}`,
        values: embedding,
        metadata: {
          text: chunks[i],
          filename: file.filename,
          file_id: file_id,
          chunk_index: i
        }
      })
    }

    console.log(`🧠 Generated ${vectors.length} embeddings`)

    await upsertVectors(userId, vectors)
    console.log(`☁️ Upserted to Pinecone`)

    await supabaseAdmin
      .from('knowledge_base')
      .update({
        status: 'embedded',
        chunks_count: chunks.length
      })
      .eq('id', file_id)

    console.log(`✅ Embed complete for ${file.filename}`)

    return NextResponse.json({
      success: true,
      chunks: chunks.length,
      vectors: vectors.length
    })
  } catch (error: any) {
    console.error('Embed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }
  
  return chunks
}
