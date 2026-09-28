import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext, ThemeContext } from '../contexts/LayoutContexts'

export default function ViewStory() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const { isDarkMode } = useContext(ThemeContext)
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setHideHeader(false)
    setHideSidebar(false)
  }, [setHideHeader, setHideSidebar])

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const data = await api.get(`/stories/${id}`)
        setStory(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch story:', error)
        alert('Failed to load story')
        navigate('/dashboard/stories')
      }
    }
    fetchStory()
  }, [id, navigate])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Loading...</div>
      </div>
    )
  }

  if (!story) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Story not found</div>
      </div>
    )
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trendorabay-content-management-system.onrender.com/api'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>Story Preview</h1>
          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>View story details</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/stories')}
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
          Back to Stories
        </button>
      </div>

      <div style={{
        background: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        {(story.featured_image_url || story.featured_image_url_2 || story.featured_image_url_3 || story.featured_image_url_4) && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {story.featured_image_url && (
              <div style={{ 
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                aspectRatio: '16/9'
              }}>
                <img 
                  src={story.featured_image_url.startsWith('http') ? story.featured_image_url : `${API_BASE_URL}${story.featured_image_url}`} 
                  alt="Cover Image" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            )}
            {story.featured_image_url_2 && (
              <div style={{ 
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                aspectRatio: '16/9'
              }}>
                <img 
                  src={story.featured_image_url_2.startsWith('http') ? story.featured_image_url_2 : `${API_BASE_URL}${story.featured_image_url_2}`} 
                  alt="Featured Image 2" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            )}
            {story.featured_image_url_3 && (
              <div style={{ 
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                aspectRatio: '16/9'
              }}>
                <img 
                  src={story.featured_image_url_3.startsWith('http') ? story.featured_image_url_3 : `${API_BASE_URL}${story.featured_image_url_3}`} 
                  alt="Featured Image 3" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            )}
            {story.featured_image_url_4 && (
              <div style={{ 
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                aspectRatio: '16/9'
              }}>
                <img 
                  src={story.featured_image_url_4.startsWith('http') ? story.featured_image_url_4 : `${API_BASE_URL}${story.featured_image_url_4}`} 
                  alt="Featured Image 4" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            )}
          </div>
        )}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ 
            padding: '4px 8px', 
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
            color: 'white', 
            borderRadius: '12px', 
            fontSize: '11px', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {story.category || story.category_name || 'Uncategorized'}
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: isDarkMode ? '#f1f5f9' : '#0f172a', marginBottom: '12px', lineHeight: '1.3' }}>{story.title}</h1>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569' }}>Author:</span>
            <span>{story.author_name || 'Unknown'}</span>
          </div>
          <span style={{ color: isDarkMode ? '#64748b' : '#cbd5e1' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569' }}>Category:</span>
            <span>{story.category || story.category_name || 'Uncategorized'}</span>
          </div>
          <span style={{ color: isDarkMode ? '#64748b' : '#cbd5e1' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569' }}>Status:</span>
            <span style={{ 
              padding: '2px 6px', 
              borderRadius: '8px', 
              fontSize: '10px', 
              fontWeight: '500',
              background: story.status === 'published' ? '#dcfce7' : '#fef9c3',
              color: story.status === 'published' ? '#166534' : '#854d0e'
            }}>
              {story.status}
            </span>
          </div>
        </div>
        <div style={{ 
          borderTop: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9', 
          paddingTop: '16px'
        }}>
          <div 
            style={{ 
              fontSize: '14px', 
              lineHeight: '1.6', 
              color: isDarkMode ? '#94a3b8' : '#374151'
            }}
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        </div>
      </div>
    </div>
  )
}
