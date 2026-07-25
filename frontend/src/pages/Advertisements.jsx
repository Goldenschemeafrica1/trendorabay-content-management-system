import { useState, useEffect, useContext } from 'react'
import { Plus, Search, Edit, Trash2, Image, Calendar, DollarSign, TrendingUp, Eye, EyeOff, Upload } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

const API_BASE_URL = 'https://trendorabay-content-management-system.onrender.com'

export default function Advertisements() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [advertisements, setAdvertisements] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    advertiser_name: '',
    campaign_name: '',
    image_url: '',
    mobile_image_url: '',
    destination_url: '',
    location: 'top-banner',
    priority: 1,
    rotation: true,
    active: true,
    start_date: '',
    end_date: '',
    budget: ''
  })
  
  useEffect(() => {
    fetchAdvertisements()
  }, [])

  // Hide header when create/edit modals are open (keep sidebar visible)
  useEffect(() => {
    setHideHeader(showCreateModal || !!editingAd)
    setHideSidebar(false)
  }, [showCreateModal, editingAd, setHideHeader, setHideSidebar])

  const fetchAdvertisements = async () => {
    try {
      const data = await api.get('/advertisements')
      setAdvertisements(data)
    } catch (error) {
      console.error('Failed to fetch advertisements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await api.post('/advertisements/upload', formData)
      if (response.file_url) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: response.file_url
        }))
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image: ' + error.message)
    }
  }

  const handleCreateAdvertisement = async () => {
    if (!formData.title || formData.title.trim() === '') {
      alert('Please fill in the title field')
      return
    }
    
    try {
      if (editingAd) {
        const formatDate = (date) => {
          if (!date) return null
          if (date.includes('T')) {
            return new Date(date).toISOString().split('T')[0]
          }
          return date
        }
        const updateData = {
          title: formData.title,
          advertiser_name: formData.advertiser_name,
          campaign_name: formData.campaign_name,
          image_url: formData.image_url,
          mobile_image_url: formData.mobile_image_url,
          destination_url: formData.destination_url,
          location: formData.location,
          priority: formData.priority,
          rotation: formData.rotation,
          active: formData.active,
          start_date: formatDate(formData.start_date),
          end_date: formatDate(formData.end_date),
          budget: formData.budget || null,
          impressions: formData.impressions || 0,
          clicks: formData.clicks || 0
        }
        await api.put(`/advertisements/${editingAd.id}`, updateData)
        alert('Advertisement updated successfully!')
      } else {
        const formatDate = (date) => {
          if (!date) return null
          if (date.includes('T')) {
            return new Date(date).toISOString().split('T')[0]
          }
          return date
        }
        const createData = {
          ...formData,
          start_date: formatDate(formData.start_date),
          end_date: formatDate(formData.end_date),
          budget: formData.budget || null
        }
        await api.post('/advertisements', createData)
        alert('Advertisement created successfully!')
      }
      setShowCreateModal(false)
      setEditingAd(null)
      setFormData({
        title: '',
        advertiser_name: '',
        campaign_name: '',
        image_url: '',
        mobile_image_url: '',
        destination_url: '',
        location: 'top-banner',
        priority: 1,
        rotation: true,
        active: true,
        start_date: '',
        end_date: '',
        budget: ''
      })
      fetchAdvertisements()
    } catch (error) {
      console.error('Failed to save advertisement:', error)
      alert('Failed to save advertisement: ' + error.message)
    }
  }

  const handleEditAdvertisement = (ad) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title || '',
      advertiser_name: ad.advertiser_name || '',
      campaign_name: ad.campaign_name || '',
      image_url: ad.image_url || '',
      mobile_image_url: ad.mobile_image_url || '',
      destination_url: ad.destination_url || '',
      location: ad.location || 'top-banner',
      priority: ad.priority || 1,
      rotation: ad.rotation !== undefined ? ad.rotation : true,
      active: ad.active !== undefined ? ad.active : true,
      start_date: ad.start_date || ad.startDate ? new Date(ad.start_date || ad.startDate).toISOString().split('T')[0] : '',
      end_date: ad.end_date || ad.endDate ? new Date(ad.end_date || ad.endDate).toISOString().split('T')[0] : '',
      budget: ad.budget || '',
      impressions: ad.impressions || 0,
      clicks: ad.clicks || 0
    })
    setShowCreateModal(true)
  }

  const handleDeleteAdvertisement = async (adId) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) {
      return
    }
    
    try {
      await api.delete(`/advertisements/${adId}`)
      fetchAdvertisements()
      alert('Advertisement deleted successfully!')
    } catch (error) {
      console.error('Failed to delete advertisement:', error)
      alert('Failed to delete advertisement: ' + error.message)
    }
  }

  const handleToggleActive = async (ad) => {
    try {
      const formatDate = (date) => {
        if (!date) return null
        if (date.includes('T')) {
          return new Date(date).toISOString().split('T')[0]
        }
        return date
      }
      await api.put(`/advertisements/${ad.id}`, {
        title: ad.title,
        advertiser_name: ad.advertiser_name,
        campaign_name: ad.campaign_name,
        image_url: ad.image_url,
        mobile_image_url: ad.mobile_image_url,
        destination_url: ad.destination_url,
        location: ad.location,
        priority: ad.priority,
        rotation: ad.rotation,
        active: !ad.active,
        start_date: formatDate(ad.start_date),
        end_date: formatDate(ad.end_date),
        budget: ad.budget,
        impressions: ad.impressions,
        clicks: ad.clicks
      })
      fetchAdvertisements()
    } catch (error) {
      console.error('Failed to update advertisement:', error)
    }
  }

  const filteredAdvertisements = advertisements.filter(ad => {
    const matchesSearch = (ad.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (ad.advertiser?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (ad.campaign?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? ad.active : !ad.active)
    return matchesSearch && matchesStatus
  })

  const totalAds = advertisements.length
  const activeAds = advertisements.filter(a => a.active).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Advertisements</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage advertisement campaigns and placements</p>
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
          Add Advertisement
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
              <Image style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalAds}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Advertisements</p>
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
              <TrendingUp style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{activeAds}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Active Ads</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search advertisements..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Advertisements Table */}
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
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Advertisement</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Advertiser</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Campaign</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Duration</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Priority</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdvertisements.map((ad) => (
              <tr key={ad.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Image style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{ad.title}</p>
                      {ad.destination_url && (
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                          {ad.destination_url}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {ad.advertiser || '-'}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {ad.campaign || '-'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                    {ad.location?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                  {ad.startDate || ad.start_date}{ad.endDate || ad.end_date ? ` - ${ad.endDate || ad.end_date}` : ''}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                    background: (ad.priority >= 7) ? '#dbeafe' : (ad.priority >= 4) ? '#fef3c7' : '#f1f5f9',
                    color: (ad.priority >= 7) ? '#1e40af' : (ad.priority >= 4) ? '#92400e' : '#475569'
                  }}>
                    {ad.priority || ad.priority_level || '-'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => handleToggleActive(ad)}
                    style={{
                      padding: '4px 8px',
                      background: ad.active ? '#dcfce7' : '#f1f5f9',
                      border: ad.active ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: ad.active ? '#166534' : '#64748b',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = ad.active ? '#bbf7d0' : '#e2e8f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = ad.active ? '#dcfce7' : '#f1f5f9'
                    }}
                  >
                    {ad.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button 
                      onClick={() => handleEditAdvertisement(ad)}
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
                      onClick={() => handleDeleteAdvertisement(ad.id)}
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
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingAd(null)
                  setFormData({
                    title: '',
                    advertiser_name: '',
                    campaign_name: '',
                    image_url: '',
                    mobile_image_url: '',
                    destination_url: '',
                    location: 'top-banner',
                    priority: 1,
                    rotation: true,
                    active: true,
                    start_date: '',
                    end_date: '',
                    budget: ''
                  })
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter advertisement title..."
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Advertiser</label>
                  <input
                    type="text"
                    name="advertiser_name"
                    value={formData.advertiser_name}
                    onChange={handleInputChange}
                    placeholder="Enter advertiser name..."
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Campaign</label>
                  <input
                    type="text"
                    name="campaign_name"
                    value={formData.campaign_name}
                    onChange={handleInputChange}
                    placeholder="Enter campaign name..."
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Location</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        outline: 'none',
                        fontSize: '13px'
                      }}
                    >
                      <option value="top-banner">Top Banner</option>
                      <option value="between-sections">Between Sections</option>
                      <option value="sidebar-vertical">Sidebar Vertical</option>
                      <option value="footer-banner">Footer Banner</option>
                      <option value="sponsored-story">Sponsored Story</option>
                      <option value="mobile-banner">Mobile Banner</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Priority</label>
                    <input
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Destination URL</label>
                  <input
                    type="url"
                    name="destination_url"
                    value={formData.destination_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Desktop Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image_url')}
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
                  {formData.image_url && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Current Image:</p>
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: '#f8fafc',
                        border: '2px dashed #e2e8f0',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={formData.image_url.startsWith('http') ? formData.image_url : `${API_BASE_URL}${formData.image_url}`}
                          alt="Desktop Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Mobile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'mobile_image_url')}
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
                  {formData.mobile_image_url && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Current Image:</p>
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: '#f8fafc',
                        border: '2px dashed #e2e8f0',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={formData.mobile_image_url.startsWith('http') ? formData.mobile_image_url : `${API_BASE_URL}${formData.mobile_image_url}`}
                          alt="Mobile Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Budget</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="0.00"
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
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="rotation"
                      checked={formData.rotation}
                      onChange={handleInputChange}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#475569' }}>Enable Rotation</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#475569' }}>Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingAd(null)
                  setFormData({
                    title: '',
                    advertiser_name: '',
                    campaign_name: '',
                    image_url: '',
                    mobile_image_url: '',
                    destination_url: '',
                    location: 'top-banner',
                    priority: 1,
                    rotation: true,
                    active: true,
                    start_date: '',
                    end_date: '',
                    budget: ''
                  })
                }}
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
                onClick={handleCreateAdvertisement}
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
                {editingAd ? 'Update Advertisement' : 'Add Advertisement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
