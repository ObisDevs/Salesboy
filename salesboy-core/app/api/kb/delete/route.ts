import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    console.log('Deleting KB file:', id)

    // Get file info
    const { data: file } = await supabaseAdmin
      .from('knowledge_base')
      .select('file_path')
      .eq('id', id)
      .single()

    // Delete from storage
    if (file?.file_path) {
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

    if (error) throw error
    
    console.log('KB file deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
