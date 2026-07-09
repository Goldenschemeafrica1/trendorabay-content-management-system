import { useState, useEffect, useContext } from 'react'
import { Plus, Search, Edit, Trash2, Play, Upload, Clock } from 'lucide-react'
import api from '../services/api'
import { HeaderVisibilityContext, SidebarVisibilityContext } from '../components/Layout'

export default function Podcasts() {
  const { setHideHeader } = useContext(HeaderVisibilityContext)
  const { setHideSidebar } = useContext(SidebarVisibilityContext)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPodcast, setEditingPodcast] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [podcasts, setPodcasts] = useState([])
  const [categories, setCategories] = useState([])
  const [hosts, setHosts] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState(null)
  const [audioRef, setAudioRef] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    episode_number: '',
    category: '',
    description: '',
    guest: '',
    duration: '',
    host: '',
    status: 'draft'
  })
  const [coverArtFile, setCoverArtFile] = useState(null)
  const [coverArtPreview, setCoverArtPreview] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  
  // Fetch podcasts, categories, hosts, and guests from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [podcastsData, categoriesData, hostsData, guestsData] = await Promise.all([
          api.get('/podcasts'),
          api.get('/categories'),
          api.get('/podcast-hosts'),
          api.get('/podcast-guests')
        ])
        setPodcasts(podcastsData)
        setCategories(categoriesData)
        setHosts(hostsData)
        setGuests(guestsData)
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
    console.log('Podcasts useEffect - showCreateModal:', showCreateModal, 'showEditModal:', showEditModal)
    setHideHeader(showCreateModal || showEditModal)
    setHideSidebar(showCreateModal || showEditModal)
  }, [showCreateModal, showEditModal, setHideHeader, setHideSidebar])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCoverArtChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverArtFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverArtPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
    }
  }

  const handleCreatePodcast = async (status) => {
    console.log('Creating podcast with status:', status)
    console.log('Form data:', formData)
    console.log('Cover art file:', coverArtFile)
    console.log('Audio file:', audioFile)
    
    if (!formData.title || formData.title.trim() === '') {
      alert('Please fill in the episode title')
      return
    }
    if (!formData.episode_number || formData.episode_number === '') {
      alert('Please fill in the episode number')
      return
    }
    if (!formData.category || formData.category === '') {
      alert('Please select a category')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('episode_number', formData.episode_number)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('guest', formData.guest)
      formDataToSend.append('duration', formData.duration)
      formDataToSend.append('host', formData.host)
      formDataToSend.append('status', formData.status)
      if (coverArtFile) {
        formDataToSend.append('cover_art', coverArtFile)
      }
      if (audioFile) {
        formDataToSend.append('audio_file', audioFile)
      }
      if (videoFile) {
        formDataToSend.append('video_file', videoFile)
      }

      console.log('Sending FormData to /podcasts')
      const response = await api.post('/podcasts', formDataToSend)
      console.log('Response:', response)
      
      setShowCreateModal(false)
      setFormData({ title: '', episode_number: '', category: '', description: '', guest: '', duration: '', host: '', status: 'draft' })
      setCoverArtFile(null)
      setCoverArtPreview(null)
      setAudioFile(null)
      setVideoFile(null)
      // Refresh podcasts list
      const data = await api.get('/podcasts')
      setPodcasts(data)
      alert('Podcast episode created successfully!')
    } catch (error) {
      console.error('Failed to create podcast:', error)
      alert('Failed to create podcast: ' + error.message)
    }
  }

  const handleDeletePodcast = async (podcastId) => {
    if (!confirm('Are you sure you want to delete this podcast episode?')) {
      return
    }
    
    try {
      await api.delete(`/podcasts/${podcastId}`)
      // Refresh podcasts list
      const data = await api.get('/podcasts')
      setPodcasts(data)
      alert('Podcast episode deleted successfully!')
    } catch (error) {
      console.error('Failed to delete podcast:', error)
      alert('Failed to delete podcast: ' + error.message)
    }
  }

  const handleEditPodcast = (podcast) => {
    setEditingPodcast(podcast)
    setFormData({
      title: podcast.title,
      episode_number: podcast.episode_number,
      category: podcast.category_name || podcast.category,
      description: podcast.description || ''
    })
    setCoverArtPreview(podcast.cover_art_url ? `http://localhost:5002${podcast.cover_art_url}` : null)
    setShowEditModal(true)
  }

  const handleUpdatePodcast = async (status) => {
    if (!formData.title || formData.title.trim() === '') {
      alert('Please fill in the episode title')
      return
    }
    if (!formData.episode_number || formData.episode_number === '') {
      alert('Please fill in the episode number')
      return
    }
    if (!formData.category || formData.category === '') {
      alert('Please select a category')
      return
    }
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('episode_number', formData.episode_number)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('description', formData.description)
      if (coverArtFile) {
        formDataToSend.append('cover_art', coverArtFile)
      }
      if (audioFile) {
        formDataToSend.append('audio_file', audioFile)
      }
      
      const response = await api.put(`/podcasts/${editingPodcast.id}`, formDataToSend)
      
      // Refresh podcasts list
      const data = await api.get('/podcasts')
      setPodcasts(data)
      setShowEditModal(false)
      setEditingPodcast(null)
      setFormData({ title: '', episode_number: '', category: '', description: '' })
      setCoverArtFile(null)
      setCoverArtPreview(null)
      setAudioFile(null)
      alert('Podcast episode updated successfully!')
    } catch (error) {
      console.error('Failed to update podcast:', error)
      alert('Failed to update podcast: ' + error.message)
    }
  }

  const handlePlayAudio = (podcast) => {
    if (!podcast.audio_file_url) {
      alert('No audio file available for this episode')
      return
    }

    if (playingAudio === podcast.id) {
      // Pause current audio
      if (audioRef) {
        audioRef.pause()
        setPlayingAudio(null)
      }
    } else {
      // Stop current audio if playing
      if (audioRef) {
        audioRef.pause()
      }

      // Play new audio
      const audio = new Audio(`http://localhost:5002${podcast.audio_file_url}`)
      audio.play()
      setAudioRef(audio)
      setPlayingAudio(podcast.id)

      audio.onended = () => {
        setPlayingAudio(null)
      }
    }
  }

  const filteredPodcasts = podcasts.map(podcast => ({
    ...podcast,
    episode: podcast.episode_number || 0,
    duration: 'N/A', // Backend doesn't track duration yet
    category: podcast.category_name || 'Uncategorized',
    status: 'published', // Backend doesn't have status field yet
    date: podcast.published_at ? new Date(podcast.published_at).toLocaleDateString() : 'N/A'
  })).filter(podcast =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>Podcasts</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Manage podcast episodes and audio content</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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
          Add Episode
        </button>
      </div>

      {/* Search */}
      <div style={{ maxWidth: '448px' }}>
        <input
          type="text"
          placeholder="Search episodes..."
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

      {/* Podcasts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredPodcasts.map((podcast) => (
          <div key={podcast.id} style={{
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
              aspectRatio: '16/9', 
              background: podcast.cover_art_url 
                ? `url(http://localhost:5002${podcast.cover_art_url}) center/cover no-repeat` 
                : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              {!podcast.cover_art_url && (
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  <Play style={{ width: '24px', height: '24px', color: 'white', marginLeft: '3px' }} />
                </div>
              )}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px', flex: 1 }}>{podcast.title}</h3>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '16px', 
                  fontSize: '11px', 
                  fontWeight: '500',
                  flexShrink: 0,
                  marginLeft: '6px',
                  background: podcast.status === 'published' ? '#dcfce7' : '#fef9c3',
                  color: podcast.status === 'published' ? '#166534' : '#854d0e'
                }}>
                  {podcast.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock style={{ width: '14px', height: '14px' }} />
                  {podcast.duration}
                </span>
                <span>Episode {podcast.episode}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>{podcast.date}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  borderRadius: '16px', 
                  fontSize: '11px', 
                  fontWeight: '500'
                }}>
                  {podcast.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <button 
                    onClick={() => handlePlayAudio(podcast)}
                    style={{
                      padding: '6px',
                      background: playingAudio === podcast.id ? '#7c3aed' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (playingAudio !== podcast.id) {
                        e.currentTarget.style.background = '#f1f5f9'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (playingAudio !== podcast.id) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}>
                    <Play style={{ width: '14px', height: '14px', color: playingAudio === podcast.id ? 'white' : '#64748b', fill: playingAudio === podcast.id ? 'white' : 'none' }} />
                  </button>
                  <button 
                    onClick={() => handleEditPodcast(podcast)}
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
                    onClick={() => handleDeletePodcast(podcast.id)}
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Add New Episode</h2>
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Episode Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter episode title..."
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Episode Number</label>
                    <input
                      type="number"
                      name="episode_number"
                      value={formData.episode_number}
                      onChange={handleInputChange}
                      placeholder="e.g., 45"
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Guest</label>
                    <select 
                      name="guest"
                      value={formData.guest}
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
                      <option value="">Select guest...</option>
                      {guests.map(guest => (
                        <option key={guest.id} value={guest.name}>{guest.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Status</label>
                    <select 
                      name="status"
                      value={formData.status}
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
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 45:30"
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Host</label>
                    <select 
                      name="host"
                      value={formData.host}
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
                      <option value="">Select host...</option>
                      {hosts.map(host => (
                        <option key={host.id} value={host.name}>{host.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter episode description..."
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
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Cover Art</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverArtChange}
                    style={{ display: 'none' }}
                    id="cover-art-input"
                  />
                  <div 
                    onClick={() => document.getElementById('cover-art-input').click()}
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
                    {coverArtPreview ? (
                      <img 
                        src={coverArtPreview} 
                        alt="Cover art preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload cover art</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Audio File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    style={{ display: 'none' }}
                    id="audio-file-input"
                  />
                  <div 
                    onClick={() => document.getElementById('audio-file-input').click()}
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
                    {audioFile ? (
                      <p style={{ fontSize: '14px', color: '#64748b' }}>{audioFile.name}</p>
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload audio file (MP3, WAV)</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Video File (Optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    style={{ display: 'none' }}
                    id="video-file-input"
                  />
                  <div 
                    onClick={() => document.getElementById('video-file-input').click()}
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
                    {videoFile ? (
                      <p style={{ fontSize: '14px', color: '#64748b' }}>{videoFile.name}</p>
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload video file (MP4, MOV)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '6px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
                onClick={() => handleCreatePodcast('draft')}
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
                onClick={() => handleCreatePodcast('published')}
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
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>Edit Episode</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPodcast(null)
                  setFormData({ title: '', episode_number: '', category: '', description: '' })
                  setCoverArtFile(null)
                  setCoverArtPreview(null)
                  setAudioFile(null)
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Episode Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter episode title..."
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Episode Number</label>
                    <input
                      type="number"
                      name="episode_number"
                      value={formData.episode_number}
                      onChange={handleInputChange}
                      placeholder="e.g., 45"
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Guest</label>
                    <select 
                      name="guest"
                      value={formData.guest}
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
                      <option value="">Select guest...</option>
                      {guests.map(guest => (
                        <option key={guest.id} value={guest.name}>{guest.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Status</label>
                    <select 
                      name="status"
                      value={formData.status}
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
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 45:30"
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Host</label>
                    <select 
                      name="host"
                      value={formData.host}
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
                      <option value="">Select host...</option>
                      {hosts.map(host => (
                        <option key={host.id} value={host.name}>{host.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter episode description..."
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
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Cover Art</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverArtChange}
                    style={{ display: 'none' }}
                    id="edit-cover-art-input"
                  />
                  <div 
                    onClick={() => document.getElementById('edit-cover-art-input').click()}
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
                    {coverArtPreview ? (
                      <img 
                        src={coverArtPreview} 
                        alt="Cover art preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload cover art</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Audio File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    style={{ display: 'none' }}
                    id="edit-audio-file-input"
                  />
                  <div 
                    onClick={() => document.getElementById('edit-audio-file-input').click()}
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
                    {audioFile ? (
                      <p style={{ fontSize: '14px', color: '#64748b' }}>{audioFile.name}</p>
                    ) : (
                      <>
                        <Upload style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Click to upload audio file (MP3, WAV)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '6px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPodcast(null)
                  setFormData({ title: '', episode_number: '', category: '', description: '' })
                  setCoverArtFile(null)
                  setCoverArtPreview(null)
                  setAudioFile(null)
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
                onClick={() => handleUpdatePodcast('draft')}
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
                onClick={() => handleUpdatePodcast('published')}
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
