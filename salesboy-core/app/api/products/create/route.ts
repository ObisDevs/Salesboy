import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('product_catalog')
      .insert({
        user_id: userId,
        product_name: body.product_name,
        price: body.price,
        description: body.description,
        category: body.category,
        sku: body.sku,
        in_stock: body.in_stock
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Product create error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}