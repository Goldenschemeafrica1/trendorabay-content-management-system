import { useState, useEffect } from 'react'
import { 
  Star, 
  Image as ImageIcon, 
  LayoutGrid, 
  Settings, 
  MoveUp, 
  MoveDown, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff,
  Save,
  Upload,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Search,
  Pin,
  Clock,
  User,
  Hash,
  Filter,
  Grid3x3,
  List,
  ChevronDown
} from 'lucide-react'
import api from '../services/api'

export default function Homepage() {
  const [activeTab, setActiveTab] = useState('featured')
  const [loading, setLoading] = useState(true)

  // Featured Stories State
  const [featuredStories, setFeaturedStories] = useState([])
  const [allStories, setAllStories] = useState([])
  const [mainCoverStory, setMainCoverStory] = useState(null)
  const [leftFeatured, setLeftFeatured] = useState(null)
  const [rightFeatured, setRightFeatured] = useState(null)
  const [trendingStories, setTrendingStories] = useState([])
  const [moreToExplore, setMoreToExplore] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Story Display Settings
  const [showCoverImage, setShowCoverImage] = useState(true)
  const [showCategoryBadge, setShowCategoryBadge] = useState(true)
  const [showAuthor, setShowAuthor] = useState(true)
  const [showPublishDate, setShowPublishDate] = useState(true)
  const [showReadingTime, setShowReadingTime] = useState(true)
  const [showViewCount, setShowViewCount] = useState(true)
  
  // Story Scheduling
  const [storyPublishDate, setStoryPublishDate] = useState('')
  const [storyExpiryDate, setStoryExpiryDate] = useState('')
  const [autoReplace, setAutoReplace] = useState(false)
  
  // Magazines State
  const [featuredMagazines, setFeaturedMagazines] = useState([])
  const [allMagazines, setAllMagazines] = useState([])
  const [magazinesLimit, setMagazinesLimit] = useState(8)
  const [magazinesSortBy, setMagazinesSortBy] = useState('latest')
  const [magazinesLayout, setMagazinesLayout] = useState('grid')
  const [magazinesFilterCategory, setMagazinesFilterCategory] = useState('all')
  
  // Magazine categories
  const magazineCategories = ['Business', 'Lifestyle', 'Sports', 'Fashion', 'Technology', 'Health']
  
  // Ads State
  const [ads, setAds] = useState([])
  
  // Layout State
  const [sections, setSections] = useState([
    { id: 'hero', name: 'Hero Section', enabled: true, order: 1, title: 'Featured Stories' },
    { id: 'magazines', name: 'Latest Magazines', enabled: true, order: 2, title: 'Latest Magazines' },
    { id: 'trending', name: 'Trending Stories', enabled: true, order: 3, title: 'Trending Now' },
    { id: 'explore', name: 'More to Explore', enabled: true, order: 4, title: 'More to Explore' },
    { id: 'ads-horizontal', name: 'Horizontal Ads', enabled: true, order: 5, title: '' },
  ])
  
  // Content State
  const [heroContent, setHeroContent] = useState({
    title: 'Discover Amazing Stories',
    subtitle: 'Your daily source of news and entertainment',
    backgroundImage: ''
  })

  // Categories
  const categories = [
    'Most Popular',
    'Business',
    'Sports',
    'Entertainment',
    'Lifestyle',
    'Technology',
    'Politics',
    'Hot Topic',
    'Editor\'s Pick'
  ]

  // More to Explore Settings
  const [exploreSource, setExploreSource] = useState('latest')
  const [exploreDisplayMode, setExploreDisplayMode] = useState('grid')
  const [exploreLimit, setExploreLimit] = useState(8)
  const [exploreFilterCategory, setExploreFilterCategory] = useState('all')
  
  // Ad Locations
  const [adLocations, setAdLocations] = useState([
    { id: 'top-banner', name: 'Top Banner', enabled: true, image: '', url: '', advertiser: '', campaign: '', priority: 1, rotation: true, active: true, startDate: '', endDate: '', budget: '', impressions: 0, clicks: 0 },
    { id: 'between-sections', name: 'Between Sections', enabled: true, image: '', url: '', advertiser: '', campaign: '', priority: 1, rotation: true, active: true, startDate: '', endDate: '', budget: '', impressions: 0, clicks: 0 },
    { id: 'sidebar-vertical', name: 'Sidebar Vertical', enabled: true, image: '', url: '', advertiser: '', campaign: '', priority: 1, rotation: true, active: true, startDate: '', endDate: '', budget: '', impressions: 0, clicks: 0 },
    { id: 'footer-banner', name: 'Footer Banner', enabled: true, image: '', url: '', advertiser: '', campaign: '', priority: 1, rotation: true, active: true, startDate: '', endDate: '', budget: '', impressions: 0, clicks: 0 },
    { id: 'sponsored-story', name: 'Sponsored Story', enabled: false, image: '', url: '', advertiser: '', campaign: '', priority: 1, rotation: true, active: true, startDate: '', endDate: '', budget: '', impressions: 0, clicks: 0 },
    { id: 'mobile-banner', name: 'Mobile Banner', enabled: true, image: '', url: '', advertiser: '', campaign: '', priority: 1, rotation: true, active: true, startDate: '', endDate: '', budget: '', impressions: 0, clicks: 0 },
  ])

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const fetchHomepageData = async () => {
    try {
      const [storiesRes, magazinesRes] = await Promise.all([
        api.get('/stories'),
        api.get('/magazines')
      ])
      setAllStories(storiesRes)
      setAllMagazines(magazinesRes)
      
      // If stories exist, use them. If no featured stories, use all stories
      const featured = storiesRes.filter(s => s.featured).length > 0 
        ? storiesRes.filter(s => s.featured).slice(0, 6)
        : storiesRes.slice(0, 6)
      
      setFeaturedStories(featured)
      setTrendingStories(storiesRes.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5))
      setMoreToExplore(storiesRes.filter(s => !s.featured).length > 0 
        ? storiesRes.filter(s => !s.featured).slice(0, 6)
        : storiesRes.slice(0, 6))
      setFeaturedMagazines(magazinesRes.slice(0, magazinesLimit))
      
      // Set travel category story as main cover story, or first story if no travel
      if (storiesRes.length > 0) {
        const travelStory = storiesRes.find(s => 
          s.category_name === 'Travel' || s.category === 'Travel'
        )
        setMainCoverStory(travelStory || storiesRes[0])
      }
    } catch (error) {
      console.error('Failed to fetch homepage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    alert('Homepage configuration saved!')
  }

  const moveStory = (index, direction) => {
    const newStories = [...featuredStories]
    if (direction === 'up' && index > 0) {
      [newStories[index], newStories[index - 1]] = [newStories[index - 1], newStories[index]]
    } else if (direction === 'down' && index < newStories.length - 1) {
      [newStories[index], newStories[index + 1]] = [newStories[index + 1], newStories[index]]
    }
    setFeaturedStories(newStories)
  }

  const toggleSection = (sectionId) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const moveSection = (index, direction) => {
    const newSections = [...sections]
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]]
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
    }
    setSections(newSections)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Homepage Management</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Configure and manage homepage content and layout</p>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Save style={{ width: '16px', height: '16px' }} />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {[
          { id: 'featured', label: 'Featured Stories', icon: Star },
          { id: 'magazines', label: 'Magazines', icon: FileText },
          { id: 'explore', label: 'More to Explore', icon: TrendingUp },
          { id: 'ads', label: 'Advertisements', icon: ImageIcon },
          { id: 'layout', label: 'Layout', icon: LayoutGrid },
          { id: 'content', label: 'Content', icon: Settings }
        ].map((tab, index) => (
          <button
            key={tab.id || `tab-${index}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: activeTab === tab.id ? '#7c3aed' : 'transparent',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              color: activeTab === tab.id ? 'white' : '#64748b',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#f1f5f9'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <tab.icon style={{ width: '16px', height: '16px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '24px'
      }}>
        {/* Featured Stories Tab */}
        {activeTab === 'featured' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Story Selection */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Story Selection
              </h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    color: '#475569',
                    minWidth: '150px'
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  style={{
                    padding: '10px 20px',
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
                  Add Featured
                </button>
              </div>
              
              {/* Stories List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allStories.filter(s => 
                  (selectedCategory === 'all' || s.category === selectedCategory) &&
                  (s.title?.toLowerCase().includes(searchQuery.toLowerCase()) || s.content?.toLowerCase().includes(searchQuery.toLowerCase()))
                ).slice(0, 5).map((story, index) => (
                  <div key={story.id || `story-select-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{story.title}</p>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{story.category || 'No category'}</p>
                    </div>
                    <button
                      style={{
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Pin style={{ width: '14px', height: '14px', color: '#64748b' }} />
                      Pin
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Position Management */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Position Management
              </h3>
              
              {/* Three Column Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {/* Left Column - Stories */}
                <div style={{
                  background: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                    Stories
                  </h4>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {featuredStories.slice(0, 4).map((story, index) => (
                      <div key={story.id || `featured-story-${index}`} style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        cursor: 'grab'
                      }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: '#0f172a' }}>{story.title}</p>
                        <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{story.category || 'No category'}</p>
                      </div>
                    ))}
                    {featuredStories.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                        <ImageIcon style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '12px' }}>Add stories here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Column - Cover Image */}
                <div style={{
                  background: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {mainCoverStory ? (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '16px', 
                        fontSize: '11px', 
                        fontWeight: '500',
                        background: '#7c3aed',
                        color: 'white',
                        display: 'inline-block',
                        marginBottom: '12px'
                      }}>
                        Main Cover Story
                      </span>
                      {mainCoverStory.featured_image_url && (
                        <img 
                          src={mainCoverStory.featured_image_url.startsWith('http') ? mainCoverStory.featured_image_url : `http://localhost:5002${mainCoverStory.featured_image_url}`}
                          alt="Cover"
                          style={{ 
                            width: '100%', 
                            height: '250px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            marginBottom: '12px'
                          }}
                        />
                      )}
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{mainCoverStory.title}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{mainCoverStory.category || 'No category'}</p>
                      <button
                        style={{
                          marginTop: '12px',
                          padding: '6px 12px',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          color: '#dc2626',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <ImageIcon style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px' }} />
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Main Cover Story</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>Large center image</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Trending */}
                <div style={{
                  background: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                    Trending
                  </h4>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {trendingStories.slice(0, 4).map((story, index) => (
                      <div key={story.id || `trending-story-${index}`} style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        cursor: 'grab'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <TrendingUp style={{ width: '12px', height: '12px', color: '#ef4444' }} />
                          <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: '600' }}>#{index + 1}</span>
                        </div>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: '#0f172a' }}>{story.title}</p>
                        <p style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{story.views || 0} views</p>
                      </div>
                    ))}
                    {trendingStories.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                        <TrendingUp style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '12px' }}>Add trending stories</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Horizontal Stories */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                  Horizontal Stories
                </h4>
                <div style={{
                  background: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '120px',
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto'
                }}>
                  {moreToExplore.slice(0, 6).map((story, index) => (
                    <div key={story.id || `explore-story-${index}`} style={{
                      minWidth: '200px',
                      background: 'white',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      flexShrink: 0
                    }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{story.title}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{story.category || 'No category'}</p>
                    </div>
                  ))}
                  {moreToExplore.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', width: '100%' }}>
                      <ImageIcon style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '12px' }}>Add horizontal stories</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Secondary Stories */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Secondary Stories
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {featuredStories.map((story, index) => (
                  <div key={story.id || `secondary-story-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      color: '#8b5cf6', 
                      minWidth: '30px' 
                    }}>#{index + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{story.title}</p>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{story.category || 'No category'}</p>
                    </div>
                    <select
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        color: '#475569'
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => moveStory(index, 'up')}
                        disabled={index === 0}
                        style={{
                          padding: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.5 : 1
                        }}
                      >
                        <MoveUp style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      </button>
                      <button
                        onClick={() => moveStory(index, 'down')}
                        disabled={index === featuredStories.length - 1}
                        style={{
                          padding: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: index === featuredStories.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === featuredStories.length - 1 ? 0.5 : 1
                        }}
                      >
                        <MoveDown style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      </button>
                      <button
                        style={{
                          padding: '6px',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Display Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Cover Image', value: showCoverImage, setter: setShowCoverImage },
                  { label: 'Category Badge', value: showCategoryBadge, setter: setShowCategoryBadge },
                  { label: 'Author', value: showAuthor, setter: setShowAuthor },
                  { label: 'Publish Date', value: showPublishDate, setter: setShowPublishDate },
                  { label: 'Reading Time', value: showReadingTime, setter: setShowReadingTime },
                  { label: 'View Count', value: showViewCount, setter: setShowViewCount },
                ].map((setting) => (
                  <label key={setting.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={setting.value}
                      onChange={(e) => setting.setter(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#475569' }}>{setting.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Scheduling
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Publish Date</label>
                  <input
                    type="date"
                    value={storyPublishDate}
                    onChange={(e) => setStoryPublishDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Expiry Date</label>
                  <input
                    type="date"
                    value={storyExpiryDate}
                    onChange={(e) => setStoryExpiryDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Auto Replace</label>
                  <select
                    value={autoReplace ? 'enabled' : 'disabled'}
                    onChange={(e) => setAutoReplace(e.target.value === 'enabled')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Magazines Tab */}
        {activeTab === 'magazines' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Magazine Selection */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Magazine Selection
              </h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button
                  style={{
                    padding: '10px 20px',
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
                  Select Magazine Issues
                </button>
              </div>
              
              {/* Magazines List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {allMagazines.slice(0, 6).map((magazine, index) => (
                  <div key={magazine.id || `magazine-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                    {magazine.cover_image_url && (
                      <img 
                        src={magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `http://localhost:5002${magazine.cover_image_url}`}
                        alt={magazine.title}
                        style={{ 
                          width: '50px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '6px' 
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{magazine.title}</p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>{magazine.category_name || magazine.category || 'No category'}</p>
                    </div>
                    <button
                      style={{
                        padding: '4px 8px',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Display Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Number of Magazines</label>
                  <input
                    type="number"
                    value={magazinesLimit}
                    onChange={(e) => setMagazinesLimit(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sort By</label>
                  <select
                    value={magazinesSortBy}
                    onChange={(e) => setMagazinesSortBy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  >
                    <option value="latest">Latest</option>
                    <option value="featured">Featured</option>
                    <option value="most-viewed">Most Viewed</option>
                    <option value="highest-rated">Highest Rated</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Layout</label>
                  <select
                    value={magazinesLayout}
                    onChange={(e) => setMagazinesLayout(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  >
                    <option value="grid">Grid Layout</option>
                    <option value="carousel">Carousel Layout</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Filter by Category</label>
                  <select
                    value={magazinesFilterCategory}
                    onChange={(e) => setMagazinesFilterCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {magazineCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Featured Magazines Preview */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Featured Magazines Preview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: magazinesLayout === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {featuredMagazines.map((magazine, index) => (
                  <div key={magazine.id || `featured-magazine-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '150px',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {magazine.cover_image_url ? (
                        <img 
                          src={magazine.cover_image_url.startsWith('http') ? magazine.cover_image_url : `http://localhost:5002${magazine.cover_image_url}`}
                          alt={magazine.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <ImageIcon style={{ width: '32px', height: '32px', color: '#94a3b8' }} />
                      )}
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: '#7c3aed',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}>
                        Featured
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{magazine.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{magazine.category || 'No category'}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>${magazine.price || '0'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          background: '#7c3aed',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          padding: '6px',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Magazine Information */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Magazine Information Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Cover Image', checked: true },
                  { label: 'Issue Number', checked: true },
                  { label: 'Publication Date', checked: true },
                  { label: 'Price', checked: true },
                  { label: 'Rating', checked: true },
                  { label: 'Download Link', checked: false },
                  { label: 'Read Online Link', checked: false },
                ].map((setting) => (
                  <label key={setting.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      defaultChecked={setting.checked}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#475569' }}>{setting.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* More to Explore Tab */}
        {activeTab === 'explore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Story Source */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Story Source
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { id: 'latest', label: 'Latest Stories', icon: FileText },
                  { id: 'trending', label: 'Trending', icon: TrendingUp },
                  { id: 'category', label: 'Category Based', icon: Filter },
                  { id: 'manual', label: 'Manual Selection', icon: Hash },
                  { id: 'ai', label: 'AI Recommended (Future)', icon: Star },
                ].map((source) => (
                  <label key={source.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: exploreSource === source.id ? '#7c3aed' : '#f8fafc',
                    borderRadius: '10px',
                    border: exploreSource === source.id ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <source.icon style={{ width: '20px', height: '20px', color: exploreSource === source.id ? 'white' : '#64748b' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: exploreSource === source.id ? 'white' : '#475569' }}>{source.label}</span>
                    <input
                      type="radio"
                      name="explore-source"
                      checked={exploreSource === source.id}
                      onChange={() => setExploreSource(source.id)}
                      style={{ marginLeft: 'auto', width: '18px', height: '18px' }}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Display Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Number of Stories</label>
                  <input
                    type="number"
                    value={exploreLimit}
                    onChange={(e) => setExploreLimit(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Display Mode</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setExploreDisplayMode('grid')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: exploreDisplayMode === 'grid' ? '#7c3aed' : '#f1f5f9',
                        border: exploreDisplayMode === 'grid' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: exploreDisplayMode === 'grid' ? 'white' : '#475569',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'center'
                      }}
                    >
                      <Grid3x3 style={{ width: '14px', height: '14px' }} />
                      Grid
                    </button>
                    <button
                      onClick={() => setExploreDisplayMode('list')}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: exploreDisplayMode === 'list' ? '#7c3aed' : '#f1f5f9',
                        border: exploreDisplayMode === 'list' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: exploreDisplayMode === 'list' ? 'white' : '#475569',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'center'
                      }}
                    >
                      <List style={{ width: '14px', height: '14px' }} />
                      List
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Load More Option</label>
                  <select
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  >
                    <option>Infinite Scroll</option>
                    <option>Load More Button</option>
                    <option>Pagination</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Filters
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={exploreFilterCategory}
                    onChange={(e) => setExploreFilterCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Tag</label>
                  <input
                    type="text"
                    placeholder="Filter by tag..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Author</label>
                  <input
                    type="text"
                    placeholder="Filter by author..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Preview
              </h3>
              <div style={{ display: exploreDisplayMode === 'grid' ? 'grid' : 'flex', gridTemplateColumns: exploreDisplayMode === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr', flexDirection: exploreDisplayMode === 'list' ? 'column' : 'row', gap: '12px' }}>
                {moreToExplore.slice(0, exploreLimit).map((story, index) => (
                  <div key={story.id || `explore-preview-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: exploreDisplayMode === 'grid' ? '16px' : '12px',
                    border: '1px solid #e2e8f0',
                    display: exploreDisplayMode === 'list' ? 'flex' : 'block',
                    alignItems: exploreDisplayMode === 'list' ? 'center' : 'flex-start',
                    gap: exploreDisplayMode === 'list' ? '12px' : '0',
                    flex: exploreDisplayMode === 'list' ? '1' : 'auto'
                  }}>
                    <div style={{
                      width: exploreDisplayMode === 'grid' ? '100%' : '80px',
                      height: exploreDisplayMode === 'grid' ? '120px' : '60px',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      marginBottom: exploreDisplayMode === 'grid' ? '12px' : '0',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ImageIcon style={{ width: exploreDisplayMode === 'grid' ? '24px' : '16px', height: exploreDisplayMode === 'grid' ? '24px' : '16px', color: '#94a3b8' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', lineHeight: 1.4 }}>{story.title}</p>
                      {exploreDisplayMode === 'list' && (
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{story.view_count || 0} views</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
              Advertisement Management
            </h3>
            
            {/* Ad Locations */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                Homepage Ad Locations
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                {adLocations.map((ad, index) => (
                  <div key={ad.id || `ad-location-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: ad.enabled ? '2px solid #7c3aed' : '2px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{ad.name}</h5>
                      <button
                        onClick={() => setAdLocations(adLocations.map(a => a.id === ad.id ? { ...a, enabled: !a.enabled } : a))}
                        style={{
                          padding: '4px 8px',
                          background: ad.enabled ? '#dcfce7' : '#f1f5f9',
                          border: ad.enabled ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          color: ad.enabled ? '#166534' : '#64748b'
                        }}
                      >
                        {ad.enabled ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Advertiser</label>
                        <input
                          type="text"
                          value={ad.advertiser}
                          onChange={(e) => setAdLocations(adLocations.map(a => a.id === ad.id ? { ...a, advertiser: e.target.value } : a))}
                          placeholder="Advertiser name"
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '11px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Campaign</label>
                        <input
                          type="text"
                          value={ad.campaign}
                          onChange={(e) => setAdLocations(adLocations.map(a => a.id === ad.id ? { ...a, campaign: e.target.value } : a))}
                          placeholder="Campaign name"
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '11px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Priority</label>
                        <input
                          type="number"
                          value={ad.priority}
                          onChange={(e) => setAdLocations(adLocations.map(a => a.id === ad.id ? { ...a, priority: parseInt(e.target.value) } : a))}
                          min="1"
                          max="10"
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '11px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Rotation</label>
                        <select
                          value={ad.rotation ? 'enabled' : 'disabled'}
                          onChange={(e) => setAdLocations(adLocations.map(a => a.id === ad.id ? { ...a, rotation: e.target.value === 'enabled' } : a))}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '11px'
                          }}
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Settings */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                Advertisement Settings
              </h4>
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Upload Image</label>
                    <div style={{
                      width: '100%',
                      height: '80px',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}>
                      <Upload style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Mobile Image</label>
                    <div style={{
                      width: '100%',
                      height: '80px',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}>
                      <Upload style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Destination URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                Scheduling
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Start Date</label>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>End Date</label>
                  <input
                    type="date"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Daily Budget (Optional)</label>
                  <input
                    type="number"
                    placeholder="$0.00"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CTR Analytics */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>
                CTR Analytics
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Impressions</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>12,458</p>
                </div>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Clicks</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>1,234</p>
                </div>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>CTR</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>9.9%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section Visibility */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Section Visibility
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {sections.map((section, index) => (
                  <label key={section.id || `section-${index}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: section.enabled ? '#f8fafc' : '#fee2e2',
                    borderRadius: '10px',
                    border: section.enabled ? '1px solid #e2e8f0' : '1px solid #fecaca',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleSection(section.id)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>{section.name}</span>
                    {section.enabled ? <Eye style={{ width: '16px', height: '16px', color: '#10b981', marginLeft: 'auto' }} /> : <EyeOff style={{ width: '16px', height: '16px', color: '#64748b', marginLeft: 'auto' }} />}
                  </label>
                ))}
              </div>
            </div>

            {/* Section Order */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Section Order
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Drag-and-drop to reorder sections</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sections.map((section, index) => (
                  <div key={section.id || `section-order-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid #e2e8f0',
                    cursor: 'move'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '18px' }}>☰</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', flex: 1 }}>{section.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        style={{
                          padding: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.5 : 1
                        }}
                      >
                        <MoveUp style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      </button>
                      <button
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sections.length - 1}
                        style={{
                          padding: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: index === sections.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === sections.length - 1 ? 0.5 : 1
                        }}
                      >
                        <MoveDown style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Titles */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
                Section Titles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sections.map((section, index) => (
                  <div key={section.id || `section-title-${index}`} style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{section.name}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>✦</span>
                    </div>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))}
                      placeholder="Section title"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
              Homepage Content
            </h3>
            
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                Hero Section Title
              </label>
              <input
                type="text"
                value={heroContent.title}
                onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  color: '#0f172a'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                Hero Section Subtitle
              </label>
              <input
                type="text"
                value={heroContent.subtitle}
                onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  color: '#0f172a'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                Background Image
              </label>
              <div style={{
                width: '100%',
                height: '120px',
                background: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Upload style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Click to upload background image</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
