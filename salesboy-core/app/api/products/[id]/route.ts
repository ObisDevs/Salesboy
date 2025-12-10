import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('product_catalog')
      .update({
        product_name: body.product_name,
        price: body.price,
        description: body.description,
        category: body.category,
        sku: body.sku,
        in_stock: body.in_stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!

    const { error } = await supabaseAdmin
      .from('product_catalog')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}