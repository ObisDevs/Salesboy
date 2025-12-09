import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/server-auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    
    if (authError) {
      return authError
    }

    const { userId } = auth!

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Verify file belongs to user
    const { data: file } = await supabaseAdmin
      .from('knowledge_base')
      .select('file_path, user_id')
      .eq('id', id)
      .single()

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (file.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log(`🗑️ Deleting KB file for user ${userId}: ${id}`)

    // Delete from storage
    if (file.file_path) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { error: storageError } = await supabase.storage
        .from('knowledge-base')
        .remove([file.file_path])
      
      if (storageError) {
        console.error('Storage delete error:', storageError)
      }
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from('knowledge_base')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    
    console.log('✓ KB file deleted')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
