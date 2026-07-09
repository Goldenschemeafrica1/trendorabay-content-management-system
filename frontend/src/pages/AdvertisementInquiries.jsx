import { useState, useEffect, useContext } from 'react'
import { Plus, Search, Edit, Trash2, Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

export default function AdvertisementInquiries() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    message: '',
    budget_range: '',
    preferred_duration: '',
    status: 'pending'
  })
  
  useEffect(() => {
    fetchInquiries()
  }, [])

  // Hide header and sidebar when create modal is open
  useEffect(() => {
    setHideHeader(showCreateModal)
    setHideSidebar(showCreateModal)
  }, [showCreateModal, setHideHeader, setHideSidebar])

  const fetchInquiries = async () => {
    try {
      const data = await api.get('/advertisement-inquiries')
      setInquiries(data)
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateInquiry = async () => {
    if (!formData.contact_name || formData.contact_name.trim() === '') {
      alert('Please fill in the contact name field')
      return
    }
    
    try {
      await api.post('/advertisement-inquiries', formData)
      setShowCreateModal(false)
      setFormData({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        company_name: '',
        message: '',
        budget_range: '',
        preferred_duration: '',
        status: 'pending'
      })
      fetchInquiries()
      alert('Inquiry created successfully!')
    } catch (error) {
      console.error('Failed to create inquiry:', error)
      alert('Failed to create inquiry: ' + error.message)
    }
  }

  const handleDeleteInquiry = async (inquiryId) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) {
      return
    }
    
    try {
      await api.delete(`/advertisement-inquiries/${inquiryId}`)
      fetchInquiries()
      alert('Inquiry deleted successfully!')
    } catch (error) {
      console.error('Failed to delete inquiry:', error)
      alert('Failed to delete inquiry: ' + error.message)
    }
  }

  const handleUpdateStatus = async (inquiry, newStatus) => {
    try {
      await api.put(`/advertisement-inquiries/${inquiry.id}`, { ...inquiry, status: newStatus })
      fetchInquiries()
    } catch (error) {
      console.error('Failed to update inquiry:', error)
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = (inquiry.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (inquiry.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (inquiry.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalInquiries = inquiries.length
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length
  const approvedInquiries = inquiries.filter(i => i.status === 'approved').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Advertisement Inquiries</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage incoming advertisement inquiries and requests</p>
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
          Add Inquiry
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
              <Clock style={{ width: '16px', height: '16px', color: '#92400e' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{pendingInquiries}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Pending</p>
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
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
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
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Budget</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Duration</th>
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
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{inquiry.name || inquiry.contact_name || '-'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail style={{ width: '10px', height: '10px' }} />
                        {inquiry.email || inquiry.contact_email || '-'}
                      </span>
                      {(inquiry.phone || inquiry.contact_phone) && (
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone style={{ width: '10px', height: '10px' }} />
                          {inquiry.phone || inquiry.contact_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {inquiry.company || inquiry.company_name || '-'}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {inquiry.budget_range || inquiry.budgetRange || '-'}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {inquiry.preferred_duration || inquiry.preferredDuration || '-'}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {inquiry.inquiryDate || inquiry.inquiry_date || inquiry.created_at || '-'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '16px', 
                    fontSize: '11px', 
                    fontWeight: '500',
                    background: inquiry.status === 'approved' ? '#dcfce7' : inquiry.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                    color: inquiry.status === 'approved' ? '#166534' : inquiry.status === 'pending' ? '#92400e' : '#475569'
                  }}>
                    {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : 'Unknown'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    {inquiry.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(inquiry, 'approved')}
                          style={{
                            padding: '6px',
                            background: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#bbf7d0'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#dcfce7'
                          }}
                        >
                          <CheckCircle style={{ width: '14px', height: '14px', color: '#166534' }} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(inquiry, 'rejected')}
                          style={{
                            padding: '6px',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fecaca'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fee2e2'
                          }}
                        >
                          <XCircle style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                        </button>
                      </>
                    )}
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
                      }}
                    >
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
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Add New Inquiry</h2>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Contact Name</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    placeholder="Enter contact name..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    placeholder="Enter email..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Phone</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '13px'
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
                    placeholder="Enter company name..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter message..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      outline: 'none',
                      fontSize: '13px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Budget Range</label>
                    <input
                      type="text"
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleInputChange}
                      placeholder="e.g., $5000-$10000"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        outline: 'none',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Preferred Duration</label>
                    <input
                      type="text"
                      name="preferred_duration"
                      value={formData.preferred_duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 30 days"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        outline: 'none',
                        fontSize: '13px'
                      }}
                    />
                  </div>
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
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
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
                  color: '#64748b'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInquiry}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                }}
              >
                Add Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
