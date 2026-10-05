import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Users, MessageSquare, Calendar, Shield, UserCog } from 'lucide-react'
import api from '../services/api'

export default function CommunitiesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [communities, setCommunities] = useState([])
  const [,setLoading] = useState(true)
  
  // Fetch communities from backend
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await api.get('/communities')
        setCommunities(data)
      } catch (error) {
        console.error('Failed to fetch communities:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCommunities()
  }, [])

  const handleDeleteCommunity = async (communityId) => {
    if (!confirm('Are you sure you want to delete this community?')) {
      return
    }
    
    try {
      await api.delete(`/communities/${communityId}`)
      const data = await api.get('/communities')
      setCommunities(data)
      alert('Community deleted successfully!')
    } catch (error) {
      console.error('Failed to delete community:', error)
      alert('Failed to delete community: ' + error.message)
    }
  }

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || community.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalMembers = communities.reduce((sum, c) => sum + (c.member_count || 0), 0)
  const totalPosts = communities.reduce((sum, c) => sum + (c.post_count || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Communities</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage community groups and discussions</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/communities/create')}
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
          Add Community
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
              <Users style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{communities.length}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>Total Communities</p>
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
              <MessageSquare style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalMembers}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>Total Members</p>
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
              <MessageSquare style={{ width: '16px', height: '16px', color: '#9333ea' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalPosts}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>Total Posts</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search communities..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Communities Table */}
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
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Community</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Members</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Posts</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommunities.map((community) => (
              <tr key={community.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {community.icon_url && (
                      <img 
                        src={community.icon_url} 
                        alt={community.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <p style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{community.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{community.short_description || ''}</p>
                    </div>
                  </div>
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
                    {community.category}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {community.community_type}
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {community.member_count || 0}
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {community.post_count || 0}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    background: community.status === 'active' ? '#dcfce7' : community.status === 'inactive' ? '#fef9c3' : '#fee2e2',
                    color: community.status === 'active' ? '#166534' : community.status === 'inactive' ? '#854d0e' : '#991b1b'
                  }}>
                    {community.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => navigate(`/dashboard/communities/members/${community.id}`)}
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
                      <UserCog style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                    </button>
                    <button 
                      onClick={() => navigate(`/dashboard/communities/edit/${community.id}`)}
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
                      onClick={() => handleDeleteCommunity(community.id)}
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
