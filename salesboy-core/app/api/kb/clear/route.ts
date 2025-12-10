import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { clearAllVectors } from '@/lib/pinecone'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    // Clear all vectors from Pinecone namespace
    await clearAllVectors(userId)

    // Clear knowledge base records from database
    await supabaseAdmin
      .from('knowledge_base')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({ 
      success: true, 
      message: 'All knowledge base data cleared successfully' 
    })
  } catch (error: any) {
    console.error('Clear knowledge error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}