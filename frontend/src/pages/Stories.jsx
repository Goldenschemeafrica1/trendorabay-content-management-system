import { useState, useEffect, useContext } from 'react'
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

export default function Stories() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingStory, setEditingStory] = useState(null)
  const [viewingStory, setViewingStory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [authors, setAuthors] = useState([])
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    author_id: '',
    category: '',
    content: '',
    featured: false,
    read_time: '5 min read'
  })
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  
  // Fetch stories from backend
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await api.get('/stories')
        setStories(data)
      } catch (error) {
        console.error('Failed to fetch stories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStories()
  }, [])

  // Fetch authors from backend
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

  // Fetch categories from backend
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

  // Hide header and sidebar when create/edit modals are open
  useEffect(() => {
    setHideHeader(showCreateModal || showEditModal)
    setHideSidebar(showCreateModal || showEditModal)
  }, [showCreateModal, showEditModal, setHideHeader, setHideSidebar])
  
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleCreateStory = async (status) => {
    console.log('Creating story with status:', status)
    console.log('Form data:', formData)
    console.log('Title value:', formData.title)
    console.log('Title trimmed:', formData.title?.trim())
    console.log('Author ID:', formData.author_id)
    console.log('Category:', formData.category)
    console.log('Content length:', formData.content?.length)
    console.log('Cover image file:', coverImageFile)
    
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
      formDataToSend.append('featured', formData.featured)
      formDataToSend.append('read_time', formData.read_time)
      if (coverImageFile) {
        formDataToSend.append('cover_image', coverImageFile)
      }
      
      console.log('Sending FormData to /stories')
      const response = await api.post('/stories', formDataToSend)
      console.log('Response:', response)
      
      // Refresh stories list
      const data = await api.get('/stories')
      setStories(data)
      setShowCreateModal(false)
      // Reset form
      setFormData({
        title: '',
        author_id: '',
        category: '',
        content: '',
        featured: false,
        read_time: '5 min read'
      })
      setCoverImageFile(null)
      setCoverImagePreview(null)
      alert('Story created successfully!')
    } catch (error) {
      console.error('Failed to create story:', error)
      alert('Failed to create story: ' + error.message)
    }
  }

  const handleDeleteStory = async (storyId) => {
    if (!confirm('Are you sure you want to delete this story?')) {
      return
    }
    
    try {
      await api.delete(`/stories/${storyId}`)
      // Refresh stories list
      const data = await api.get('/stories')
      setStories(data)
      alert('Story deleted successfully!')
    } catch (error) {
      console.error('Failed to delete story:', error)
      alert('Failed to delete story: ' + error.message)
    }
  }

  const handleViewStory = (story) => {
    setViewingStory(story)
    setShowViewModal(true)
  }

  const handleEditStory = (story) => {
    setEditingStory(story)
    setFormData({
      title: story.title,
      author_id: story.author_id,
      category: story.category,
      content: story.content,
      featured: story.featured === 1,
      read_time: story.read_time || '5 min read'
    })
    setCoverImagePreview(story.cover_image_url ? `http://localhost:5002${story.cover_image_url}` : null)
    setShowEditModal(true)
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
      formDataToSend.append('featured', formData.featured)
      formDataToSend.append('read_time', formData.read_time)
      if (coverImageFile) {
        formDataToSend.append('cover_image', coverImageFile)
      }
      
      const response = await api.put(`/stories/${editingStory.id}`, formDataToSend)
      
      // Refresh stories list
      const data = await api.get('/stories')
      setStories(data)
      setShowEditModal(false)
      setEditingStory(null)
      // Reset form
      setFormData({
        title: '',
        author_id: '',
        category: '',
        content: '',
        featured: false,
        read_time: '5 min read'
      })
      setCoverImageFile(null)
      setCoverImagePreview(null)
      alert('Story updated successfully!')
    } catch (error) {
      console.error('Failed to update story:', error)
      alert('Failed to update story: ' + error.message)
    }
  }

  const filteredStories = stories.map(story => ({
    ...story,
    date: story.published_at ? new Date(story.published_at).toLocaleDateString() : story.created_at ? new Date(story.created_at).toLocaleDateString() : 'N/A',
    author: story.author_name || 'Unknown',
    category: story.category_name || story.category || 'Uncategorized',
    views: story.views || 0
  })).filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (story.author && story.author.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || story.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>Stories</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Manage your articles and blog posts</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
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
          Create Story
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 16px',
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
          }}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Stories Table */}
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
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Author</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Views</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.map((story) => (
              <tr key={story.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '14px' }}>{story.title}</span>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{story.author}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: '#f1f5f9', 
                    color: '#475569', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '500'
                  }}>
                    {story.category}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    background: story.status === 'published' ? '#dcfce7' : '#fef9c3',
                    color: story.status === 'published' ? '#166534' : '#854d0e'
                  }}>
                    {story.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{story.date}</td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>{story.views.toLocaleString()}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => handleViewStory(story)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Eye style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    </button>
                    <button 
                      onClick={() => handleEditStory(story)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Edit style={{ width: '16px', height: '16px', color: '#64748b' }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteStory(story.id)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef2f2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}>
                      <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
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
            maxWidth: '900px',
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Create New Story</h2>
              <button onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <MoreVertical style={{ width: '20px', height: '20px', color: '#64748b' }} />
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
                    style={{
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Author</label>
                    <select name="author_id" value={formData.author_id} onChange={handleInputChange} style={{
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
                      <option value="">Select author...</option>
                      {authors.map(author => (
                        <option key={author.id} value={author.id}>{author.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} style={{
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Read Time</label>
                  <input
                    type="text"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    placeholder="e.g., 5 min read"
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
                    }}
                  >
                    {coverImagePreview ? (
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Plus style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload cover image</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Content</label>
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    background: 'white',
                    minHeight: '500px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ padding: '8px' }}>
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
              <button onClick={() => setShowCreateModal(false)}
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
                onClick={() => handleCreateStory('draft')}
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
                Save as Draft
              </button>
              <button 
                onClick={() => handleCreateStory('published')}
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
            maxWidth: '900px',
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Edit Story</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingStory(null)
                  setFormData({
                    title: '',
                    author_id: '',
                    category: '',
                    content: '',
                    featured: false,
                    read_time: '5 min read'
                  })
                  setCoverImageFile(null)
                  setCoverImagePreview(null)
                }}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <MoreVertical style={{ width: '20px', height: '20px', color: '#64748b' }} />
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
                    style={{
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Author</label>
                    <select name="author_id" value={formData.author_id} onChange={handleInputChange} style={{
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
                      <option value="">Select author...</option>
                      {authors.map(author => (
                        <option key={author.id} value={author.id}>{author.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} style={{
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Read Time</label>
                    <input
                      type="text"
                      name="read_time"
                      value={formData.read_time}
                      onChange={handleInputChange}
                      placeholder="e.g., 5 min read"
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '32px' }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#7c3aed'
                      }}
                    />
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', cursor: 'pointer' }}>Featured Story</label>
                  </div>
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
                    }}
                  >
                    {coverImagePreview ? (
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Plus style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload cover image</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Content</label>
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    background: 'white',
                    minHeight: '500px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ padding: '8px' }}>
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingStory(null)
                  setFormData({
                    title: '',
                    author_id: '',
                    category: '',
                    content: ''
                  })
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
                onClick={() => handleUpdateStory('draft')}
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
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingStory && (
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
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Story Preview</h2>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setViewingStory(null)
                }}
                style={{
                  padding: '6px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#64748b',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.color = '#0f172a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(80vh - 120px)' }}>
              {viewingStory.featured_image_url && (
                <div style={{ 
                  position: 'relative',
                  marginBottom: '20px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                  <img 
                    src={`http://localhost:5002${viewingStory.featured_image_url}`} 
                    alt="Featured" 
                    style={{ 
                      width: '100%', 
                      height: '220px', 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)'
                  }}>
                  </div>
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
                  color: 'white', 
                  borderRadius: '12px', 
                  fontSize: '11px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {viewingStory.category || viewingStory.category_name || 'Uncategorized'}
                </span>
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', lineHeight: '1.3' }}>{viewingStory.title}</h1>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '12px', color: '#64748b', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#475569' }}>Author:</span>
                  <span>{viewingStory.author_name || 'Unknown'}</span>
                </div>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#475569' }}>Category:</span>
                  <span>{viewingStory.category || viewingStory.category_name || 'Uncategorized'}</span>
                </div>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#475569' }}>Status:</span>
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: '500',
                    background: viewingStory.status === 'published' ? '#dcfce7' : '#fef9c3',
                    color: viewingStory.status === 'published' ? '#166534' : '#854d0e'
                  }}>
                    {viewingStory.status}
                  </span>
                </div>
              </div>
              <div style={{ 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: '16px'
              }}>
                <div 
                  style={{ 
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    color: '#334155'
                  }}
                  dangerouslySetInnerHTML={{ __html: viewingStory.content }}
                />
              </div>
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setViewingStory(null)
                }}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.3)'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
