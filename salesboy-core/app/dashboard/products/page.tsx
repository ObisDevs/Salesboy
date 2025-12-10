'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import DashboardHeader from '@/app/components/DashboardHeader'
import { useToast } from '@/app/components/ui/toast'
import { LoadingSpinner } from '@/app/components/ui/loading'

interface Product {
  id: string
  product_name: string
  price: number
  description?: string
  category?: string
  sku?: string
  in_stock: boolean
  created_at?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'time'>('time')
  const [filterInStock, setFilterInStock] = useState<'all' | 'in_stock' | 'out_of_stock'>('all')
  const { showToast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/products/list')
      const { data } = await res.json()
      setProducts(data || [])
    } catch (error) {
      showToast('Failed to fetch products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...products]
    
    // Apply stock filter
    if (filterInStock === 'in_stock') {
      filtered = filtered.filter(p => p.in_stock)
    } else if (filterInStock === 'out_of_stock') {
      filtered = filtered.filter(p => !p.in_stock)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product_name.localeCompare(b.product_name)
        case 'price':
          return b.price - a.price
        case 'time':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      }
    })
    
    setFilteredProducts(filtered)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [products, sortBy, filterInStock])

  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products/create'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })

      if (!res.ok) throw new Error('Failed to save product')

      showToast(`Product ${editingProduct ? 'updated' : 'created'} successfully`, 'success')
      setEditingProduct(null)
      setShowAddForm(false)
      fetchProducts()
    } catch (error) {
      showToast('Failed to save product', 'error')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      showToast('Product deleted successfully', 'success')
      fetchProducts()
    } catch (error) {
      showToast('Failed to delete product', 'error')
    }
  }

  return (
    <>
      <DashboardHeader title="Product Catalog" description="Manage your product inventory" />
      
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Products</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={() => setShowAddForm(true)}>Add Product</Button>
              <Button onClick={fetchProducts} disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Refresh'}
              </Button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'time')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="time">Date Added</option>
                <option value="name">Name (A-Z)</option>
                <option value="price">Price (High-Low)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Filter:</span>
              <select
                value={filterInStock}
                onChange={(e) => setFilterInStock(e.target.value as 'all' | 'in_stock' | 'out_of_stock')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Products</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No products found. Add your first product or upload a CSV file.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '500' }}>Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '500' }}>Category</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '500' }}>Stock</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: '500' }}>{product.product_name}</div>
                      {product.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>${product.price}</td>
                    <td style={{ padding: '0.75rem' }}>{product.category || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        color: product.in_stock ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: '500'
                      }}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button 
                          onClick={() => setEditingProduct(product)}
                          style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                        >
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', background: '#dc2626' }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setEditingProduct(null)
            setShowAddForm(false)
          }}
        />
      )}
    </>
  )
}

function ProductForm({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product: Product | null
  onSave: (product: Partial<Product>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    price: product?.price || 0,
    description: product?.description || '',
    category: product?.category || '',
    sku: product?.sku || '',
    in_stock: product?.in_stock ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.product_name) return
    onSave(formData)
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        background: 'var(--bg-primary)', 
        padding: '2rem', 
        borderRadius: '12px', 
        width: '90%', 
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '500' }}>
          {product ? 'Edit Product' : 'Add Product'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Product Name *
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)', 
                background: 'var(--bg-primary)' 
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)', 
                background: 'var(--bg-primary)' 
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)', 
                background: 'var(--bg-primary)',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)', 
                  background: 'var(--bg-primary)' 
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)', 
                  background: 'var(--bg-primary)' 
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>In Stock</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="submit" style={{ flex: 1 }}>
              {product ? 'Update Product' : 'Add Product'}
            </Button>
            <Button type="button" onClick={onCancel} style={{ background: 'var(--border)' }}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}