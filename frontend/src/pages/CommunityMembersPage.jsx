import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserPlus, Shield, Trash2, Search, Crown } from 'lucide-react'
import api from '../services/api'

export default function CommunityMembersPage() {
  const navigate = useNavigate()
  const { communityId } = useParams()
  const [members, setMembers] = useState([])
  const [community, setCommunity] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMember, setNewMember] = useState({ user_id: '', role: 'member' })
  const [loading, setLoading] = useState(true)

  const roleOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'contributor', label: 'Contributor' },
    { value: 'member', label: 'Member' }
  ]

  useEffect(() => {
    fetchCommunity()
    fetchMembers()
  }, [communityId])

  const fetchCommunity = async () => {
    try {
      const data = await api.get(`/communities/${communityId}`)
      setCommunity(data)
    } catch (error) {
      console.error('Failed to fetch community:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      console.log('Fetching members for community:', communityId)
      const data = await api.get(`/community-members/community/${communityId}`)
      console.log('Members data received:', data)
      setMembers(data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMember.user_id) {
      alert('Please enter a user ID')
      return
    }

    try {
      await api.post('/community-members', {
        community_id: parseInt(communityId),
        user_id: parseInt(newMember.user_id),
        role: newMember.role
      })
      alert('Member added successfully!')
      setShowAddModal(false)
      setNewMember({ user_id: '', role: 'member' })
      fetchMembers()
    } catch (error) {
      console.error('Failed to add member:', error)
      alert('Failed to add member: ' + error.message)
    }
  }

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      const member = members.find(m => m.id === memberId)
      await api.put(`/community-members/${memberId}`, {
        role: newRole,
        status: member.status
      })
      alert('Role updated successfully!')
      fetchMembers()
    } catch (error) {
      console.error('Failed to update role:', error)
      alert('Failed to update role: ' + error.message)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      await api.delete(`/community-members/${memberId}`)
      alert('Member removed successfully!')
      fetchMembers()
    } catch (error) {
      console.error('Failed to remove member:', error)
      alert('Failed to remove member: ' + error.message)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const roleCounts = {
    owner: members.filter(m => m.role === 'owner').length,
    admin: members.filter(m => m.role === 'admin').length,
    moderator: members.filter(m => m.role === 'moderator').length,
    contributor: members.filter(m => m.role === 'contributor').length,
    member: members.filter(m => m.role === 'member').length
  }

  if (loading) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {community?.name || 'Community'} Members
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>
              Manage community members and their roles
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
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
          <UserPlus style={{ width: '20px', height: '20px' }} />
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{members.length}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Members</p>
            </div>
          </div>
        </div>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Crown style={{ width: '16px', height: '16px', color: '#d97706' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{roleCounts.owner + roleCounts.admin}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Admins</p>
            </div>
          </div>
        </div>
        <div style={{
          background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{roleCounts.moderator}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Moderators</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search members..."
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
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
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
          <option value="all">All Roles</option>
          {roleOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Members Table */}
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
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Member</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Joined</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {member.profile_image_url ? (
                      <img 
                        src={member.profile_image_url} 
                        alt={member.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '14px' }}>{member.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{member.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: member.status === 'active' ? '#dcfce7' : member.status === 'banned' ? '#fee2e2' : member.status === 'pending' ? '#fef9c3' : '#f3f4f6',
                    color: member.status === 'active' ? '#166534' : member.status === 'banned' ? '#991b1b' : member.status === 'pending' ? '#854d0e' : '#6b7280'
                  }}>
                    {member.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
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
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No members found
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>
              Add New Member
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  User ID *
                </label>
                <input
                  type="number"
                  value={newMember.user_id}
                  onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
                  placeholder="Enter user ID..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewMember({ user_id: '', role: 'member' })
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white'
                  }}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
