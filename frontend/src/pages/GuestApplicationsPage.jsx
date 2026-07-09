import { useState, useEffect } from 'react'
import { Save, Eye, User, Mail, Phone, Building, Briefcase, FileText, Clock, Check, X, MessageSquare, Filter, Search, Calendar, Trash2 } from 'lucide-react'
import api from '../services/api'

export default function GuestApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const data = await api.get('/guest-applications')
      setApplications(data)
    } catch (error) {
      console.error('Failed to fetch guest applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/guest-applications/${id}/status`, { status: newStatus })
      fetchApplications()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/guest-applications/${id}`)
        fetchApplications()
      } catch (error) {
        console.error('Failed to delete application:', error)
      }
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = 
      app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'under_review': return '#3b82f6'
      case 'approved': return '#10b981'
      case 'rejected': return '#ef4444'
      default: return '#64748b'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'under_review': return 'Under Review'
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Guest Applications</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage applications from potential podcast guests</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              color: '#64748b',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
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
            placeholder="Search applications..."
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
          {['all', 'pending', 'under_review', 'approved', 'rejected'].map(status => (
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

      {/* Applications List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p style={{ color: '#64748b' }}>Loading applications...</p>
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
          {filteredApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <User style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>No applications found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{application.applicant_name}</p>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: `${getStatusColor(application.status)}20`,
                        color: getStatusColor(application.status),
                        fontWeight: '500'
                      }}>
                        {getStatusLabel(application.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail style={{ width: '12px', height: '12px' }} />
                        {application.applicant_email}
                      </span>
                      {application.company_name && (
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building style={{ width: '12px', height: '12px' }} />
                          {application.company_name}
                        </span>
                      )}
                      {application.job_title && (
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase style={{ width: '12px', height: '12px' }} />
                          {application.job_title}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedApplication(application)
                        setShowModal(true)
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
                      <Eye style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    </button>
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'under_review')}
                          style={{
                            padding: '8px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Mark as Under Review"
                        >
                          <Filter style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'approved')}
                          style={{
                            padding: '8px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Approve"
                        >
                          <Check style={{ width: '16px', height: '16px', color: '#10b981' }} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          style={{
                            padding: '8px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Reject"
                        >
                          <X style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(application.id)}
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
      {showModal && selectedApplication && (
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
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Application Details</h2>
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
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>{selectedApplication.applicant_name}</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>{selectedApplication.job_title || 'No title provided'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Email</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail style={{ width: '14px', height: '14px' }} />
                      {selectedApplication.applicant_email}
                    </p>
                  </div>
                  {selectedApplication.applicant_phone && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone</label>
                      <p style={{ fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        {selectedApplication.applicant_phone}
                      </p>
                    </div>
                  )}
                  {selectedApplication.company_name && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Company</label>
                      <p style={{ fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building style={{ width: '14px', height: '14px' }} />
                        {selectedApplication.company_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Status</label>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: `${getStatusColor(selectedApplication.status)}20`,
                      color: getStatusColor(selectedApplication.status),
                      fontWeight: '500'
                    }}>
                      {getStatusLabel(selectedApplication.status)}
                    </span>
                  </div>
                </div>

                {selectedApplication.bio && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Bio</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6' }}>{selectedApplication.bio}</p>
                  </div>
                )}

                {selectedApplication.expertise_areas && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Expertise Areas</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6' }}>{selectedApplication.expertise_areas}</p>
                  </div>
                )}

                {selectedApplication.proposed_topics && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Proposed Topics</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6' }}>{selectedApplication.proposed_topics}</p>
                  </div>
                )}

                {selectedApplication.availability && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Availability</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6' }}>{selectedApplication.availability}</p>
                  </div>
                )}

                {selectedApplication.admin_notes && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>Admin Notes</label>
                    <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.6' }}>{selectedApplication.admin_notes}</p>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Applied on {new Date(selectedApplication.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{
              padding: '20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {selectedApplication.status === 'pending' && (
                <>
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
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check style={{ width: '16px', height: '16px' }} />
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
