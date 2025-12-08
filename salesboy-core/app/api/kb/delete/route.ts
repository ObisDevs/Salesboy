import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const USER_ID = '00000000-0000-0000-0000-000000000001'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { data: file } = await supabaseAdmin
      .from('knowledge_base')
      .select('file_path')
      .eq('id', id)
      .single()

    if (file) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase.storage.from('knowledge-base').remove([file.file_path])
    }

    const { error } = await supabaseAdmin
      .from('knowledge_base')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
