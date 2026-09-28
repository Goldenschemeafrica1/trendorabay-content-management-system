import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Calendar, Users, Clock } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext, ThemeContext } from '../contexts/LayoutContexts'

export default function Opportunities() {
  const navigate = useNavigate()
  const { setHideHeader: _setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar: _setHideSidebar } = useContext(SidebarVisibilityContext)
  const { isDarkMode: _isDarkMode } = useContext(ThemeContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [opportunities, setOpportunities] = useState([])
  const [_loading, setLoading] = useState(true)
  
  // Fetch opportunities from backend
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await api.get('/opportunities')
        setOpportunities(data)
      } catch (error) {
        console.error('Failed to fetch opportunities:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOpportunities()
  }, [])

  const handleDeleteOpportunity = async (opportunityId) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) {
      return
    }

    try {
      await api.delete(`/opportunities/${opportunityId}`)
      // Refresh opportunities list
      const data = await api.get('/opportunities')
      setOpportunities(data)
      alert('Opportunity deleted successfully!')
    } catch (error) {
      console.error('Failed to delete opportunity:', error)
      alert('Failed to delete opportunity: ' + error.message)
    }
  }

  const handleEditOpportunity = (opportunity) => {
    navigate(`/dashboard/events/edit/${opportunity.id}`)
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = (opportunity.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opportunity.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || opportunity.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalOpportunities = opportunities.length
  const publishedOpportunities = opportunities.filter(e => e.status === 'published').length
  const totalApplications = opportunities.reduce((sum, e) => sum + (Number(e.applications) || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Opportunities</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Manage community opportunities and programs</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/events/create')}
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
          <Plus style={{ width: '16px', height: '16px' }} />
          Add Opportunity
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar style={{ width: '16px', height: '16px', color: '#2563eb' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{totalOpportunities}</h3>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>Total Opportunities</p>
          </div>
        </div>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock style={{ width: '16px', height: '16px', color: '#16a34a' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{publishedOpportunities}</h3>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>Published Opportunities</p>
          </div>
        </div>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '8px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users style={{ width: '16px', height: '16px', color: '#9333ea' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{totalApplications}</h3>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>Total Applications</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
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
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            outline: 'none',
            fontSize: '13px',
            cursor: 'pointer',
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
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Opportunities Table */}
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
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Opportunity</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Deadline</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Applications</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.map((opportunity, index) => (
              <tr key={opportunity.id || `opportunity-${index}`} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '13px' }}>{opportunity.title}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{opportunity.location}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{opportunity.applications}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: '500',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)'
                  }}>
                    {opportunity.opportunity_type}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {(() => {
                    const statusColors = {
                      published: { bg: '#dcfce7', color: '#166534' },
                      draft: { bg: '#f3f4f6', color: '#4b5563' },
                      pending: { bg: '#fef3c7', color: '#92400e' },
                      expired: { bg: '#fee2e2', color: '#991b1b' },
                      rejected: { bg: '#fee2e2', color: '#991b1b' },
                      archived: { bg: '#e0e7ff', color: '#3730a3' }
                    }
                    const s = opportunity.status || 'draft'
                    const colors = statusColors[s] || { bg: '#f3f4f6', color: '#4b5563' }
                    return (
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: colors.bg,
                        color: colors.color
                      }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                    )
                  })()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => handleEditOpportunity(opportunity)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Edit style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                    </button>
                    <button
                      onClick={() => handleDeleteOpportunity(opportunity.id)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef2f2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Trash2 style={{ width: '14px', height: '14px', color: '#dc2626' }} />
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
