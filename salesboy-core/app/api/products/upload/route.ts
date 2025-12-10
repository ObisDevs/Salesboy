import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { error: authError, auth } = await requireAuth(request)
    if (authError) return authError

    const { userId } = auth!
    
    // Ensure product_catalog table exists
    try {
      await supabaseAdmin.rpc('create_product_catalog_table')
    } catch (rpcError) {
      console.log('RPC function not available, table should exist')
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one row' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const products = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const product: any = { user_id: userId }

      headers.forEach((header, index) => {
        const value = values[index] || ''
        switch (header) {
          case 'name':
          case 'product_name':
            product.product_name = value
            break
          case 'price':
            product.price = parseFloat(value) || 0
            break
          case 'description':
            product.description = value
            break
          case 'category':
            product.category = value
            break
          case 'sku':
            product.sku = value
            break
          case 'in_stock':
            product.in_stock = value.toLowerCase() === 'true'
            break
        }
      })

      if (product.product_name) {
        products.push(product)
      }
    }

    // Clear existing products and insert new ones
    await supabaseAdmin.from('product_catalog').delete().eq('user_id', userId)
    
    if (products.length > 0) {
      const { error } = await supabaseAdmin.from('product_catalog').insert(products)
      if (error) throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: `${products.length} products uploaded successfully` 
    })
  } catch (error: any) {
    console.error('Product upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}