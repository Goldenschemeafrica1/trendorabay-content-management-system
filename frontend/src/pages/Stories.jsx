import { useState, useEffect, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext, ThemeContext } from '../contexts/LayoutContexts'

export default function Stories() {
  const navigate = useNavigate()
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const { isDarkMode } = useContext(ThemeContext)
  const [searchParams] = useSearchParams()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stories, setStories] = useState([])
  const [,setLoading] = useState(true)

  // Handle search from URL parameter
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [searchParams])

  // Fetch stories from backend
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await api.get('/stories')
        setStories(data)
      } catch (error) {
        console.error('Failed to fetch stories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStories()
  }, [])

  // Always show header and sidebar
  useEffect(() => {
    setHideHeader(false)
    setHideSidebar(false)
  }, [setHideHeader, setHideSidebar])
  
  const handleDeleteStory = async (storyId) => {
    if (!confirm('Are you sure you want to delete this story?')) {
      return
    }
    
    try {
      await api.delete(`/stories/${storyId}`)
      // Refresh stories list
      const data = await api.get('/stories')
      setStories(data)
      alert('Story deleted successfully!')
    } catch (error) {
      console.error('Failed to delete story:', error)
      alert('Failed to delete story: ' + error.message)
    }
  }

  const handleEditStory = (story) => {
    navigate(`/dashboard/stories/edit/${story.id}`)
  }

  const filteredStories = stories.map(story => ({
    ...story,
    date: story.published_at ? new Date(story.published_at).toLocaleDateString() : story.created_at ? new Date(story.created_at).toLocaleDateString() : 'N/A',
    author: story.author_name || 'Unknown',
    category: story.category_name || story.category || 'Uncategorized',
    views: story.views || 0
  })).filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (story.author && story.author.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || story.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>Stories</h1>
          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Manage your articles and blog posts</p>
        </div>
        <button onClick={() => navigate('/dashboard/stories/create')}
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
          Create Story
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: isDarkMode ? '#1e293b' : '#f8fafc',
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 16px',
            background: isDarkMode ? '#1e293b' : '#f8fafc',
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
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Stories Table */}
      <div style={{
        background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: isDarkMode ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: isDarkMode ? '#1e293b' : '#f8fafc', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Author</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Views</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.map((story) => (
              <tr key={story.id} style={{ borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#334155' : '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontWeight: '500', color: isDarkMode ? '#f1f5f9' : '#0f172a', fontSize: '14px' }}>{story.title}</span>
                </td>
                <td style={{ padding: '16px 24px', color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>{story.author}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 12px',
                    background: isDarkMode ? '#334155' : '#f1f5f9',
                    color: isDarkMode ? '#94a3b8' : '#475569',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {story.category}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: story.status === 'published' ? '#dcfce7' : '#fef9c3',
                    color: story.status === 'published' ? '#166534' : '#854d0e'
                  }}>
                    {story.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>{story.date}</td>
                <td style={{ padding: '16px 24px', color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>{story.views.toLocaleString()}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/dashboard/stories/view/${story.id}`)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Eye style={{ width: '16px', height: '16px', color: isDarkMode ? '#94a3b8' : '#64748b' }} />
                    </button>
                    <button
                      onClick={() => handleEditStory(story)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Edit style={{ width: '16px', height: '16px', color: isDarkMode ? '#94a3b8' : '#64748b' }} />
                    </button>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2'
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
