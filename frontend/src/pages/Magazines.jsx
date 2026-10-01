import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Upload } from 'lucide-react'
import api from '../services/api'
import { ThemeContext } from '../contexts/LayoutContexts'

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5002'
    : 'https://trendorabay-content-management-system.onrender.com');

export default function Magazines() {
  const { isDarkMode } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [magazines, setMagazines] = useState([])
  const [,setLoading] = useState(true)
  
  // Fetch magazines from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const magazinesData = await api.get('/magazines')
        setMagazines(magazinesData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeleteMagazine = async (magazineId) => {
    if (!confirm('Are you sure you want to delete this magazine?')) {
      return
    }
    
    try {
      await api.delete(`/magazines/${magazineId}`)
      // Refresh magazines list
      const data = await api.get('/magazines')
      setMagazines(data)
      alert('Magazine deleted successfully!')
    } catch (error) {
      console.error('Failed to delete magazine:', error)
      alert('Failed to delete magazine: ' + error.message)
    }
  }

  const handleEditMagazine = (magazine) => {
    navigate(`/dashboard/magazines/edit/${magazine.id}`)
  }

  const filteredMagazines = magazines.map(magazine => ({
    ...magazine,
    date: magazine.published_date ? new Date(magazine.published_date).toLocaleDateString() : 'N/A',
    category: magazine.category_name || 'Uncategorized',
    status: 'published' // Backend doesn't have status field yet
  })).filter(magazine =>
    magazine.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>Magazines</h1>
          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage magazine issues and publications</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/magazines/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
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
          Add Magazine
        </button>
      </div>

      {/* Search */}
      <div style={{ maxWidth: '448px' }}>
        <input
          type="text"
          placeholder="Search magazines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: isDarkMode ? '#1e293b' : '#f8fafc',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '10px',
            outline: 'none',
            fontSize: '13px',
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

      {/* Magazines Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredMagazines.map((magazine) => (
          <div key={magazine.id} style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: isDarkMode ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ 
              aspectRatio: '3/4', 
              background: magazine.cover_image_url ? 'transparent' : (isDarkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100)'), 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {magazine.cover_image_url ? (
                <img 
                  src={magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `${BASE_URL}${magazine.cover_image_url}`} 
                  alt={magazine.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    console.error('Image load error:', e)
                    console.error('Image URL:', magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `${BASE_URL}${magazine.cover_image_url}`)
                    console.error('Magazine data:', magazine)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: isDarkMode ? '#64748b' : '#94a3b8' }}>
                  <Upload style={{ width: '36px', height: '36px', margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '12px' }}>Cover Image</p>
                </div>
              )}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ fontWeight: '600', color: isDarkMode ? '#f1f5f9' : '#0f172a', fontSize: '14px', flex: 1 }}>{magazine.title}</h3>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '16px', 
                  fontSize: '11px', 
                  fontWeight: '500',
                  flexShrink: 0,
                  marginLeft: '6px',
                  background: magazine.status === 'published' ? '#dcfce7' : '#fef9c3',
                  color: magazine.status === 'published' ? '#166534' : '#854d0e'
                }}>
                  {magazine.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>{magazine.issue}</p>
              <p style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8', marginBottom: '12px' }}>{magazine.date}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  background: isDarkMode ? '#334155' : '#f1f5f9',
                  color: isDarkMode ? '#94a3b8' : '#475569', 
                  borderRadius: '16px', 
                  fontSize: '11px', 
                  fontWeight: '500'
                }}>
                  {magazine.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button style={{
                    padding: '6px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}>
                    <Eye style={{ width: '14px', height: '14px', color: isDarkMode ? '#94a3b8' : '#64748b' }} />
                  </button>
                  <button 
                    onClick={() => handleEditMagazine(magazine)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}>
                    <Edit style={{ width: '14px', height: '14px', color: isDarkMode ? '#94a3b8' : '#64748b' }} />
                  </button>
                  <button 
                    onClick={() => handleDeleteMagazine(magazine.id)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}>
                    <Trash2 style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
