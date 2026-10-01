import { useState, useEffect, useContext } from 'react'
import { Eye, Mail, Phone, FileText, Check, X, Filter, Search, Calendar, Lightbulb, Trash2, MapPin, User, Briefcase } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext } from '../contexts/LayoutContexts'

export default function PitchApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { setHideHeader } = useContext(HeaderVisibilityContext)

  useEffect(() => {
    fetchApplications()
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

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const data = await api.get('/write-applications')
      setApplications(data)
    } catch (error) {
      console.error('Failed to fetch write applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/write-applications/${id}/status`, { status: newStatus })
      fetchApplications()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/write-applications/${id}`)
        fetchApplications()
      } catch (error) {
        console.error('Failed to delete application:', error)
      }
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = 
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'reviewed': return 'var(--text-primary)'
      case 'approved': return '#10b981'
      case 'rejected': return '#ef4444'
      default: return 'var(--text-secondary)'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'reviewed': return 'Reviewed'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Pitch Applications</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Manage writer applications and submissions</p>
        </div>
      </div>

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
            placeholder="Search applications..."
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
          {['all', 'pending', 'reviewed', 'approved', 'rejected'].map(status => (
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

      {/* Applications List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading applications...</p>
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
          {filteredApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Lightbulb style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No applications found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredApplications.map((application, index) => (
                <div
                  key={application.id || `application-${index}`}
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
                    setSelectedApplication(application)
                    setShowModal(true)
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}>
                    {application.profile_photo_url ? (
                      <img 
                        src={application.profile_photo_url} 
                        alt={application.full_name}
                        style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }}
                      />
                    ) : (
                      <User style={{ width: '24px', height: '24px', color: 'white' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{application.full_name}</p>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: `${getStatusColor(application.status)}20`,
                        color: getStatusColor(application.status),
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {getStatusLabel(application.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                        <Mail style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                        {application.email}
                      </span>
                      {application.location && (
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                          <MapPin style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                          {application.location}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar style={{ width: '13px', height: '13px' }} />
                        {new Date(application.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {application.portfolio_url && (
                        <a
                          href={application.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            fontSize: '12px', 
                            color: '#7c3aed', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontWeight: '500',
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
                          <Briefcase style={{ width: '13px', height: '13px' }} />
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedApplication(application)
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
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(application.id, 'reviewed')
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
                            handleStatusUpdate(application.id, 'approved')
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
                            e.currentTarget.querySelector('svg').style.color = 'var(--text-secondary)'
                          }}
                          title="Approve"
                        >
                          <Check style={{ width: '18px', height: '18px', color: 'var(--text-secondary)', transition: 'color 0.2s ease' }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(application.id, 'rejected')
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
                            e.currentTarget.querySelector('svg').style.color = 'var(--text-secondary)'
                          }}
                          title="Reject"
                        >
                          <X style={{ width: '18px', height: '18px', color: 'var(--text-secondary)', transition: 'color 0.2s ease' }} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(application.id)
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
                        e.currentTarget.querySelector('svg').style.color = 'var(--text-secondary)'
                      }}
                      title="Delete"
                    >
                      <Trash2 style={{ width: '18px', height: '18px', color: 'var(--text-secondary)', transition: 'color 0.2s ease' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedApplication && (
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
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '20px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {selectedApplication.profile_photo_url ? (
                  <img 
                    src={selectedApplication.profile_photo_url} 
                    alt={selectedApplication.full_name}
                    style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                    {selectedApplication.full_name}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: `${getStatusColor(selectedApplication.status)}20`,
                      color: getStatusColor(selectedApplication.status),
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {getStatusLabel(selectedApplication.status)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedApplication(null)
                }}
                style={{
                  padding: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444'
                  e.currentTarget.style.borderColor = '#ef4444'
                  e.currentTarget.querySelector('svg').style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)'
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                  e.currentTarget.querySelector('svg').style.color = 'var(--text-secondary)'
                }}
              >
                <X style={{ width: '20px', height: '20px', color: 'var(--text-secondary)', transition: 'color 0.2s ease' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Email</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail style={{ width: '14px', height: '14px' }} />
                    {selectedApplication.email}
                  </p>
                </div>
                {selectedApplication.phone_number && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Phone</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone style={{ width: '14px', height: '14px' }} />
                      {selectedApplication.phone_number}
                    </p>
                  </div>
                )}
                {selectedApplication.location && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Location</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin style={{ width: '14px', height: '14px' }} />
                      {selectedApplication.location}
                    </p>
                  </div>
                )}
              </div>

              {selectedApplication.short_bio && (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Short Bio</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                    {selectedApplication.short_bio}
                  </p>
                </div>
              )}

              {selectedApplication.areas_of_interest && (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Areas of Interest</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Array.isArray(selectedApplication.areas_of_interest) 
                      ? selectedApplication.areas_of_interest.map((interest, idx) => (
                          <span key={idx} style={{
                            fontSize: '12px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)'
                          }}>
                            {interest}
                          </span>
                        ))
                      : typeof selectedApplication.areas_of_interest === 'string'
                        ? JSON.parse(selectedApplication.areas_of_interest).map((interest, idx) => (
                            <span key={idx} style={{
                              fontSize: '12px',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)'
                            }}>
                              {interest}
                            </span>
                          ))
                        : null
                    }
                  </div>
                </div>
              )}

              {selectedApplication.writing_experience && (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Writing Experience</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                    {selectedApplication.writing_experience}
                  </p>
                </div>
              )}

              {selectedApplication.why_write_for_trendorabay && (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Why Write for Trendorabay</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                    {selectedApplication.why_write_for_trendorabay}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {selectedApplication.portfolio_url && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Portfolio</p>
                    <a
                      href={selectedApplication.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '14px', color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Briefcase style={{ width: '14px', height: '14px' }} />
                      View Portfolio
                    </a>
                  </div>
                )}
                {selectedApplication.writing_sample_url && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Writing Sample</p>
                    <a
                      href={selectedApplication.writing_sample_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '14px', color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileText style={{ width: '14px', height: '14px' }} />
                      View Sample
                    </a>
                  </div>
                )}
                {selectedApplication.cv_resume_url && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>CV/Resume</p>
                    <a
                      href={selectedApplication.cv_resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '14px', color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileText style={{ width: '14px', height: '14px' }} />
                      View CV
                    </a>
                  </div>
                )}
              </div>

              {selectedApplication.social_media_links && (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Social Media Links</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {Array.isArray(selectedApplication.social_media_links)
                      ? selectedApplication.social_media_links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '12px',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              background: 'var(--bg-secondary)',
                              color: '#7c3aed',
                              border: '1px solid var(--border-color)',
                              textDecoration: 'none'
                            }}
                          >
                            {link}
                          </a>
                        ))
                      : typeof selectedApplication.social_media_links === 'string'
                        ? JSON.parse(selectedApplication.social_media_links).map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '12px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'var(--bg-secondary)',
                                color: '#7c3aed',
                                border: '1px solid var(--border-color)',
                                textDecoration: 'none'
                              }}
                            >
                              {link}
                            </a>
                          ))
                        : null
                    }
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedApplication.id, 'reviewed')
                        setShowModal(false)
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7c3aed'
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.borderColor = '#7c3aed'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                        e.currentTarget.style.borderColor = 'var(--border-color)'
                      }}
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedApplication.id, 'approved')
                        setShowModal(false)
                      }}
                      style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedApplication.id, 'rejected')
                        setShowModal(false)
                      }}
                      style={{
                        padding: '10px 20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
