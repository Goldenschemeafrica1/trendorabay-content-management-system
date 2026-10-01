import { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, ThemeContext } from '../contexts/LayoutContexts'

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5002'
    : 'https://trendorabay-content-management-system.onrender.com');

export default function EditMagazine() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { isDarkMode } = useContext(ThemeContext)
  const navigate = useNavigate()
  const { id } = useParams()
  const [isUpdating, setIsUpdating] = useState(false)
  const [categories, setCategories] = useState([])
  const [contributors, setContributors] = useState([])
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
  
  // Refs for file inputs
  const pdfFileInputRef = useRef(null)
  const coverImageInputRef = useRef(null)
  const previewPagesInputRef = useRef(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, contributorsData, magazineData] = await Promise.all([
          api.get('/categories'),
          api.get('/contributors'),
          api.get(`/magazines/${id}`)
        ])
        setCategories(categoriesData)
        setContributors(contributorsData)
        
        // Set form data from magazine
        const magazine = magazineData
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
          contributors: magazine.contributor_id || magazine.contributors || ''
        })
        setCoverImagePreview(magazine.cover_image_url 
          ? (magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `${BASE_URL}${magazine.cover_image_url}`)
          : null)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        alert('Failed to load magazine data')
        navigate('/dashboard/magazines')
      }
    }
    fetchData()
  }, [id, navigate])

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

  const handleUpdateMagazine = async (status) => {
    if (!formData.title || !formData.issue || !formData.category) {
      alert('Please fill in all required fields (title, issue, category)')
      return
    }
    
    setIsUpdating(true)
    
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
      
      await api.put(`/magazines/${id}`, formDataToSend)
      alert('Magazine updated successfully!')
      navigate('/dashboard/magazines')
    } catch (error) {
      console.error('Failed to update magazine:', error)
      alert('Failed to update magazine: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/dashboard/magazines')}
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Edit Magazine</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Update magazine details and content</p>
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '32px',
        maxWidth: '800px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter magazine title..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter magazine description..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
                resize: 'vertical'
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Issue *</label>
              <input
                type="text"
                name="issue"
                value={formData.issue}
                onChange={handleInputChange}
                placeholder="e.g., Vol. 1 No. 1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Category *</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
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
                }}>
                <option value="">Select category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfFileChange}
              style={{ display: 'none' }}
              ref={pdfFileInputRef}
            />
            <div 
              onClick={() => pdfFileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'var(--bg-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.background = 'var(--bg-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}>
              {pdfFileName ? (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>{pdfFileName}</p>
              ) : (
                <>
                  <Upload style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Click to upload PDF file</p>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Price</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Digital Price</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Print Price</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Subscription Price</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pages</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Language</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Publisher</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Rating</label>
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
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: 'var(--bg-secondary)'
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Table of Contents</label>
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
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                lineHeight: '1.6',
                outline: 'none',
                transition: 'all 0.2s ease',
                resize: 'vertical',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                e.currentTarget.style.background = 'var(--bg-primary)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Enter each item on a new line with page numbers
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Contributors</label>
            <select
              name="contributors"
              value={formData.contributors}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              style={{ display: 'none' }}
              ref={coverImageInputRef}
            />
            <div 
              onClick={() => coverImageInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'var(--bg-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.background = 'var(--bg-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}>
              {coverImagePreview ? (
                <img 
                  src={coverImagePreview} 
                  alt="Cover preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              ) : (
                <>
                  <Upload style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Click to upload cover image</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Preview Pages (Max 3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePreviewPagesFileChange}
              style={{ display: 'none' }}
              ref={previewPagesInputRef}
            />
            <div 
              onClick={() => previewPagesInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'var(--bg-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.background = 'var(--bg-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}>
              {previewPagesFileNames.length > 0 ? (
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>
                    {previewPagesFileNames.length} file(s) selected
                  </p>
                  {previewPagesFileNames.map((name, index) => (
                    <p key={index} style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0' }}>
                      {index + 1}. {name}
                    </p>
                  ))}
                </div>
              ) : (
                <>
                  <Upload style={{ width: '32px', height: '32px', color: 'var(--text-secondary)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Click to upload preview pages images (max 3)</p>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => navigate('/dashboard/magazines')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleUpdateMagazine('draft')}
              disabled={isUpdating}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
              Save as Draft
            </button>
            <button
              onClick={() => handleUpdateMagazine('published')}
              disabled={isUpdating}
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
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
