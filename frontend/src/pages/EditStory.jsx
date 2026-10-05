import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext, ThemeContext } from '../contexts/LayoutContexts'

const API_BASE_URL = 'https://trendorabay-content-management-system.onrender.com'

export default function EditStory() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const { isDarkMode } = useContext(ThemeContext)
  
  const [formData, setFormData] = useState({
    title: '',
    author_id: '',
    category: '',
    content: '',
    read_time: '5 min read',
    display_section: 'default',
    display_order: 0,
    priority: 0,
    display_start_date: '',
    display_end_date: ''
  })
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [coverImageFile2, setCoverImageFile2] = useState(null)
  const [coverImagePreview2, setCoverImagePreview2] = useState(null)
  const [coverImageFile3, setCoverImageFile3] = useState(null)
  const [coverImagePreview3, setCoverImagePreview3] = useState(null)
  const [coverImageFile4, setCoverImageFile4] = useState(null)
  const [coverImagePreview4, setCoverImagePreview4] = useState(null)
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setHideHeader(false)
    setHideSidebar(false)
  }, [setHideHeader, setHideSidebar])

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const data = await api.get(`/stories/${id}`)
        setFormData({
          title: data.title,
          author_id: data.author_id,
          category: data.category,
          content: data.content,
          read_time: data.read_time || '5 min read',
          display_section: data.display_section || 'default',
          display_order: data.display_order || 0,
          priority: data.priority || 0,
          display_start_date: data.display_start_date || '',
          display_end_date: data.display_end_date || ''
        })
        setCoverImagePreview(data.featured_image_url ? (data.featured_image_url.startsWith('http') ? data.featured_image_url : `${API_BASE_URL}${data.featured_image_url}`) : null)
        setCoverImagePreview2(data.featured_image_url_2 ? (data.featured_image_url_2.startsWith('http') ? data.featured_image_url_2 : `${API_BASE_URL}${data.featured_image_url_2}`) : null)
        setCoverImagePreview3(data.featured_image_url_3 ? (data.featured_image_url_3.startsWith('http') ? data.featured_image_url_3 : `${API_BASE_URL}${data.featured_image_url_3}`) : null)
        setCoverImagePreview4(data.featured_image_url_4 ? (data.featured_image_url_4.startsWith('http') ? data.featured_image_url_4 : `${API_BASE_URL}${data.featured_image_url_4}`) : null)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch story:', error)
        alert('Failed to load story')
        navigate('/dashboard/stories')
      }
    }
    fetchStory()
  }, [id, navigate])

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const data = await api.get('/authors')
        setAuthors(data)
      } catch (error) {
        console.error('Failed to fetch authors:', error)
      }
    }
    fetchAuthors()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/categories')
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing your story...</p>',
    editorProps: {
      attributes: {
        style: 'min-height: 450px; padding: 16px; outline: none;'
      }
    },
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }))
    },
  })

  useEffect(() => {
    if (editor && formData.content) {
      editor.commands.setContent(formData.content)
    }
  }, [editor, formData.content])
  
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

  const handleCoverImageChange2 = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImageFile2(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview2(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageChange3 = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImageFile3(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview3(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageChange4 = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImageFile4(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview4(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleUpdateStory = async (status) => {
    if (!formData.title || formData.title.trim() === '') {
      alert('Please fill in the title field')
      return
    }
    if (!formData.author_id || formData.author_id === '') {
      alert('Please select an author')
      return
    }
    if (!formData.category || formData.category === '') {
      alert('Please select a category')
      return
    }
    if (!formData.content || formData.content.trim() === '' || formData.content === '<p>Start writing your story...</p>') {
      alert('Please add content to your story')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('author_id', formData.author_id)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('status', status)
      formDataToSend.append('read_time', formData.read_time)
      formDataToSend.append('display_section', formData.display_section)
      formDataToSend.append('display_order', formData.display_order)
      formDataToSend.append('priority', formData.priority)
      if (formData.display_start_date) {
        formDataToSend.append('display_start_date', formData.display_start_date)
      }
      if (formData.display_end_date) {
        formDataToSend.append('display_end_date', formData.display_end_date)
      }
      if (coverImageFile) {
        formDataToSend.append('cover_image', coverImageFile)
      }
      if (coverImageFile2) {
        formDataToSend.append('cover_image_2', coverImageFile2)
      }
      if (coverImageFile3) {
        formDataToSend.append('cover_image_3', coverImageFile3)
      }
      if (coverImageFile4) {
        formDataToSend.append('cover_image_4', coverImageFile4)
      }
      
      await api.put(`/stories/${id}`, formDataToSend)
      alert('Story updated successfully!')
      navigate('/dashboard/stories')
    } catch (error) {
      console.error('Failed to update story:', error)
      alert('Failed to update story: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>Edit Story</h1>
          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Update your story content</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/stories')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#334155' : '#f8fafc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Cancel
        </button>
      </div>

      <div style={{
        background: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter story title..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Author</label>
              <select name="author_id" value={formData.author_id} onChange={handleInputChange} style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                <option value="">Select author...</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} style={{
                width: '100%',
                padding: '12px 16px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                <option value="">Select category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Read Time</label>
              <input
                type="text"
                name="read_time"
                value={formData.read_time}
                onChange={handleInputChange}
                placeholder="e.g., 5 min read"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Display Section</label>
            <select name="display_section" value={formData.display_section} onChange={handleInputChange} style={{
              width: '100%',
              padding: '12px 16px',
              background: isDarkMode ? '#0f172a' : '#f8fafc',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: '12px',
              outline: 'none',
              fontSize: '14px',
              color: isDarkMode ? '#f1f5f9' : '#0f172a',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <option value="default">Default</option>
              <option value="latest_stories">Latest Stories</option>
              <option value="must_read">Must Read</option>
              <option value="innovation">Innovation</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Display Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Priority</label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Display Start Date (Optional)</label>
              <input
                type="date"
                name="display_start_date"
                value={formData.display_start_date}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Display End Date (Optional)</label>
              <input
                type="date"
                name="display_end_date"
                value={formData.display_end_date}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '13px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer'
              }}
            />
            {coverImagePreview && (
              <div style={{ marginTop: '8px', position: 'relative' }}>
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Featured Image 2</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange2}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '13px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer'
              }}
            />
            {coverImagePreview2 && (
              <div style={{ marginTop: '8px', position: 'relative' }}>
                <img
                  src={coverImagePreview2}
                  alt="Featured image 2 preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Featured Image 3</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange3}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '13px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer'
              }}
            />
            {coverImagePreview3 && (
              <div style={{ marginTop: '8px', position: 'relative' }}>
                <img
                  src={coverImagePreview3}
                  alt="Featured image 3 preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Featured Image 4</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange4}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '13px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                cursor: 'pointer'
              }}
            />
            {coverImagePreview4 && (
              <div style={{ marginTop: '8px', position: 'relative' }}>
                <img
                  src={coverImagePreview4}
                  alt="Featured image 4 preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#94a3b8' : '#374151', marginBottom: '8px' }}>Content</label>
            <div style={{
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden', 
              background: isDarkMode ? '#0f172a' : 'white',
              minHeight: '400px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ padding: '8px' }}>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button 
          onClick={() => handleUpdateStory('draft')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#334155' : '#f8fafc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Save as Draft
        </button>
        <button 
          onClick={() => handleUpdateStory('published')}
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
          }}
        >
          Update
        </button>
      </div>
    </div>
  )
}
