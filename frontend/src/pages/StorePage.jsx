import { useState, useEffect } from 'react'
import { Save, Eye, Type, Image, Layout, Settings, Plus, Trash2, ShoppingBag, DollarSign, Package, TrendingUp } from 'lucide-react'
import api from '../services/api'

const API_BASE_URL = 'https://trendorabay-content-management-system.onrender.com'

export default function StorePage() {
  const [storeTitle, setStoreTitle] = useState('Our Store')
  const [storeDescription, setStoreDescription] = useState('Browse our exclusive merchandise and support our podcast.')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bestSellingProducts, setBestSellingProducts] = useState([])
  const [ourCollection, setOurCollection] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch best-selling products
      const bestSellingData = await api.get('/products/best-selling')
      const mappedBestSelling = bestSellingData.map(product => {
        const imageUrl = product.image_url 
          ? (product.image_url.startsWith('http') 
              ? product.image_url 
              : `${API_BASE_URL}${product.image_url}`)
          : ''
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: imageUrl,
          category: product.category || 'General',
          sales: product.total_sold || 0
        }
      })
      setBestSellingProducts(mappedBestSelling)

      // Fetch all products for our collection
      const allProductsData = await api.get('/products')
      const mappedProducts = allProductsData.map(product => {
        const imageUrl = product.image_url 
          ? (product.image_url.startsWith('http') 
              ? product.image_url 
              : `${API_BASE_URL}${product.image_url}`)
          : ''
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: imageUrl,
          category: product.category || 'General',
          sales: 0
        }
      })
      setOurCollection(mappedProducts.slice(0, 8))
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Store Page</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Configure the store page content and featured products</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '8px 16px',
              background: '#f8fafc',
              color: '#64748b',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc'
            }}
          >
            <Eye style={{ width: '16px', height: '16px' }} />
            Preview
          </button>
          <button style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Store Settings */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings style={{ width: '20px', height: '20px' }} />
          Store Settings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Store Title</label>
            <input
              type="text"
              value={storeTitle}
              onChange={(e) => setStoreTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Store Description</label>
            <textarea
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                fontSize: '13px',
                resize: 'vertical',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p style={{ color: '#64748b' }}>Loading products...</p>
        </div>
      ) : (
        <>
      {/* Best Selling */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp style={{ width: '20px', height: '20px' }} />
            Best Selling
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Product
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'space-between' }}>
          {bestSellingProducts.map((product) => (
            <div key={product.id} style={{
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid #e2e8f0',
              flex: '0 0 calc(25% - 12px)',
              minWidth: '200px'
            }}>
              <div style={{
                width: '100%',
                height: '160px',
                ...(product.image ? {
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }),
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!product.image && (
                  <Package style={{ width: '32px', height: '32px', color: 'white' }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{product.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign style={{ width: '12px', height: '12px' }} />
                    {product.price}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                    {product.sales} sold
                  </span>
                </div>
              </div>
              <button
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Our Collection */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag style={{ width: '20px', height: '20px' }} />
            Our Collection
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Product
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', flexWrap: 'wrap' }}>
          {ourCollection.map((product) => (
            <div key={product.id} style={{
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid #e2e8f0',
              flex: '0 0 calc(25% - 12px)',
              minWidth: '200px'
            }}>
              <div style={{
                width: '100%',
                height: '160px',
                ...(product.image ? {
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                }),
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!product.image && (
                  <Package style={{ width: '32px', height: '32px', color: 'white' }} />
                )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{product.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign style={{ width: '12px', height: '12px' }} />
                    {product.price}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                    {product.category}
                  </span>
                </div>
              </div>
              <button
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Store Page Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '8px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '20px', height: '20px', color: '#64748b' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{storeTitle}</h1>
                <p style={{ color: '#64748b', marginTop: '8px' }}>{storeDescription}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', flexWrap: 'wrap' }}>
                {featuredProducts.map((product) => (
                  <div key={product.id} style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid #e2e8f0',
                    flex: '1',
                    minWidth: '250px'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '160px',
                      ...(product.image ? {
                        backgroundImage: `url(${product.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                      }),
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {!product.image && (
                        <Package style={{ width: '32px', height: '32px', color: 'white' }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{product.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign style={{ width: '12px', height: '12px' }} />
                          {product.price}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
