import { useState, useEffect, useContext } from 'react'
import { Search, Edit, Trash2, Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock, Globe } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

export default function PartnershipInquiries() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingInquiry, setEditingInquiry] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    website_url: '',
    message: '',
    partnership_type: '',
    status: 'pending',
    admin_notes: ''
  })
  
  useEffect(() => {
    fetchInquiries()
  }, [])

  // Hide header and sidebar when edit modal is open
  useEffect(() => {
    setHideHeader(showEditModal)
    setHideSidebar(showEditModal)
  }, [showEditModal, setHideHeader, setHideSidebar])

  const fetchInquiries = async () => {
    try {
      const data = await api.get('/partnership-inquiries')
      setInquiries(data)
    } catch (error) {
      console.error('Failed to fetch partnership inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditInquiry = (inquiry) => {
    setEditingInquiry(inquiry)
    setFormData({
      contact_name: inquiry.contact_name || inquiry.name || '',
      contact_email: inquiry.contact_email || inquiry.email || '',
      contact_phone: inquiry.contact_phone || inquiry.phone || '',
      company_name: inquiry.company_name || inquiry.company || '',
      website_url: inquiry.website_url || inquiry.website || '',
      message: inquiry.message || '',
      partnership_type: inquiry.partnership_type || '',
      status: inquiry.status || 'pending',
      admin_notes: inquiry.admin_notes || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateInquiry = async () => {
    try {
      await api.put(`/partnership-inquiries/${editingInquiry.id}`, formData)
      setShowEditModal(false)
      setEditingInquiry(null)
      setFormData({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        company_name: '',
        website_url: '',
        message: '',
        partnership_type: '',
        status: 'pending',
        admin_notes: ''
      })
      fetchInquiries()
      alert('Partnership inquiry updated successfully!')
    } catch (error) {
      console.error('Failed to update partnership inquiry:', error)
      alert('Failed to update partnership inquiry: ' + error.message)
    }
  }

  const handleDeleteInquiry = async (inquiryId) => {
    if (!confirm('Are you sure you want to delete this partnership inquiry?')) {
      return
    }

    try {
      await api.delete(`/partnership-inquiries/${inquiryId}`)
      fetchInquiries()
      alert('Partnership inquiry deleted successfully!')
    } catch (error) {
      console.error('Failed to delete partnership inquiry:', error)
      alert('Failed to delete partnership inquiry: ' + error.message)
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = (inquiry.contact_name || inquiry.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inquiry.company_name || inquiry.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inquiry.contact_email || inquiry.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalInquiries = inquiries.length
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length
  const approvedInquiries = inquiries.filter(i => i.status === 'approved').length

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle style={{ width: '14px', height: '14px', color: '#16a34a' }} />
      case 'rejected':
        return <XCircle style={{ width: '14px', height: '14px', color: '#dc2626' }} />
      case 'under_review':
        return <Clock style={{ width: '14px', height: '14px', color: '#ca8a04' }} />
      default:
        return <Clock style={{ width: '14px', height: '14px', color: '#64748b' }} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Partnership Inquiries</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage partnership requests and inquiries</p>
        </div>
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
              <Mail style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalInquiries}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Inquiries</p>
        </div>
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
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Clock style={{ width: '16px', height: '16px', color: '#ca8a04' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{pendingInquiries}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Pending Review</p>
        </div>
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
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{approvedInquiries}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Approved</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search inquiries..."
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
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Inquiries Table */}
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
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Contact</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Company</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Website</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.map((inquiry) => (
              <tr key={inquiry.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
                <td style={{ padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{inquiry.contact_name || inquiry.name}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{inquiry.contact_email || inquiry.email}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{inquiry.company_name || inquiry.company || '-'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {inquiry.website_url || inquiry.website ? (
                    <a href={inquiry.website_url || inquiry.website} target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Globe style={{ width: '14px', height: '14px' }} />
                      Visit
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{inquiry.partnership_type || '-'}</td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{inquiry.inquiryDate || new Date(inquiry.created_at).toISOString().split('T')[0]}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '16px', 
                    fontSize: '11px', 
                    fontWeight: '500',
                    background: inquiry.status === 'approved' ? '#dcfce7' : inquiry.status === 'rejected' ? '#fef2f2' : inquiry.status === 'under_review' ? '#fef3c7' : '#f1f5f9',
                    color: inquiry.status === 'approved' ? '#166534' : inquiry.status === 'rejected' ? '#991b1b' : inquiry.status === 'under_review' ? '#92400e' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    width: 'fit-content'
                  }}>
                    {getStatusIcon(inquiry.status)}
                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button 
                      onClick={() => handleEditInquiry(inquiry)}
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
                      onClick={() => handleDeleteInquiry(inquiry.id)}
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
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading inquiries...
          </div>
        )}
        {!loading && filteredInquiries.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No partnership inquiries found
          </div>
        )}
      </div>

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
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Edit Partnership Inquiry</h2>
              <button
                onClick={() => setShowEditModal(false)}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Contact Name</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Website URL</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Partnership Type</label>
                  <input
                    type="text"
                    name="partnership_type"
                    value={formData.partnership_type}
                    onChange={handleInputChange}
                    placeholder="e.g., Sponsorship, Collaboration, etc."
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
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
                    }}>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Admin Notes</label>
                  <textarea
                    name="admin_notes"
                    value={formData.admin_notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add internal notes..."
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
                onClick={() => setShowEditModal(false)}
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
                onClick={handleUpdateInquiry}
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
                Update Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
