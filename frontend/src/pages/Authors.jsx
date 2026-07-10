import { useState, useEffect, useContext } from 'react'
import { Plus, Search, Edit, Trash2, Mail, User as UserIcon, Upload, Calendar } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

export default function Authors() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  
  // Fetch authors from backend
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const data = await api.get('/authors')
        setAuthors(data)
      } catch (error) {
        console.error('Failed to fetch authors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuthors()
  }, [])

  // Hide header and sidebar when create/edit modals are open
  useEffect(() => {
    setHideHeader(showCreateModal || showEditModal)
    setHideSidebar(showCreateModal || showEditModal)
  }, [showCreateModal, showEditModal, setHideHeader, setHideSidebar])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateAuthor = async () => {
    console.log('Creating author:', formData)
    console.log('Avatar file:', avatarFile)
    
    if (!formData.name || formData.name.trim() === '') {
      alert('Please fill in the name field')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('bio', formData.bio)
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile)
      }

      console.log('Sending FormData to /authors')
      const response = await api.post('/authors', formDataToSend)
      console.log('Response:', response)
      
      setShowCreateModal(false)
      setFormData({ name: '', email: '', bio: '' })
      setAvatarFile(null)
      setAvatarPreview(null)
      // Refresh authors list
      const data = await api.get('/authors')
      setAuthors(data)
      alert('Author created successfully!')
    } catch (error) {
      console.error('Failed to create author:', error)
      alert('Failed to create author: ' + error.message)
    }
  }

  const handleEditAuthor = (author) => {
  setEditingAuthor(author)
  setFormData({
    name: author.name,
    email: author.email || '',
    bio: author.bio || ''
  })
  setAvatarPreview(author.avatar_url ? (author.avatar_url.startsWith('http') ? author.avatar_url : `http://localhost:5002${author.avatar_url}`) : null)
  setShowEditModal(true)
}

const handleUpdateAuthor = async () => {
  if (!editingAuthor) return
  
  if (!formData.name || formData.name.trim() === '') {
    alert('Please fill in the name field')
    return
  }
  
  try {
    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('email', formData.email)
    formDataToSend.append('bio', formData.bio)
    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile)
    }

    console.log('Updating author:', editingAuthor.id)
    const response = await api.put(`/authors/${editingAuthor.id}`, formDataToSend)
    console.log('Response:', response)
    
    setShowEditModal(false)
    setEditingAuthor(null)
    setFormData({ name: '', email: '', bio: '', role: 'Author', social_links: '' })
    setAvatarFile(null)
    setAvatarPreview(null)
    // Refresh authors list
    const data = await api.get('/authors')
    setAuthors(data)
    alert('Author updated successfully!')
  } catch (error) {
    console.error('Failed to update author:', error)
    alert('Failed to update author: ' + error.message)
  }
}

  const handleDeleteAuthor = async (authorId) => {
    if (!confirm('Are you sure you want to delete this author?')) {
      return
    }
    
    try {
      await api.delete(`/authors/${authorId}`)
      // Refresh authors list
      const data = await api.get('/authors')
      setAuthors(data)
      alert('Author deleted successfully!')
    } catch (error) {
      console.error('Failed to delete author:', error)
      alert('Failed to delete author: ' + error.message)
    }
  }

  const filteredAuthors = authors.map(author => ({
    ...author,
    articles: 0, // Backend doesn't track article count yet
    avatar: author.avatar_url
  })).filter(author =>
    (author.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (author.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const totalAuthors = authors.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Authors</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage author profiles and information</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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
          Add Author
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <UserIcon style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalAuthors}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Authors</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
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
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      {/* Authors Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Author</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Bio</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Joined</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuthors.map((author) => (
              <tr key={author.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {author.avatar_url ? (
                        <img 
                          src={author.avatar_url.startsWith('http') ? author.avatar_url : `http://localhost:5002${author.avatar_url}`}
                          alt={author.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <UserIcon style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{author.name}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {author.email || '-'}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {author.bio || '-'}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {author.created_at ? new Date(author.created_at).toISOString().split('T')[0] : '-'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button 
                      onClick={() => handleEditAuthor(author)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Edit style={{ width: '14px', height: '14px', color: '#64748b' }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAuthor(author.id)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Add New Author</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.color = '#64748b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#94a3b8'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    id="avatar-input"
                  />
                  <div 
                    onClick={() => document.getElementById('avatar-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Upload avatar</p>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full name"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Author biography..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#64748b',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAuthor}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
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
                Save Author
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Edit Author</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingAuthor(null)
                  setFormData({ name: '', email: '', bio: '' })
                  setAvatarFile(null)
                  setAvatarPreview(null)
                }}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#94a3b8',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.color = '#64748b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#94a3b8'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    id="edit-avatar-input"
                  />
                  <div 
                    onClick={() => document.getElementById('edit-avatar-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Upload avatar</p>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full name"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Author biography..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingAuthor(null)
                  setFormData({ name: '', email: '', bio: '' })
                  setAvatarFile(null)
                  setAvatarPreview(null)
                }}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#64748b',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAuthor}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
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
                Update Author
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
