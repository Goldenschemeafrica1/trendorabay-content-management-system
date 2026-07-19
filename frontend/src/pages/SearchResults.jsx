import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, BookOpen, Mic, Users, Calendar, ShoppingBag, Search as SearchIcon } from 'lucide-react'
import api from '../services/api'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState({
    stories: [],
    magazines: [],
    podcasts: [],
    users: [],
    events: [],
    products: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
    if (query) {
      performSearch(query)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const performSearch = async (query) => {
    setLoading(true)
    try {
      const [stories, magazines, podcasts, users, events, products] = await Promise.all([
        api.get('/stories').catch(() => []),
        api.get('/magazines').catch(() => []),
        api.get('/podcasts').catch(() => []),
        api.get('/users').catch(() => []),
        api.get('/events').catch(() => []),
        api.get('/merchandise').catch(() => [])
      ])

      const lowerQuery = query.toLowerCase()

      setResults({
        stories: stories.filter(s => 
          s.title?.toLowerCase().includes(lowerQuery) ||
          s.content?.toLowerCase().includes(lowerQuery) ||
          s.author_name?.toLowerCase().includes(lowerQuery)
        ),
        magazines: magazines.filter(m => 
          m.title?.toLowerCase().includes(lowerQuery) ||
          m.description?.toLowerCase().includes(lowerQuery)
        ),
        podcasts: podcasts.filter(p => 
          p.title?.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.host_name?.toLowerCase().includes(lowerQuery)
        ),
        users: users.filter(u => 
          u.name?.toLowerCase().includes(lowerQuery) ||
          u.username?.toLowerCase().includes(lowerQuery) ||
          u.email?.toLowerCase().includes(lowerQuery)
        ),
        events: events.filter(e => 
          e.title?.toLowerCase().includes(lowerQuery) ||
          e.description?.toLowerCase().includes(lowerQuery) ||
          e.location?.toLowerCase().includes(lowerQuery)
        ),
        products: products.filter(p => 
          p.name?.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery)
        )
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

  const tabs = [
    { id: 'all', label: 'All', count: totalResults },
    { id: 'stories', label: 'Stories', count: results.stories.length, icon: FileText },
    { id: 'magazines', label: 'Magazines', count: results.magazines.length, icon: BookOpen },
    { id: 'podcasts', label: 'Podcasts', count: results.podcasts.length, icon: Mic },
    { id: 'users', label: 'Users', count: results.users.length, icon: Users },
    { id: 'events', label: 'Events', count: results.events.length, icon: Calendar },
    { id: 'products', label: 'Products', count: results.products.length, icon: ShoppingBag }
  ]

  const renderResultItem = (item, type) => {
    switch (type) {
      case 'stories':
        return (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{item.title}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{item.author_name || 'Unknown Author'}</p>
            <span style={{ 
              padding: '4px 8px', 
              background: item.status === 'published' ? '#dcfce7' : '#fef3c7',
              color: item.status === 'published' ? '#166534' : '#92400e',
              borderRadius: '8px', 
              fontSize: '11px', 
              fontWeight: '500' 
            }}>
              {item.status || 'draft'}
            </span>
          </div>
        )
      case 'magazines':
        return (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{item.title}</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>{item.description || 'No description'}</p>
          </div>
        )
      case 'podcasts':
        return (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{item.title}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{item.description || 'No description'}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Host: {item.host_name || 'Unknown'}</p>
          </div>
        )
      case 'users':
        return (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {item.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '2px' }}>{item.name || 'Unknown'}</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{item.email || 'No email'}</p>
            </div>
          </div>
        )
      case 'events':
        return (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{item.title}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{item.description || 'No description'}</p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
              <span>{item.event_date ? new Date(item.event_date).toLocaleDateString() : 'TBD'}</span>
              <span>{item.location || 'TBD'}</span>
            </div>
          </div>
        )
      case 'products':
        return (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{item.name}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{item.description || 'No description'}</p>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed' }}>${item.price || '0.00'}</span>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Searching...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
          Search Results
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          {searchQuery ? `Showing results for "${searchQuery}"` : 'Enter a search term'}
        </p>
        {totalResults > 0 && (
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        flexWrap: 'wrap',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#475569',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
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
            {tab.icon && <tab.icon style={{ width: '16px', height: '16px' }} />}
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                padding: '2px 6px',
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {!searchQuery ? (
        <div style={{ textAlign: 'center', padding: '64px 32px' }}>
          <SearchIcon style={{ width: '64px', height: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Enter a search term to find content across the system</p>
        </div>
      ) : totalResults === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 32px' }}>
          <SearchIcon style={{ width: '64px', height: '64px', color: '#cbd5e1', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>No results found for "{searchQuery}"</p>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'all' ? (
            <>
              {results.stories.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Stories</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.stories.map(item => renderResultItem(item, 'stories'))}
                  </div>
                </div>
              )}
              {results.magazines.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Magazines</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.magazines.map(item => renderResultItem(item, 'magazines'))}
                  </div>
                </div>
              )}
              {results.podcasts.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Podcasts</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.podcasts.map(item => renderResultItem(item, 'podcasts'))}
                  </div>
                </div>
              )}
              {results.users.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Users</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.users.map(item => renderResultItem(item, 'users'))}
                  </div>
                </div>
              )}
              {results.events.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Events</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.events.map(item => renderResultItem(item, 'events'))}
                  </div>
                </div>
              )}
              {results.products.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>Products</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.products.map(item => renderResultItem(item, 'products'))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results[activeTab].map(item => renderResultItem(item, activeTab))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
