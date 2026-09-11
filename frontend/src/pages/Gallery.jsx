import { useState, useEffect, useContext } from 'react'
import { Plus, Search, Filter, Grid, List, Image as ImageIcon, Trash2, Edit, Loader2 } from 'lucide-react'
import api, { BASE_URL } from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

export default function Gallery() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [galleryItems, setGalleryItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)

  // Hide header when add modal is open (keep sidebar visible)
  useEffect(() => {
    setHideHeader(showAddModal)
    setHideSidebar(false)
  }, [showAddModal, setHideHeader, setHideSidebar])

  // Fetch gallery items from database
  useEffect(() => {
    fetchGalleryItems()
  }, [])

  // Filter items based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(galleryItems)
    } else {
      const filtered = galleryItems.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, galleryItems])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/gallery', true) // Force refresh to bypass cache
      console.log('Gallery API response:', response)
      setGalleryItems(response.data || [])
      setFilteredItems(response.data || [])
    } catch (err) {
      console.error('Error fetching gallery items:', err)
      setError('Failed to load gallery items')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    try {
      setUploadingFile(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'gallery')

      const response = await fetch(`${BASE_URL}/api/media`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.media.file_url
    } catch (err) {
      console.error('Error uploading file:', err)
      throw err
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }
    
    try {
      await api.delete(`/gallery/${id}`)
      fetchGalleryItems()
    } catch (err) {
      console.error('Error deleting image:', err)
      alert('Failed to delete image')
    }
  }

  return (
    <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Gallery
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)' 
          }}>
            Manage your gallery images and media
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
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
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Image
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
          maxWidth: '400px'
        }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            color: 'var(--text-secondary)'
          }} />
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)'
            e.currentTarget.style.borderColor = 'var(--border-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-primary)'
            e.currentTarget.style.borderColor = 'var(--border-color)'
          }}
        >
          <Filter style={{ width: '16px', height: '16px' }} />
          Filter
        </button>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginLeft: 'auto'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '10px',
              background: viewMode === 'grid' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.background = 'var(--bg-primary)'
              }
            }}
          >
            <Grid style={{ 
              width: '18px', 
              height: '18px', 
              color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)' 
            }} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '10px',
              background: viewMode === 'list' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'list') {
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'list') {
                e.currentTarget.style.background = 'var(--bg-primary)'
              }
            }}
          >
            <List style={{ 
              width: '18px', 
              height: '18px', 
              color: viewMode === 'list' ? 'white' : 'var(--text-secondary)' 
            }} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          background: 'var(--bg-primary)',
          borderRadius: '16px'
        }}>
          <Loader2 style={{ 
            width: '48px', 
            height: '48px', 
            color: 'var(--text-primary)',
            animation: 'spin 1s linear infinite',
            marginBottom: '24px'
          }} />
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            Loading gallery...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          background: 'var(--bg-primary)',
          borderRadius: '16px',
          border: '2px solid var(--border-color)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-color) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <ImageIcon style={{ width: '40px', height: '40px', color: 'var(--text-secondary)' }} />
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Error loading gallery
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {error}
          </p>
          <button
            onClick={fetchGalleryItems}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
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
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          background: 'var(--bg-primary)',
          borderRadius: '16px',
          border: '2px dashed var(--border-color)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-color) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <ImageIcon style={{ width: '40px', height: '40px', color: 'var(--text-secondary)' }} />
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            {searchQuery ? 'No images found' : 'No images yet'}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Start building your gallery by adding your first image'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
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
              <Plus style={{ width: '18px', height: '18px' }} />
              Add Your First Image
            </button>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
          gap: '24px'
        }}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id ?? `gallery-${index}`}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                position: 'relative',
                aspectRatio: '16/9',
                background: 'var(--bg-secondary)',
                overflow: 'hidden'
              }}>
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png'
                  }}
                />
                {item.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '500',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                  }}>
                    Featured
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  display: 'flex',
                  gap: '8px',
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0'
                  }}>
                  <button
                    style={{
                      padding: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-primary)'
                    }}
                  >
                    <Edit style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-primary)'
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                {item.caption && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.caption}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {item.category && (
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '12px',
                      border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
                      padding: '2px 8px',
                      fontWeight: '500'
                    }}>
                      {item.category}
                    </span>
                  )}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>❤️</span>
                    <span>{item.likes_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      {showAddModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '24px'
            }}>
              Add New Image
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const fileInput = e.target.querySelector('input[type="file"]')
              
              try {
                if (!fileInput.files[0]) {
                  alert('Please select an image file')
                  return
                }
                
                const imageUrl = await handleFileUpload(fileInput.files[0])
                
                await api.post('/gallery', {
                  image_url: imageUrl,
                  caption: formData.get('caption')
                })
                setShowAddModal(false)
                setImagePreview('')
                fetchGalleryItems()
              } catch (err) {
                console.error('Error adding image:', err)
                alert('Failed to add image')
              }
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  Choose Image *
                </label>
                <input
                  name="file"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      const reader = new FileReader()
                      reader.onload = (e) => setImagePreview(e.target.result)
                      reader.readAsDataURL(e.target.files[0])
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {imagePreview && (
                  <div style={{
                    marginTop: '12px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                  }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  Caption
                </label>
                <textarea
                  name="caption"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
