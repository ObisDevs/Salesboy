import { supabaseAdmin } from './supabase'

export interface Product {
  id: string
  product_name: string
  price: number
  description?: string
  category?: string
  sku?: string
  in_stock: boolean
}

export async function searchProducts(userId: string, query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_catalog')
      .select('*')
      .eq('user_id', userId)
      .or(`product_name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Product search error:', error)
    return []
  }
}

export async function getProductByName(userId: string, productName: string): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_catalog')
      .select('*')
      .eq('user_id', userId)
      .ilike('product_name', `%${productName}%`)
      .single()

    if (error) return null
    return data
  } catch (error) {
    return null
  }
}