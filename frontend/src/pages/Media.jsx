import { useState, useEffect } from 'react'
import { Search, Upload, Folder, Image as ImageIcon, File, Trash2, Download, MoreVertical } from 'lucide-react'
import api from '../services/api'

export default function Media() {
  const [selectedFolder, setSelectedFolder] = useState('All Files')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadFolder, setUploadFolder] = useState('Blog Posts')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadPreviews, setUploadPreviews] = useState([])
  const [imagesLoaded, setImagesLoaded] = useState({})
  const [folders, setFolders] = useState(['All Files'])
  
  const preloadImages = (items) => {
    items.forEach(item => {
      if (item.file_type?.startsWith('image/')) {
        const img = new Image()
        img.src = item.file_url.startsWith('http') ? item.file_url : `http://localhost:5002${item.file_url}`
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [item.id]: true }))
        }
      }
    })
  }
  
  // Fetch media from backend
  const fetchMedia = async () => {
    try {
      // Force fresh fetch by clearing cache first
      api.clearRelatedCache('/media')
      const data = await api.get('/media')
      setMediaItems(data)
      preloadImages(data)
      
      // Dynamically extract unique folders from media data
      const uniqueFolders = ['All Files', ...new Set(data.map(item => item.folder).filter(Boolean))]
      setFolders(uniqueFolders)
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadedFiles(files)
    
    // Generate previews for images
    const previews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file)
      }
      return null
    })
    setUploadPreviews(previews)
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select files to upload')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      uploadedFiles.forEach(file => {
        formDataToSend.append('files', file)
      })
      formDataToSend.append('folder', uploadFolder)
      
      console.log('Uploading files to /media')
      const response = await api.post('/media', formDataToSend)
      console.log('Response:', response)
      
      setShowUploadModal(false)
      setUploadedFiles([])
      setUploadPreviews([])
      // Refresh media list with fresh data
      await fetchMedia()
      alert('Files uploaded successfully!')
    } catch (error) {
      console.error('Failed to upload files:', error)
      alert('Failed to upload files: ' + error.message)
    }
  }

  const handleDeleteMedia = async (mediaId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }
    
    try {
      await api.delete(`/media/${mediaId}`)
      // Refresh media list with fresh data
      await fetchMedia()
      alert('File deleted successfully!')
    } catch (error) {
      console.error('Failed to delete file:', error)
      alert('Failed to delete file: ' + error.message)
    }
  }

  const handleDownloadMedia = (mediaItem) => {
    const link = document.createElement('a')
    link.href = mediaItem.file_url.startsWith('http') ? mediaItem.file_url : `http://localhost:5002${mediaItem.file_url}`
    link.download = mediaItem.original_name
    link.click()
  }

  const filteredMedia = mediaItems.map(item => ({
    ...item,
    name: item.original_name,
    type: item.file_type?.startsWith('image/') ? 'image' : 'file',
    size: formatFileSize(item.file_size),
    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'
  })).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder === 'All Files' || item.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>Media Library</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Manage images, files, and media assets</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
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
          <Upload style={{ width: '20px', height: '20px' }} />
          Upload Files
        </button>
      </div>

      {/* Folders & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {folders.map((folder, index) => (
            <button
              key={folder || `folder-${index}`}
              onClick={() => setSelectedFolder(folder)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                border: selectedFolder === folder ? 'none' : '1px solid #e2e8f0',
                background: selectedFolder === folder ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'white',
                color: selectedFolder === folder ? 'white' : '#475569',
                cursor: 'pointer',
                boxShadow: selectedFolder === folder ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedFolder !== folder) {
                  e.currentTarget.style.background = '#f8fafc'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFolder !== folder) {
                  e.currentTarget.style.background = 'white'
                }
              }}
            >
              <Folder style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              {folder}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, maxWidth: '448px' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '20px', 
            height: '20px', 
            color: '#94a3b8' 
          }} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '16px',
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
      </div>

      {/* Media Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '16px' 
      }}>
        {filteredMedia.map((item, index) => (
          <div key={item.id || `media-${index}`} style={{
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
              aspectRatio: '1/1', 
              background: item.type === 'image' && item.file_url && imagesLoaded[item.id]
                ? `url(${item.file_url.startsWith('http') ? item.file_url : `http://localhost:5002${item.file_url}`}) center/cover no-repeat` 
                : item.type === 'image' && item.file_url
                ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              {item.type !== 'image' && (
                <File style={{ width: '48px', height: '48px', color: '#94a3b8' }} />
              )}
              {item.type === 'image' && !imagesLoaded[item.id] && (
                <div style={{ 
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.5)'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    border: '3px solid #e2e8f0',
                    borderTop: '3px solid #7c3aed',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              )}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0'
              }}>
                <button 
                  onClick={() => handleDownloadMedia(item)}
                  style={{
                    padding: '8px',
                    background: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}>
                  <Download style={{ width: '16px', height: '16px', color: '#374151' }} />
                </button>
                <button 
                  onClick={() => handleDeleteMedia(item.id)}
                  style={{
                    padding: '8px',
                    background: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef2f2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}>
                  <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                </button>
              </div>
            </div>
            <div style={{ padding: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{item.size}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.folder}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
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
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Select Folder</label>
                  <select 
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
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
                    {folders.filter(f => f !== 'All Files').map((folder, index) => (
                      <option key={folder || `folder-option-${index}`} value={folder}>{folder}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="file-upload-input"
                  />
                  <div 
                    onClick={() => document.getElementById('file-upload-input').click()}
                    style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '12px',
                      padding: '48px',
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
                    {uploadPreviews.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                        {uploadPreviews.map((preview, index) => (
                          preview ? (
                            <img 
                              key={index}
                              src={preview} 
                              alt="Preview" 
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          ) : (
                            <div key={index} style={{ 
                              width: '80px', 
                              height: '80px', 
                              background: '#f1f5f9', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <File style={{ width: '32px', height: '32px', color: '#94a3b8' }} />
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <>
                        <Upload style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Drop files here or click to upload</p>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Support for images, PDFs, audio files, and more</p>
                      </>
                    )}
                  </div>
                  {uploadedFiles.length > 0 && (
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
                      {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowUploadModal(false)}
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
                onClick={handleUpload}
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
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
