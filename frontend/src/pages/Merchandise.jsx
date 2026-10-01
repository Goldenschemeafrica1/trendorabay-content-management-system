import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, DollarSign, TrendingUp } from 'lucide-react'
import api from '../services/api'

export default function Merchandise() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [products, setProducts] = useState([])
  const [,setLoading] = useState(true)
  
  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/products')
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }
    
    try {
      await api.delete(`/products/${productId}`)
      const data = await api.get('/products')
      setProducts(data)
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product: ' + error.message)
    }
  }

  const handleEditProduct = (product) => {
    navigate(`/dashboard/merchandise/edit/${product.id}`)
  }

  const filteredProducts = products.map(product => ({
    ...product,
    price: parseFloat(product.price),
    sku: 'SKU-' + product.id, // Backend doesn't have sku field yet
    displayStatus: product.stock === 0 ? 'out-of-stock' : product.status
  })).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || product.displayStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Store</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage products and inventory</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/merchandise/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Package style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{products.length}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>Total Products</p>
        </div>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <DollarSign style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${totalValue.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>Total Inventory Value</p>
        </div>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#9333ea' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalStock}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>Total Units in Stock</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              outline: 'none',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            outline: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#7c3aed'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <option value="all">All Status</option>
          <option value="active">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div style={{
        background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>SKU</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Stock</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{product.name}</span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{product.sku}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>${product.price.toFixed(2)}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontWeight: '500', color: product.stock === 0 ? '#dc2626' : 'var(--text-primary)' }}>
                    {product.stock}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: 'var(--bg-secondary)', 
                    color: 'var(--text-secondary)', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '500'
                  }}>
                    {product.category}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    background: product.displayStatus === 'active' ? '#dcfce7' : '#fee2e2',
                    color: product.displayStatus === 'active' ? '#166534' : '#991b1b'
                  }}>
                    {product.displayStatus === 'active' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditProduct(product)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}>
                      <Edit style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef2f2'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}>
                      <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
