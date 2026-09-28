import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext, ThemeContext } from '../contexts/LayoutContexts'

export default function CreateOpportunity() {
  const navigate = useNavigate()
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const { isDarkMode } = useContext(ThemeContext)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    organization_name: '',
    opportunity_type: 'free',
    status: 'draft',
    featured: false,
    country: '',
    city: '',
    location: '',
    remote: false,
    application_url: '',
    application_email: '',
    deadline: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    setHideHeader(false)
    setHideSidebar(false)
  }, [setHideHeader, setHideSidebar])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/categories')
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateOpportunity = async () => {
    if (!formData.title || formData.title.trim() === '') {
      alert('Please fill in the opportunity title field')
      return
    }

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'remote' || key === 'featured') {
          formDataToSend.append(key, formData[key] ? 'true' : 'false')
        } else {
          formDataToSend.append(key, formData[key] || '')
        }
      })
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }

      await api.post('/opportunities', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Opportunity created successfully!')
      navigate('/dashboard/events')
    } catch (error) {
      console.error('Failed to create opportunity:', error)
      alert('Failed to create opportunity: ' + error.message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>Create Opportunity</h1>
          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Add a new opportunity to the platform</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/events')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#334155' : '#f8fafc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Cancel
        </button>
      </div>

      <div style={{
        background: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter opportunity title..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter opportunity description..."
              rows="4"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                transition: 'all 0.2s ease',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="">Select category...</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Opportunity Image</label>
            <input
              type="file"
              name="image"
              onChange={(e) => setImageFile(e.target.files[0])}
              accept="image/*"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                transition: 'all 0.2s ease'
              }}
            />
            {imageFile && (
              <p style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Organization Name</label>
            <input
              type="text"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleInputChange}
              placeholder="Organization name"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Full address or venue"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              name="remote"
              checked={formData.remote}
              onChange={(e) => setFormData(prev => ({ ...prev, remote: e.target.checked }))}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#7c3aed'
              }}
            />
            <label style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', cursor: 'pointer' }}>Remote Opportunity</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Application URL</label>
              <input
                type="text"
                name="application_url"
                value={formData.application_url}
                onChange={handleInputChange}
                placeholder="https://example.com/apply"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Application Email</label>
              <input
                type="email"
                name="application_email"
                value={formData.application_email}
                onChange={handleInputChange}
                placeholder="apply@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Opportunity Type</label>
              <select 
                name="opportunity_type"
                value={formData.opportunity_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
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
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <option value="free">Free</option>
                <option value="partner">Partner</option>
                <option value="sponsored">Sponsored</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
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
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="expired">Expired</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#7c3aed'
              }}
            />
            <label style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', cursor: 'pointer' }}>Featured Opportunity</label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCreateOpportunity}
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
          }}
        >
          Create Opportunity
        </button>
      </div>
    </div>
  )
}
