import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, X } from 'lucide-react'
import api from '../services/api'

export default function CreateCommunity() {
  const navigate = useNavigate()
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
    rules: '',
    created_by: ''
  })
  const [categories, setCategories] = useState([])
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const iconInputRef = useRef(null)
  const coverInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
    // Reset form data to ensure clean state
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      category: '',
      icon_url: '',
      cover_image_url: '',
      community_type: 'open',
      status: 'active',
      rules: '',
      created_by: ''
    })
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories')
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-generate slug from name
    if (name === 'name') {
      let slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Ensure slug is never empty
      if (!slug || slug === '') {
        slug = ''
      }

      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setIconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleIconUpload = async () => {
    if (!iconFile) return
    
    setUploadingIcon(true)
    const formData = new FormData()
    formData.append('file', iconFile)
    formData.append('folder', 'communities')
    
    try {
      const response = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormData(prev => ({ ...prev, icon_url: response.media.file_url }))
      alert('Icon uploaded successfully!')
    } catch (error) {
      console.error('Failed to upload icon:', error)
      alert('Failed to upload icon: ' + error.message)
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleCoverUpload = async () => {
    if (!coverFile) return
    
    setUploadingCover(true)
    const formData = new FormData()
    formData.append('file', coverFile)
    formData.append('folder', 'communities')
    
    try {
      const response = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormData(prev => ({ ...prev, cover_image_url: response.media.file_url }))
      alert('Cover image uploaded successfully!')
    } catch (error) {
      console.error('Failed to upload cover image:', error)
      alert('Failed to upload cover image: ' + error.message)
    } finally {
      setUploadingCover(false)
    }
  }

  const handleCreateCommunity = async () => {
    if (!formData.name || !formData.category) {
      alert('Please fill in the required fields (name, category)')
      return
    }

    // Generate slug if empty or invalid
    let slugToUse = formData.slug || formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // If slug is still empty after generation, use a timestamp-based fallback
    if (!slugToUse || slugToUse === '') {
      slugToUse = `community-${Date.now()}`
    }

    // Clean the data - only send the fields we need
    const dataToSend = {
      name: formData.name,
      slug: slugToUse,
      description: formData.description || '',
      short_description: formData.short_description || '',
      category: formData.category,
      icon_url: formData.icon_url || '',
      cover_image_url: formData.cover_image_url || '',
      community_type: formData.community_type || 'open',
      status: formData.status || 'active',
      rules: formData.rules || ''
    }

    console.log('Clean data to send:', dataToSend)

    try {
      await api.post('/communities', dataToSend)
      alert('Community created successfully!')
      navigate('/dashboard/communities')
    } catch (error) {
      console.error('Failed to create community:', error)
      alert('Failed to create community: ' + error.message)
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Create New Community</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Add a new community group to the platform</p>
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
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => iconInputRef.current?.click()}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed'
                    e.currentTarget.style.background = 'var(--bg-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Choose File
                </button>
                {iconFile && (
                  <button
                    onClick={handleIconUpload}
                    disabled={uploadingIcon}
                    style={{
                      padding: '10px 16px',
                      background: uploadingIcon ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: uploadingIcon ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: uploadingIcon ? 'var(--text-secondary)' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {uploadingIcon ? 'Uploading...' : 'Upload'}
                  </button>
                )}
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
                      width: '24px',
                      height: '24px',
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <X style={{ width: '14px', height: '14px', color: 'white' }} />
                  </button>
                </div>
              )}
              {formData.icon_url && !iconPreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={formData.icon_url} 
                    alt="Current icon"
                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Cover Image</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed'
                    e.currentTarget.style.background = 'var(--bg-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  Choose File
                </button>
                {coverFile && (
                  <button
                    onClick={handleCoverUpload}
                    disabled={uploadingCover}
                    style={{
                      padding: '10px 16px',
                      background: uploadingCover ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: uploadingCover ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: uploadingCover ? 'var(--text-secondary)' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {uploadingCover ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
              {coverPreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={coverPreview} 
                    alt="Cover preview"
                    style={{ width: '200px', height: '120px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => {
                      setCoverFile(null)
                      setCoverPreview(null)
                      setFormData(prev => ({ ...prev, cover_image_url: '' }))
                    }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '24px',
                      height: '24px',
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <X style={{ width: '14px', height: '14px', color: 'white' }} />
                  </button>
                </div>
              )}
              {formData.cover_image_url && !coverPreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={formData.cover_image_url} 
                    alt="Current cover"
                    style={{ width: '200px', height: '120px', borderRadius: '12px', objectFit: 'cover' }}
                  />
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
              onClick={handleCreateCommunity}
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
              Create Community
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
