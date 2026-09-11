import { useState, useEffect } from 'react'
import { Save, Eye, Type, Image, Layout, Settings, Plus, Trash2, Mic, Play, Clock, Users, Calendar, Star, User, FileText, Award, Radio } from 'lucide-react'
import api, { BASE_URL } from '../services/api'

export default function PodcastPage() {
  const [podcastTitle, setPodcastTitle] = useState('Our Podcasts')
  const [podcastContent, setPodcastContent] = useState('Discover our engaging podcasts covering topics from news and entertainment to technology and lifestyle.')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [featuredEpisodes, setFeaturedEpisodes] = useState([])
  const [livePodcastBanner, setLivePodcastBanner] = useState({
    enabled: true,
    title: 'Live Now: Tech Talk Tuesday',
    description: 'Join us for our weekly discussion on the latest technology trends',
    schedule: 'Every Tuesday at 3:00 PM EST',
    image: ''
  })
  const [latestEpisodes, setLatestEpisodes] = useState([])
  const [podcastHosts, setPodcastHosts] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [featuredGuests, setFeaturedGuests] = useState([])

  useEffect(() => {
    fetchPodcasts()
    fetchPodcastHosts()
    fetchFeaturedGuests()
  }, [])

  const fetchPodcasts = async () => {
    try {
      setLoading(true)
      const data = await api.get('/podcasts')
      // Map database fields to component state
      const mappedEpisodes = data.map(podcast => {
        const dateStr = podcast.published_at || podcast.created_at
        const date = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) : 'N/A'
        
        // Construct full image URL if cover_art_url exists
        const imageUrl = podcast.cover_art_url 
          ? (podcast.cover_art_url.startsWith('http') 
              ? podcast.cover_art_url 
              : `${BASE_URL}${podcast.cover_art_url}`)
          : ''
        
        return {
          id: podcast.id,
          title: podcast.title,
          duration: podcast.episode_number || '0:00',
          views: 0,
          date: date,
          image: imageUrl
        }
      })
      setFeaturedEpisodes(mappedEpisodes.slice(0, 3))
      setLatestEpisodes(mappedEpisodes.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch podcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPodcastHosts = async () => {
    try {
      const data = await api.get('/podcast-hosts')
      const mappedHosts = data.map(host => {
        const imageUrl = host.photo_url 
          ? (host.photo_url.startsWith('http') 
              ? host.photo_url 
              : `${BASE_URL}${host.photo_url}`)
          : ''
        
        return {
          id: host.id,
          name: host.name,
          role: host.status || 'Host',
          image: imageUrl
        }
      })
      setPodcastHosts(mappedHosts)
    } catch (error) {
      console.error('Failed to fetch podcast hosts:', error)
    }
  }

  const fetchFeaturedGuests = async () => {
    try {
      const data = await api.get('/podcast-guests')
      const mappedGuests = data.map(guest => {
        const imageUrl = guest.avatar_url 
          ? (guest.avatar_url.startsWith('http') 
              ? guest.avatar_url 
              : `${BASE_URL}${guest.avatar_url}`)
          : ''
        
        return {
          id: guest.id,
          name: guest.name,
          title: guest.title || 'Guest',
          episode: guest.episode || 'Podcast Episode',
          image: imageUrl
        }
      })
      setFeaturedGuests(mappedGuests.slice(0, 4))
    } catch (error) {
      console.error('Failed to fetch featured guests:', error)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Podcast Page</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '13px' }}>Configure the podcast page content and featured episodes</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)'
            }}
          >
            <Eye style={{ width: '16px', height: '16px' }} />
            Preview
          </button>
          <button style={{
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
            <Save style={{ width: '16px', height: '16px' }} />
            Save Changes
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading podcasts...</p>
        </div>
      ) : (
        <>
      {/* Featured Episodes */}
      <div style={{
        background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic style={{ width: '20px', height: '20px' }} />
            Featured Episodes
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Episode
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
          {featuredEpisodes.map((episode, index) => (
            <div key={episode.id || `featured-episode-${index}`} style={{
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid var(--border-color)',
              flex: '1',
              minWidth: '280px'
            }}>
              <div style={{
                width: '100%',
                height: '160px',
                ...(episode.image ? {
                  backgroundImage: `url(${episode.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                }),
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!episode.image && (
                  <Play style={{ width: '32px', height: '32px', color: 'white' }} />
                )}
                {episode.image && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Play style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{episode.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    {episode.duration}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users style={{ width: '12px', height: '12px' }} />
                    {episode.views.toLocaleString()} views
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    {episode.date}
                  </span>
                </div>
              </div>
              <button
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Podcast Banner */}
      <div style={{
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio style={{ width: '20px', height: '20px' }} />
            Live Podcast Banner
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Episode
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={livePodcastBanner.enabled}
                onChange={(e) => setLivePodcastBanner({ ...livePodcastBanner, enabled: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Enable Live Banner
            </label>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Banner Title</label>
            <input
              type="text"
              value={livePodcastBanner.title}
              onChange={(e) => setLivePodcastBanner({ ...livePodcastBanner, title: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
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
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
            <textarea
              value={livePodcastBanner.description}
              onChange={(e) => setLivePodcastBanner({ ...livePodcastBanner, description: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                outline: 'none',
                fontSize: '13px',
                resize: 'vertical',
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Schedule</label>
            <input
              type="text"
              value={livePodcastBanner.schedule}
              onChange={(e) => setLivePodcastBanner({ ...livePodcastBanner, schedule: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
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
                e.currentTarget.style.borderColor = 'var(--border-color)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          {/* Preview of live banner */}
          {livePodcastBanner.enabled && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Live</span>
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{livePodcastBanner.title}</h4>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>{livePodcastBanner.description}</p>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>{livePodcastBanner.schedule}</p>
            </div>
          )}
        </div>
      </div>

      {/* ✦ Latest Episodes */}
      <div style={{
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star style={{ width: '20px', height: '20px' }} />
            ✦ Latest Episodes
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Episode
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
          {latestEpisodes.map((episode, index) => (
            <div key={episode.id || `latest-episode-${index}`} style={{
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid var(--border-color)',
              flex: '1',
              minWidth: '280px'
            }}>
              <div style={{
                width: '100%',
                height: '160px',
                ...(episode.image ? {
                  backgroundImage: `url(${episode.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                }),
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!episode.image && (
                  <Play style={{ width: '32px', height: '32px', color: 'white' }} />
                )}
                {episode.image && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Play style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{episode.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    {episode.duration}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    {episode.date}
                  </span>
                </div>
              </div>
              <button
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Podcast Hosts */}
      <div style={{
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User style={{ width: '20px', height: '20px' }} />
            Podcast Hosts
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Host
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
          {podcastHosts.map((host, index) => (
            <div key={host.id || `host-${index}`} style={{
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid var(--border-color)',
              flex: '1',
              minWidth: '280px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{host.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{host.role}</p>
              </div>
              <button
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Posts */}
      <div style={{
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ width: '20px', height: '20px' }} />
            Blog Posts
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Post
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
          {blogPosts.map((post, index) => (
            <div key={post.id || `post-${index}`} style={{
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid var(--border-color)',
              flex: '1',
              minWidth: '280px'
            }}>
              <div style={{
                width: '100%',
                height: '160px',
                ...(post.image ? {
                  backgroundImage: `url(${post.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                }),
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!post.image && (
                  <FileText style={{ width: '32px', height: '32px', color: 'white' }} />
                )}
                {post.image && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{post.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    {post.date}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--border-color)', padding: '2px 8px', borderRadius: '4px' }}>
                    {post.category}
                  </span>
                </div>
              </div>
              <button
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Guests */}
      <div style={{
        background: 'color-mix(in srgb, var(--bg-primary) 95%, transparent)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid color-mix(in srgb, var(--border-color) 80%, transparent)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ width: '20px', height: '20px' }} />
            Featured Guests
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Guest
          </button>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'space-between' }}>
          {featuredGuests.map((guest, index) => (
            <div key={guest.id || `guest-${index}`} style={{
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid var(--border-color)',
              flex: '0 0 calc(25% - 12px)',
              minWidth: '200px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{guest.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{guest.title}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Episode: {guest.episode}</p>
              </div>
              <button
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
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
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Podcast Page Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>{podcastTitle}</h1>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>{podcastContent}</p>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Featured Episodes</h3>
              {featuredEpisodes.map((episode, index) => (
                <div key={episode.id || `featured-episode-view-${index}`} style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#7c3aed',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Play style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>{episode.title}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{episode.duration} • {episode.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
