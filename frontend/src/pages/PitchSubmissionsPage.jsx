import { useState, useEffect, useContext } from 'react'
import { Save, Eye, Mail, Phone, FileText, Clock, Check, X, Filter, Search, Calendar, Lightbulb, Trash2 } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext } from '../components/Layout'

export default function PitchSubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [attachmentError, setAttachmentError] = useState(null)
  const { setHideHeader } = useContext(HeaderVisibilityContext)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  // Hide header when modal is open
  useEffect(() => {
    if (showModal) {
      setHideHeader(true)
    } else {
      setHideHeader(false)
    }
    // Cleanup on unmount
    return () => setHideHeader(false)
  }, [showModal, setHideHeader])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const data = await api.get('/pitch-submissions')
      setSubmissions(data)
    } catch (error) {
      console.error('Failed to fetch pitch submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/pitch-submissions/${id}/status`, { status: newStatus })
      fetchSubmissions()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await api.delete(`/pitch-submissions/${id}`)
        fetchSubmissions()
      } catch (error) {
        console.error('Failed to delete submission:', error)
      }
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    const matchesSearch = 
      sub.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.pitch_title?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'reviewed': return 'var(--text-primary)'
      case 'accepted': return '#10b981'
      case 'rejected': return '#ef4444'
      default: return 'var(--text-secondary)'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'reviewed': return 'Reviewed'
      case 'accepted': return 'Accepted'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Pitch Submissions</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Manage content and episode pitch submissions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <Eye style={{ width: '16px', height: '16px' }} />
            Preview
          </button>
        </div>
      </div>

      {/* Error notification */}
      {attachmentError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#dc2626',
          fontSize: '13px'
        }}>
          <X style={{ width: '16px', height: '16px', cursor: 'pointer' }} onClick={() => setAttachmentError(null)} />
          <span>{attachmentError}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              outline: 'none',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                background: filterStatus === status ? '#7c3aed' : 'var(--bg-secondary)',
                color: filterStatus === status ? 'white' : 'var(--text-secondary)',
                border: filterStatus === status ? 'none' : '1px solid var(--border-color)',
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

      {/* Submissions List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading submissions...</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          {filteredSubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Lightbulb style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No submissions found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredSubmissions.map((submission, index) => (
                <div
                  key={submission.id || `submission-${index}`}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.borderColor = '#7c3aed'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                  }}
                  onClick={() => {
                    setSelectedSubmission(submission)
                    setShowModal(true)
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Lightbulb style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{submission.pitch_title}</p>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: `${getStatusColor(submission.status)}20`,
                        color: getStatusColor(submission.status),
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {getStatusLabel(submission.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                        <Mail style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                        {submission.full_name}
                      </span>
                      {submission.topic && (
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                          <FileText style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                          {submission.topic}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar style={{ width: '13px', height: '13px' }} />
                        {new Date(submission.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {submission.article_attachment && (
                        <span
                          onClick={async (e) => {
                            e.stopPropagation()
                            setAttachmentError(null)
                            const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 
                              (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                                ? 'http://localhost:5002' 
                                : 'https://trendorabay-content-management-system.onrender.com')
                            try {
                              // Always use the proxy route for both local files and Cloudinary URLs
                              const filename = submission.article_attachment.split('/').pop()
                              const response = await fetch(`${API_BASE_URL}/api/pitch-submissions/attachment/${filename}`)
                              if (!response.ok) {
                                let errorMessage = 'Failed to open attachment'
                                try {
                                  const errorData = await response.json()
                                  errorMessage = errorData.message || errorData.error || errorMessage
                                } catch (jsonError) {
                                  // Response body is not JSON, use status text
                                  errorMessage = response.statusText || errorMessage
                                }
                                throw new Error(errorMessage)
                              }
                              const blob = await response.blob()
                              const url = window.URL.createObjectURL(blob)
                              window.open(url, '_blank')
                            } catch (error) {
                              setAttachmentError(error.message || 'Failed to open attachment. The file may not be available on the server.')
                            }
                          }}
                          style={{ 
                            fontSize: '12px', 
                            color: '#7c3aed', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontWeight: '500',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#f5f3ff',
                            border: '1px solid #e9d5ff',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#7c3aed'
                            e.currentTarget.style.color = 'white'
                            e.currentTarget.style.borderColor = '#7c3aed'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f5f3ff'
                            e.currentTarget.style.color = '#7c3aed'
                            e.currentTarget.style.borderColor = '#e9d5ff'
                          }}
                        >
                          <FileText style={{ width: '13px', height: '13px' }} />
                          View attachment
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSubmission(submission)
                        setShowModal(true)
                      }}
                      style={{
                        padding: '10px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7c3aed'
                        e.currentTarget.style.borderColor = '#7c3aed'
                        e.currentTarget.querySelector('svg').style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)'
                        e.currentTarget.style.borderColor = 'var(--border-color)'
                        e.currentTarget.querySelector('svg').style.color = 'var(--text-secondary)'
                      }}
                      title="View Details"
                    >
                      <Eye style={{ width: '18px', height: '18px', color: 'var(--text-secondary)', transition: 'color 0.2s ease' }} />
                    </button>
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(submission.id, 'reviewed')
                          }}
                          style={{
                            padding: '10px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#7c3aed'
                            e.currentTarget.style.borderColor = '#7c3aed'
                            e.currentTarget.querySelector('svg').style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--border-color)'
                            e.currentTarget.querySelector('svg').style.color = 'var(--text-secondary)'
                          }}
                          title="Mark as Reviewed"
                        >
                          <Filter style={{ width: '18px', height: '18px', color: 'var(--text-secondary)', transition: 'color 0.2s ease' }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(submission.id, 'accepted')
                          }}
                          style={{
                            padding: '10px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#10b981'
                            e.currentTarget.style.borderColor = '#10b981'
                            e.currentTarget.querySelector('svg').style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--border-color)'
                            e.currentTarget.querySelector('svg').style.color = '#10b981'
                          }}
                          title="Accept"
                        >
                          <Check style={{ width: '18px', height: '18px', color: '#10b981', transition: 'color 0.2s ease' }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(submission.id, 'rejected')
                          }}
                          style={{
                            padding: '10px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444'
                            e.currentTarget.style.borderColor = '#ef4444'
                            e.currentTarget.querySelector('svg').style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--border-color)'
                            e.currentTarget.querySelector('svg').style.color = '#ef4444'
                          }}
                          title="Reject"
                        >
                          <X style={{ width: '18px', height: '18px', color: '#ef4444', transition: 'color 0.2s ease' }} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(submission.id)
                      }}
                      style={{
                        padding: '10px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.borderColor = '#ef4444'
                        e.currentTarget.querySelector('svg').style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)'
                        e.currentTarget.style.borderColor = 'var(--border-color)'
                        e.currentTarget.querySelector('svg').style.color = '#ef4444'
                      }}
                      title="Delete"
                    >
                      <Trash2 style={{ width: '18px', height: '18px', color: '#ef4444', transition: 'color 0.2s ease' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedSubmission && (
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
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Pitch Details</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: 'var(--text-secondary)'
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
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Lightbulb style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedSubmission.pitch_title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>by {selectedSubmission.full_name}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail style={{ width: '14px', height: '14px' }} />
                      {selectedSubmission.email}
                    </p>
                  </div>
                  {selectedSubmission.phone && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone</label>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        {selectedSubmission.phone}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.topic && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Topic</label>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText style={{ width: '14px', height: '14px' }} />
                        {selectedSubmission.topic}
                      </p>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Status</label>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: `${getStatusColor(selectedSubmission.status)}20`,
                      color: getStatusColor(selectedSubmission.status),
                      fontWeight: '500'
                    }}>
                      {getStatusLabel(selectedSubmission.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Pitch Description</label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{selectedSubmission.pitch_description}</p>
                </div>

                {selectedSubmission.author_bio && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Author Bio</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{selectedSubmission.author_bio}</p>
                  </div>
                )}

                {selectedSubmission.topics_of_interest && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Topics of Interest</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{selectedSubmission.topics_of_interest}</p>
                  </div>
                )}

                {selectedSubmission.previous_publications && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Previous Publications</label>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{selectedSubmission.previous_publications}</p>
                  </div>
                )}

                {selectedSubmission.article_attachment && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Article Attachment</label>
                    <button
                      onClick={async () => {
                        setAttachmentError(null)
                        const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 
                          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                            ? 'http://localhost:5002' 
                            : 'https://trendorabay-content-management-system.onrender.com')
                        try {
                          // Always use the proxy route for both local files and Cloudinary URLs
                          const filename = selectedSubmission.article_attachment.split('/').pop()
                          const response = await fetch(`${API_BASE_URL}/api/pitch-submissions/attachment/${filename}`)
                          if (!response.ok) {
                            let errorMessage = 'Failed to open attachment'
                            try {
                              const errorData = await response.json()
                              errorMessage = errorData.message || errorData.error || errorMessage
                            } catch (jsonError) {
                              // Response body is not JSON, use status text
                              errorMessage = response.statusText || errorMessage
                            }
                            throw new Error(errorMessage)
                          }
                          const blob = await response.blob()
                          const url = window.URL.createObjectURL(blob)
                          window.open(url, '_blank')
                        } catch (error) {
                          setAttachmentError(error.message || 'Failed to open attachment. The file may not be available on the server.')
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                        border: '1px solid #e9d5ff',
                        borderRadius: '10px',
                        color: '#7c3aed',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: 'fit-content'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #764ba2 100%)'
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.borderColor = '#7c3aed'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
                        e.currentTarget.style.color = '#7c3aed'
                        e.currentTarget.style.borderColor = '#e9d5ff'
                      }}
                    >
                      <FileText style={{ width: '18px', height: '18px' }} />
                      Open attachment in new tab
                    </button>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Submitted on {new Date(selectedSubmission.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{
              padding: '20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {selectedSubmission.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedSubmission.id, 'accepted')
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
                    <Check style={{ width: '16px', height: '16px' }} />
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedSubmission.id, 'rejected')
                      setShowModal(false)
                    }}
                    style={{
                      padding: '10px 20px',
                      background: '#ef4444',
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
                    <X style={{ width: '16px', height: '16px' }} />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
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
