import { useState, useEffect, useContext } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, Upload } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

const API_BASE_URL = 'https://trendorabay-content-management-system.onrender.com'

export default function Magazines() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMagazine, setEditingMagazine] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [magazines, setMagazines] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    issue: '',
    category: '',
    description: '',
    pdf_url: '',
    price: '9.99',
    digital_price: '9.99',
    print_price: '13.99',
    subscription_price: '99.99',
    pages: '100',
    language: 'English',
    publisher: 'Trendorabay',
    rating: '4.50',
    review_count: '0',
    table_of_contents: '',
    contributors: ''
  })
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfFileName, setPdfFileName] = useState('')
  const [previewPagesFiles, setPreviewPagesFiles] = useState([])
  const [previewPagesFileNames, setPreviewPagesFileNames] = useState([])
  const [contributors, setContributors] = useState([])
  
  // Fetch magazines, categories, and contributors from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [magazinesData, categoriesData, contributorsData] = await Promise.all([
          api.get('/magazines'),
          api.get('/categories'),
          api.get('/contributors')
        ])
        console.log('Fetched magazines data:', magazinesData)
        console.log('Fetched categories data:', categoriesData)
        console.log('Fetched contributors data:', contributorsData)
        setMagazines(magazinesData)
        setCategories(categoriesData)
        setContributors(contributorsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPdfFile(file)
      setPdfFileName(file.name)
    }
  }

  const handlePreviewPagesFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const limitedFiles = files.slice(0, 3)
      setPreviewPagesFiles(limitedFiles)
      setPreviewPagesFileNames(limitedFiles.map(f => f.name))
    }
  }

  const handleCreateMagazine = async (status) => {
    console.log('Creating magazine with status:', status)
    console.log('Form data:', formData)
    console.log('Cover image file:', coverImageFile)
    
    if (!formData.title || !formData.issue || !formData.category) {
      alert('Please fill in all required fields (title, issue, category)')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('issue', formData.issue)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('pdf_url', formData.pdf_url)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('digital_price', formData.digital_price)
      formDataToSend.append('print_price', formData.print_price)
      formDataToSend.append('subscription_price', formData.subscription_price)
      formDataToSend.append('pages', formData.pages)
      formDataToSend.append('language', formData.language)
      formDataToSend.append('publisher', formData.publisher)
      formDataToSend.append('rating', formData.rating)
      formDataToSend.append('review_count', formData.review_count)
      formDataToSend.append('table_of_contents', formData.table_of_contents)
      formDataToSend.append('contributors', formData.contributors)
      formDataToSend.append('preview_pages', formData.preview_pages)
      if (coverImageFile) {
        formDataToSend.append('cover_image', coverImageFile)
      }
      if (pdfFile) {
        formDataToSend.append('pdf_file', pdfFile)
      }
      previewPagesFiles.forEach((file, index) => {
        formDataToSend.append(`preview_pages_file_${index}`, file)
      })

      console.log('Sending FormData to /magazines')
      const response = await api.post('/magazines', formDataToSend)
      console.log('Response:', response)
      
      setShowCreateModal(false)
      setFormData({ 
        title: '', 
        issue: '', 
        category: '', 
        pdf_url: '',
        price: '9.99',
        digital_price: '9.99',
        print_price: '13.99',
        subscription_price: '99.99',
        pages: '100',
        language: 'English',
        publisher: 'Trendorabay',
        rating: '4.50',
        review_count: '0',
        table_of_contents: '',
        contributors: ''
      })
      setCoverImageFile(null)
      setCoverImagePreview(null)
      setPdfFile(null)
      setPdfFileName('')
      setPreviewPagesFiles([])
      setPreviewPagesFileNames([])
      // Refresh magazines list
      const data = await api.get('/magazines')
      setMagazines(data)
      alert('Magazine created successfully!')
    } catch (error) {
      console.error('Failed to create magazine:', error)
      alert('Failed to create magazine: ' + error.message)
    }
  }

  const handleDeleteMagazine = async (magazineId) => {
    if (!confirm('Are you sure you want to delete this magazine?')) {
      return
    }
    
    try {
      await api.delete(`/magazines/${magazineId}`)
      // Refresh magazines list
      const data = await api.get('/magazines')
      setMagazines(data)
      alert('Magazine deleted successfully!')
    } catch (error) {
      console.error('Failed to delete magazine:', error)
      alert('Failed to delete magazine: ' + error.message)
    }
  }

  const handleEditMagazine = (magazine) => {
    setEditingMagazine(magazine)
    setFormData({
      title: magazine.title,
      issue: magazine.issue,
      category: magazine.category_name || magazine.category,
      description: magazine.description || '',
      pdf_url: magazine.pdf_url || '',
      price: magazine.price || '9.99',
      digital_price: magazine.digital_price || '9.99',
      print_price: magazine.print_price || '13.99',
      subscription_price: magazine.subscription_price || '99.99',
      pages: magazine.pages || '100',
      language: magazine.language || 'English',
      publisher: magazine.publisher || 'Trendorabay',
      rating: magazine.rating || '4.50',
      review_count: magazine.review_count || '0',
      table_of_contents: magazine.table_of_contents || '',
      contributors: magazine.contributor_id || magazine.contributors || '',
      preview_pages: magazine.preview_pages || ''
    })
    setCoverImagePreview(magazine.cover_image_url 
      ? (magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `${API_BASE_URL}${magazine.cover_image_url}`)
      : null)
    setShowEditModal(true)
  }

  const handleUpdateMagazine = async (status) => {
    if (!formData.title || !formData.issue || !formData.category) {
      alert('Please fill in all required fields (title, issue, category)')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('issue', formData.issue)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('pdf_url', formData.pdf_url)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('digital_price', formData.digital_price)
      formDataToSend.append('print_price', formData.print_price)
      formDataToSend.append('subscription_price', formData.subscription_price)
      formDataToSend.append('pages', formData.pages)
      formDataToSend.append('language', formData.language)
      formDataToSend.append('publisher', formData.publisher)
      formDataToSend.append('rating', formData.rating)
      formDataToSend.append('review_count', formData.review_count)
      formDataToSend.append('table_of_contents', formData.table_of_contents)
      formDataToSend.append('contributors', formData.contributors)
      formDataToSend.append('preview_pages', formData.preview_pages)
      if (coverImageFile) {
        formDataToSend.append('cover_image', coverImageFile)
      }
      if (pdfFile) {
        formDataToSend.append('pdf_file', pdfFile)
      }
      previewPagesFiles.forEach((file, index) => {
        formDataToSend.append(`preview_pages_file_${index}`, file)
      })
      
      const response = await api.put(`/magazines/${editingMagazine.id}`, formDataToSend)
      
      // Refresh magazines list
      const data = await api.get('/magazines')
      setMagazines(data)
      setShowEditModal(false)
      setEditingMagazine(null)
      setFormData({ 
        title: '', 
        issue: '', 
        category: '', 
        pdf_url: '',
        price: '9.99',
        digital_price: '9.99',
        print_price: '13.99',
        subscription_price: '99.99',
        pages: '100',
        language: 'English',
        publisher: 'Trendorabay',
        rating: '4.50',
        review_count: '0',
        table_of_contents: '',
        contributors: ''
      })
      setCoverImageFile(null)
      setCoverImagePreview(null)
      setPdfFile(null)
      setPdfFileName('')
      setPreviewPagesFiles([])
      setPreviewPagesFileNames([])
      alert('Magazine updated successfully!')
    } catch (error) {
      console.error('Failed to update magazine:', error)
      alert('Failed to update magazine: ' + error.message)
    }
  }

  const filteredMagazines = magazines.map(magazine => ({
    ...magazine,
    date: magazine.published_date ? new Date(magazine.published_date).toLocaleDateString() : 'N/A',
    category: magazine.category_name || 'Uncategorized',
    status: 'published' // Backend doesn't have status field yet
  })).filter(magazine =>
    magazine.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Magazines</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage magazine issues and publications</p>
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
          <Plus style={{ width: '20px', height: '20px' }} />
          Add Magazine
        </button>
      </div>

      {/* Search */}
      <div style={{ maxWidth: '448px' }}>
        <input
          type="text"
          placeholder="Search magazines..."
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

      {/* Magazines Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredMagazines.map((magazine) => (
          <div key={magazine.id} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ 
              aspectRatio: '3/4', 
              background: magazine.cover_image_url ? 'transparent' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {magazine.cover_image_url ? (
                <img 
                  src={magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `${API_BASE_URL}${magazine.cover_image_url}`} 
                  alt={magazine.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    console.error('Image load error:', e)
                    console.error('Image URL:', magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `${API_BASE_URL}${magazine.cover_image_url}`)
                    console.error('Magazine data:', magazine)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <Upload style={{ width: '36px', height: '36px', margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '12px' }}>Cover Image</p>
                </div>
              )}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px', flex: 1 }}>{magazine.title}</h3>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '16px', 
                  fontSize: '11px', 
                  fontWeight: '500',
                  flexShrink: 0,
                  marginLeft: '6px',
                  background: magazine.status === 'published' ? '#dcfce7' : '#fef9c3',
                  color: magazine.status === 'published' ? '#166534' : '#854d0e'
                }}>
                  {magazine.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{magazine.issue}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>{magazine.date}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  borderRadius: '16px', 
                  fontSize: '11px', 
                  fontWeight: '500'
                }}>
                  {magazine.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button style={{
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
                    <Eye style={{ width: '14px', height: '14px', color: '#64748b' }} />
                  </button>
                  <button 
                    onClick={() => handleEditMagazine(magazine)}
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
                    onClick={() => handleDeleteMagazine(magazine.id)}
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
              </div>
            </div>
          </div>
        ))}
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
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Add New Magazine</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
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
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter magazine title..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
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
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter magazine description..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Issue</label>
                    <input
                      type="text"
                      name="issue"
                      value={formData.issue}
                      onChange={handleInputChange}
                      placeholder="e.g., Vol. 1 No. 1"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}>
                      <option value="">Select category...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>PDF File</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfFileChange}
                    style={{ display: 'none' }}
                    id="pdf-file-input"
                  />
                  <div 
                    onClick={() => document.getElementById('pdf-file-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {pdfFileName ? (
                      <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{pdfFileName}</p>
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload PDF file</p>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="9.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Digital Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="digital_price"
                      value={formData.digital_price}
                      onChange={handleInputChange}
                      placeholder="9.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Print Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="print_price"
                      value={formData.print_price}
                      onChange={handleInputChange}
                      placeholder="13.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Subscription Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="subscription_price"
                      value={formData.subscription_price}
                      onChange={handleInputChange}
                      placeholder="99.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Pages</label>
                    <input
                      type="number"
                      name="pages"
                      value={formData.pages}
                      onChange={handleInputChange}
                      placeholder="100"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Language</label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="English"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Publisher</label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="Trendorabay"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Rating</label>
                    <input
                      type="number"
                      step="0.01"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      placeholder="4.50"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Table of Contents</label>
                  <textarea
                    name="table_of_contents"
                    value={formData.table_of_contents}
                    onChange={handleInputChange}
                    placeholder="1. Article Title - Page 10&#10;2. Feature Story - Page 25&#10;3. Interview - Page 40"
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      resize: 'vertical',
                      background: '#fafbfc',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = '#fafbfc'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                    Enter each item on a new line with page numbers
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Contributors</label>
                  <select
                    name="contributors"
                    value={formData.contributors}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
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
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}>
                    <option value="">Select contributor...</option>
                    {contributors.map(contributor => (
                      <option key={contributor.id} value={contributor.id}>
                        {contributor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    style={{ display: 'none' }}
                    id="cover-image-input"
                  />
                  <div 
                    onClick={() => document.getElementById('cover-image-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {coverImagePreview ? (
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload cover image</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Preview Pages (Max 3)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePreviewPagesFileChange}
                    style={{ display: 'none' }}
                    id="preview-pages-input"
                  />
                  <div 
                    onClick={() => document.getElementById('preview-pages-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {previewPagesFileNames.length > 0 ? (
                      <div>
                        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>
                          {previewPagesFileNames.length} file(s) selected
                        </p>
                        {previewPagesFileNames.map((name, index) => (
                          <p key={index} style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0' }}>
                            {index + 1}. {name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload preview pages images (max 3)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
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
                onClick={() => handleCreateMagazine('draft')}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                Save as Draft
              </button>
              <button
                onClick={() => handleCreateMagazine('published')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
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
                Publish
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
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Edit Magazine</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMagazine(null)
                  setFormData({ title: '', issue: '', category: '', pdf_url: '' })
                  setCoverImageFile(null)
                  setCoverImagePreview(null)
                  setPdfFile(null)
                  setPdfFileName('')
                  setPreviewPagesFiles([])
                  setPreviewPagesFileNames([])
                }}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
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
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter magazine title..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
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
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter magazine description..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Issue</label>
                    <input
                      type="text"
                      name="issue"
                      value={formData.issue}
                      onChange={handleInputChange}
                      placeholder="e.g., Vol. 1 No. 1"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                      }}>
                      <option value="">Select category...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>PDF File</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfFileChange}
                    style={{ display: 'none' }}
                    id="edit-pdf-file-input"
                  />
                  <div 
                    onClick={() => document.getElementById('edit-pdf-file-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {pdfFileName ? (
                      <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{pdfFileName}</p>
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload PDF file</p>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="9.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Digital Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="digital_price"
                      value={formData.digital_price}
                      onChange={handleInputChange}
                      placeholder="9.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Print Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="print_price"
                      value={formData.print_price}
                      onChange={handleInputChange}
                      placeholder="13.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Subscription Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="subscription_price"
                      value={formData.subscription_price}
                      onChange={handleInputChange}
                      placeholder="99.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Pages</label>
                    <input
                      type="number"
                      name="pages"
                      value={formData.pages}
                      onChange={handleInputChange}
                      placeholder="100"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Language</label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="English"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Publisher</label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="Trendorabay"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Rating</label>
                    <input
                      type="number"
                      step="0.01"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      placeholder="4.50"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Table of Contents</label>
                  <textarea
                    name="table_of_contents"
                    value={formData.table_of_contents}
                    onChange={handleInputChange}
                    placeholder="1. Article Title - Page 10&#10;2. Feature Story - Page 25&#10;3. Interview - Page 40"
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      resize: 'vertical',
                      background: '#fafbfc',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = '#fafbfc'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                    Enter each item on a new line with page numbers
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Preview Pages</label>
                  <textarea
                    name="preview_pages"
                    value={formData.preview_pages}
                    onChange={handleInputChange}
                    placeholder="Enter preview pages..."
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      outline: 'none',
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Contributors</label>
                  <select
                    name="contributors"
                    value={formData.contributors}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
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
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.boxShadow = 'none'
                    }}>
                    <option value="">Select contributor...</option>
                    {contributors.map(contributor => (
                      <option key={contributor.id} value={contributor.id}>
                        {contributor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    style={{ display: 'none' }}
                    id="edit-cover-image-input"
                  />
                  <div 
                    onClick={() => document.getElementById('edit-cover-image-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '32px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {coverImagePreview ? (
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload cover image</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Preview Pages (Max 3)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePreviewPagesFileChange}
                    style={{ display: 'none' }}
                    id="edit-preview-pages-input"
                  />
                  <div 
                    onClick={() => document.getElementById('edit-preview-pages-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = '#f5f3ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#f8fafc'
                    }}>
                    {previewPagesFileNames.length > 0 ? (
                      <div>
                        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>
                          {previewPagesFileNames.length} file(s) selected
                        </p>
                        {previewPagesFileNames.map((name, index) => (
                          <p key={index} style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0' }}>
                            {index + 1}. {name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload preview pages images (max 3)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMagazine(null)
                  setFormData({ title: '', issue: '', category: '', pdf_url: '' })
                  setCoverImageFile(null)
                  setCoverImagePreview(null)
                }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
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
                onClick={() => handleUpdateMagazine('draft')}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                Save as Draft
              </button>
              <button
                onClick={() => handleUpdateMagazine('published')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
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
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
