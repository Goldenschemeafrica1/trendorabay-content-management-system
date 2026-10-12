import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, ArrowLeft } from 'lucide-react'
import api, { BASE_URL } from '../services/api'

export default function EditCommunity() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category: '',
    icon_url: '',
    cover_image_url: '',
    community_type: 'open',
    status: 'active',
    rules: ''
  })
  const [categories, setCategories] = useState([])
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const iconInputRef = useRef(null)
  const coverInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
    fetchCommunity()
  }, [id, navigate])

  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories')
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchCommunity = async () => {
    try {
      const community = await api.get(`/communities/${id}`)
      console.log('Community data:', community)
      console.log('Icon URL from DB:', community.icon_url)
      console.log('Cover URL from DB:', community.cover_image_url)

      // Convert relative URLs to absolute URLs
      const iconUrl = community.icon_url
        ? (community.icon_url.startsWith('http')
            ? community.icon_url
            : `${BASE_URL}${community.icon_url.startsWith('/') ? '' : '/'}${community.icon_url}`)
        : null

      const coverUrl = community.cover_image_url
        ? (community.cover_image_url.startsWith('http')
            ? community.cover_image_url
            : `${BASE_URL}${community.cover_image_url.startsWith('/') ? '' : '/'}${community.cover_image_url}`)
        : null

      console.log('Converted Icon URL:', iconUrl)
      console.log('Converted Cover URL:', coverUrl)

      setFormData({
        name: community.name,
        slug: community.slug,
        description: community.description || '',
        short_description: community.short_description || '',
        category: community.category,
        icon_url: iconUrl || '',
        cover_image_url: coverUrl || '',
        community_type: community.community_type || 'open',
        status: community.status || 'active',
        rules: community.rules || ''
      })

      // Set previews so images display immediately
      if (iconUrl) {
        setIconPreview(iconUrl)
      }
      if (coverUrl) {
        setCoverPreview(coverUrl)
      }

      console.log('Icon Preview set to:', iconUrl)
      console.log('Cover Preview set to:', coverUrl)
    } catch (error) {
      console.error('Failed to fetch community:', error)
      alert('Failed to load community data')
      navigate('/dashboard/communities')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setIconFile(file)
      const preview = URL.createObjectURL(file)
      setIconPreview(preview)
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      const preview = URL.createObjectURL(file)
      setCoverPreview(preview)
    }
  }

  const handleUpdateCommunity = async () => {
    if (!formData.name || !formData.category) {
      alert('Please fill in the required fields (name, category)')
      return
    }

    setIsUpdating(true)

    // Generate slug if empty or invalid
    let slugToUse = formData.slug || formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // If slug is still empty after generation, use a timestamp-based fallback
    if (!slugToUse || slugToUse === '') {
      slugToUse = `community-${Date.now()}`
    }

    try {
      let iconUrl = formData.icon_url
      let coverUrl = formData.cover_image_url

      // Upload images in parallel if files are selected
      const uploadPromises = []

      if (iconFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', iconFile)
        formDataUpload.append('folder', 'communities')
        const token = sessionStorage.getItem('auth_token')
        uploadPromises.push(
          fetch(`${BASE_URL}/api/media`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formDataUpload
          }).then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json()
              throw new Error(`Icon upload failed: ${errorData.error || 'Unknown error'}`)
            }
            const data = await res.json()
            if (data.media && data.media.file_url) {
              iconUrl = data.media.file_url.startsWith('http')
                ? data.media.file_url
                : `${BASE_URL}${data.media.file_url}`
            }
          })
        )
      }

      if (coverFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', coverFile)
        formDataUpload.append('folder', 'communities')
        const token = sessionStorage.getItem('auth_token')
        uploadPromises.push(
          fetch(`${BASE_URL}/api/media`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formDataUpload
          }).then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json()
              throw new Error(`Cover image upload failed: ${errorData.error || 'Unknown error'}`)
            }
            const data = await res.json()
            if (data.media && data.media.file_url) {
              coverUrl = data.media.file_url.startsWith('http')
                ? data.media.file_url
                : `${BASE_URL}${data.media.file_url}`
            }
          })
        )
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
      }

      // Convert absolute URLs back to relative URLs for database storage
      const iconUrlToSend = iconUrl && iconUrl.startsWith(BASE_URL)
        ? iconUrl.replace(BASE_URL, '')
        : iconUrl

      const coverUrlToSend = coverUrl && coverUrl.startsWith(BASE_URL)
        ? coverUrl.replace(BASE_URL, '')
        : coverUrl

      const dataToSend = {
        ...formData,
        slug: slugToUse,
        icon_url: iconUrlToSend,
        cover_image_url: coverUrlToSend
      }

      console.log('Updating community with dataToSend:', dataToSend)
      console.log('Icon URL in dataToSend:', dataToSend.icon_url)
      console.log('Cover URL in dataToSend:', dataToSend.cover_image_url)

      await api.put(`/communities/${id}`, dataToSend)
      alert('Community updated successfully!')
      navigate('/dashboard/communities')
    } catch (error) {
      console.error('Failed to update community:', error)
      alert('Failed to update community: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/dashboard/communities')}
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Edit Community</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Update community information</p>
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter community name..."
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Short Description</label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              placeholder="Brief description..."
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
              placeholder="Full community description..."
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Category *</label>
              <select
                name="category"
                value={formData.category || ''}
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
                }}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Community Type</label>
              <select
                name="community_type"
                value={formData.community_type}
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
                <option value="open">Open</option>
                <option value="approval">Approval Required</option>
                <option value="invite_only">Invite Only</option>
              </select>
            </div>
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
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Rules</label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              rows="4"
              placeholder="Community rules and guidelines..."
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Icon</label>
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
                onClick={() => iconInputRef.current?.click()}
              >
                <Upload style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Click to upload icon</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>PNG, JPG up to 5MB</p>
              </div>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                style={{ display: 'none' }}
              />
              {iconPreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={iconPreview}
                    alt="Icon preview"
                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Failed to load icon image:', iconPreview)
                      e.target.style.display = 'none'
                    }}
                    onLoad={() => {
                      console.log('Icon image loaded successfully')
                    }}
                  />
                  <button
                    onClick={() => {
                      setIconFile(null)
                      setIconPreview(null)
                      setFormData(prev => ({ ...prev, icon_url: '' }))
                    }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Cover Image</label>
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
                onClick={() => coverInputRef.current?.click()}
              >
                <Upload style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Click to upload cover image</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>PNG, JPG up to 5MB</p>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
              {coverPreview && (
                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Failed to load cover image:', coverPreview)
                      e.target.style.display = 'none'
                    }}
                    onLoad={() => {
                      console.log('Cover image loaded successfully')
                    }}
                  />
                  <button
                    onClick={() => {
                      setCoverFile(null)
                      setCoverPreview(null)
                      setFormData(prev => ({ ...prev, cover_image_url: '' }))
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
              onClick={() => navigate('/dashboard/communities')}
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
              onClick={handleUpdateCommunity}
              disabled={isUpdating}
              style={{
                padding: '10px 20px',
                background: isUpdating ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: isUpdating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: isUpdating ? 'var(--text-secondary)' : 'white',
                boxShadow: isUpdating ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isUpdating) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isUpdating) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
                }
              }}>
              {isUpdating ? 'Updating...' : 'Update Community'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
