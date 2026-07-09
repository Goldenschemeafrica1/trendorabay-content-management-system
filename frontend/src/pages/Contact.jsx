import { useState, useEffect } from 'react'
import { Mail, Phone, MessageSquare, Clock, Check, X, Filter, Search, Calendar, Inbox, Archive, Trash2, Reply } from 'lucide-react'
import api from '../services/api'

export default function Contact() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const data = await api.get('/contact-messages')
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch contact messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/contact-messages/${id}/status`, { status: newStatus })
      fetchMessages()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/contact-messages/${id}`)
        fetchMessages()
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'unread': return '#ef4444'
      case 'read': return '#3b82f6'
      case 'replied': return '#10b981'
      case 'archived': return '#64748b'
      default: return '#64748b'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'unread': return 'Unread'
      case 'read': return 'Read'
      case 'replied': return 'Replied'
      case 'archived': return 'Archived'
      default: return status
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Contact Messages</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage messages from website visitors</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              outline: 'none',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'unread', 'read', 'replied', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                background: filterStatus === status ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : '#f8fafc',
                color: filterStatus === status ? 'white' : '#64748b',
                border: filterStatus === status ? 'none' : '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p style={{ color: '#64748b' }}>Loading messages...</p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          {filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Inbox style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>No messages found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    background: (message.status === 'unread' || message.status === 'pending') ? '#f0f9ff' : '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: (message.status === 'unread' || message.status === 'pending') ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: (message.status === 'unread' || message.status === 'pending') ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MessageSquare style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{message.name}</p>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: `${getStatusColor(message.status)}20`,
                        color: getStatusColor(message.status),
                        fontWeight: '500'
                      }}>
                        {getStatusLabel(message.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail style={{ width: '12px', height: '12px' }} />
                        {message.email}
                      </span>
                      {message.subject && (
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageSquare style={{ width: '12px', height: '12px' }} />
                          {message.subject}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {message.message}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedMessage(message)
                        setShowModal(true)
                        if (message.status === 'unread' || message.status === 'pending') {
                          handleStatusUpdate(message.id, 'read')
                        }
                      }}
                      style={{
                        padding: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="View Details"
                    >
                      <Mail style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    </button>
                    {(message.status === 'read' || message.status === 'pending') && (
                      <button
                        onClick={() => handleStatusUpdate(message.id, 'replied')}
                        style={{
                          padding: '8px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Mark as Replied"
                      >
                        <Reply style={{ width: '16px', height: '16px', color: '#10b981' }} />
                      </button>
                    )}
                    {message.status !== 'archived' && (
                      <button
                        onClick={() => handleStatusUpdate(message.id, 'archived')}
                        style={{
                          padding: '8px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Archive"
                      >
                        <Archive style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      style={{
                        padding: '8px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Delete"
                    >
                      <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedMessage && (
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
            width: '90%',
            maxWidth: '700px',
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
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Message Details</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#94a3b8'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: (selectedMessage.status === 'unread' || selectedMessage.status === 'pending') ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageSquare style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>{selectedMessage.name}</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>{selectedMessage.email}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Email</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail style={{ width: '14px', height: '14px' }} />
                      {selectedMessage.email}
                    </p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone</label>
                      <p style={{ fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        {selectedMessage.phone}
                      </p>
                    </div>
                  )}
                  {selectedMessage.subject && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Subject</label>
                      <p style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{selectedMessage.subject}</p>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Status</label>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: `${getStatusColor(selectedMessage.status)}20`,
                      color: getStatusColor(selectedMessage.status),
                      fontWeight: '500'
                    }}>
                      {getStatusLabel(selectedMessage.status)}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Received</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar style={{ width: '14px', height: '14px' }} />
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Message</label>
                  <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.admin_notes && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Admin Notes</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6' }}>{selectedMessage.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div style={{
              padding: '20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {(selectedMessage.status === 'read' || selectedMessage.status === 'pending') && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedMessage.id, 'replied')
                    setShowModal(false)
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Reply style={{ width: '16px', height: '16px' }} />
                  Mark as Replied
                </button>
              )}
              {selectedMessage.status !== 'archived' && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedMessage.id, 'archived')
                    setShowModal(false)
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Archive style={{ width: '16px', height: '16px' }} />
                  Archive
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f8fafc',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
