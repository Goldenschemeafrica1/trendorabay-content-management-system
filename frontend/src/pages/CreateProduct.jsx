import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft } from 'lucide-react'
import api, { BASE_URL } from '../services/api'

export default function CreateProduct() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    status: 'active',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const productImageInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories')
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }

  const handleCreateProduct = async () => {
    if (!formData.name || formData.name.trim() === '') {
      alert('Please fill in the product name')
      return
    }
    
    try {
      let imageUrl = formData.image_url
      
      if (imageFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('image', imageFile)
        const token = sessionStorage.getItem('auth_token')
        const uploadResponse = await fetch(`${BASE_URL}/api/products/upload`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formDataUpload
        })
        const uploadData = await uploadResponse.json()
        if (uploadData.imageUrl) {
          imageUrl = uploadData.imageUrl
        }
      }
      
      await api.post('/products', { ...formData, image_url: imageUrl })
      alert('Product created successfully!')
      navigate('/dashboard/merchandise')
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product: ' + error.message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/dashboard/merchandise')}
          style={{
            padding: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-primary)'
            e.currentTarget.style.borderColor = '#7c3aed'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)'
            e.currentTarget.style.borderColor = 'var(--border-color)'
          }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Create New Product</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Add a new product to the store</p>
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '32px',
        maxWidth: '600px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter product description..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
                resize: 'vertical'
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Price *</label>
              <input
                type="number"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
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
                }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loadingCategories}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
                cursor: loadingCategories ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                if (!loadingCategories) {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="">{loadingCategories ? 'Loading categories...' : 'Select a category'}</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Product Image</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.background = 'var(--bg-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                  e.currentTarget.style.background = 'var(--bg-secondary)'
                }}
                onClick={() => productImageInputRef.current?.click()}
              >
                <Upload style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Click to upload image</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>PNG, JPG up to 5MB</p>
              </div>
              <input
                ref={productImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {imagePreview && (
                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => navigate('/dashboard/merchandise')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProduct}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
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
              }}>
              Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
