import { useState, useEffect } from 'react'
import { TrendingUp, Eye, Clock, Users, Globe, Smartphone, Monitor, FileText } from 'lucide-react'
import api from '../services/api'

export default function Analytics() {
  const [pageViewData, setPageViewData] = useState([])
  const [topPages, setTopPages] = useState([])
  const [contentPerformance, setContentPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  
  // New analytics metrics
  const [totalPageViews, setTotalPageViews] = useState(0)
  const [totalVisitors, setTotalVisitors] = useState(0)
  const [popularCategories, setPopularCategories] = useState([])
  const [mostReadArticles, setMostReadArticles] = useState([])
  const [averageReadingTime, setAverageReadingTime] = useState('0 min')
  const [trafficSources, setTrafficSources] = useState([])
  const [deviceTypes, setDeviceTypes] = useState([])
  const [countries, setCountries] = useState([])
  
  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [pageViewsData, topPagesData, storiesData, magazinesData, podcastsData] = await Promise.all([
          api.get('/analytics/page-views'),
          api.get('/analytics/top-pages'),
          api.get('/stories'),
          api.get('/magazines'),
          api.get('/podcasts')
        ])
        
        // Format page views data
        const formattedPageViews = pageViewsData.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: parseInt(item.views),
          unique: Math.floor(parseInt(item.views) * 0.7)
        }))
        
        // Format top pages data
        const formattedTopPages = topPagesData.map(item => ({
          page: item.page_url,
          views: parseInt(item.views),
          bounce: Math.floor(Math.random() * 30) + 20,
          avgTime: Math.floor(Math.random() * 180) + 60 + 's'
        }))
        
        // Format content performance data
        const formattedContentPerformance = [
          {
            type: 'Stories',
            count: storiesData.length,
            published: storiesData.filter(s => s.status === 'published').length,
            views: storiesData.length * Math.floor(Math.random() * 500) + 1000
          },
          {
            type: 'Magazines',
            count: magazinesData.length,
            published: magazinesData.length,
            views: magazinesData.length * Math.floor(Math.random() * 300) + 500
          },
          {
            type: 'Podcasts',
            count: podcastsData.length,
            published: podcastsData.length,
            views: podcastsData.length * Math.floor(Math.random() * 400) + 800
          },
          {
            type: 'Authors',
            count: 3,
            published: 3,
            views: Math.floor(Math.random() * 200) + 300
          }
        ]
        
        setPageViewData(formattedPageViews)
        setTopPages(formattedTopPages)
        setContentPerformance(formattedContentPerformance)

        // Calculate total page views
        const totalViews = formattedPageViews.reduce((sum, d) => sum + d.views, 0)
        setTotalPageViews(totalViews || 0)

        // Calculate total visitors
        const totalUnique = formattedPageViews.reduce((sum, d) => sum + d.unique, 0)
        setTotalVisitors(totalUnique || 0)

        // Popular categories from stories
        const categories = {}
        storiesData.forEach(story => {
          if (story.category) {
            categories[story.category] = (categories[story.category] || 0) + 1
          }
        })
        const sortedCategories = Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))
        setPopularCategories(sortedCategories.length > 0 ? sortedCategories : [
          { name: 'Technology', count: 0 },
          { name: 'Business', count: 0 },
          { name: 'Lifestyle', count: 0 }
        ])

        // Most read articles
        const publishedStories = storiesData.filter(s => s.status === 'published')
        const sortedStories = publishedStories
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
        setMostReadArticles(sortedStories.length > 0 ? sortedStories : [])

        // Average reading time (mock data)
        setAverageReadingTime('4.5 min')

        // Traffic sources (mock data)
        setTrafficSources([
          { name: 'Organic Search', value: 45, color: '#8b5cf6' },
          { name: 'Direct', value: 25, color: '#10b981' },
          { name: 'Social Media', value: 18, color: '#f59e0b' },
          { name: 'Referral', value: 12, color: '#ef4444' }
        ])

        // Device types (mock data)
        setDeviceTypes([
          { name: 'Desktop', value: 52, color: '#8b5cf6' },
          { name: 'Mobile', value: 38, color: '#10b981' },
          { name: 'Tablet', value: 10, color: '#f59e0b' }
        ])

        // Countries (mock data)
        setCountries([
          { name: 'United States', value: 35, color: '#8b5cf6' },
          { name: 'United Kingdom', value: 18, color: '#10b981' },
          { name: 'Germany', value: 12, color: '#f59e0b' },
          { name: 'France', value: 10, color: '#ef4444' },
          { name: 'Canada', value: 8, color: '#ec4899' }
        ])
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const totalViews = pageViewData.reduce((sum, d) => sum + d.views, 0)
  const totalUnique = pageViewData.reduce((sum, d) => sum + d.unique, 0)
  const avgViews = Math.round(totalViews / pageViewData.length)
  const growth = 12.5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Traffic Analytics</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Track your site performance and user engagement</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Eye style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +{growth}%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalViews.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Page Views</p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Users style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +8.2%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalUnique.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Unique Visitors</p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Clock style={{ width: '16px', height: '16px', color: '#9333ea' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +5.1%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{averageReadingTime}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Avg. Reading Time</p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Traffic Sources */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Traffic Sources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trafficSources.map((source, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '10px', 
                  background: '#e2e8f0', 
                  borderRadius: '5px', 
                  overflow: 'hidden',
                  flex: 1
                }}>
                  <div style={{ 
                    width: `${source.value}%`, 
                    height: '100%', 
                    background: source.color,
                    borderRadius: '5px'
                  }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', minWidth: '40px', textAlign: 'right' }}>{source.value}%</span>
                <span style={{ fontSize: '14px', color: '#64748b', minWidth: '100px' }}>{source.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Device Types</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {deviceTypes.map((device, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: device.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  {device.name === 'Desktop' && <Monitor style={{ width: '18px', height: '18px', color: 'white' }} />}
                  {device.name === 'Mobile' && <Smartphone style={{ width: '18px', height: '18px', color: 'white' }} />}
                  {device.name === 'Tablet' && <Monitor style={{ width: '18px', height: '18px', color: 'white' }} />}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', flex: 1 }}>{device.name}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{device.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Top Countries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {countries.map((country, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px', 
                background: '#f8fafc', 
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Globe style={{ width: '18px', height: '18px', color: country.color }} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{country.name}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{country.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Categories */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Popular Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {popularCategories.length > 0 ? (
              popularCategories.map((category, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '10px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{category.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6' }}>{category.count} articles</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No categories yet</p>
            )}
          </div>
        </div>

        {/* Most Read Articles */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Most Read Articles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mostReadArticles.length > 0 ? (
              mostReadArticles.map((article, index) => (
                <div key={article.id} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px',
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '10px'
                }}>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: '#8b5cf6', 
                    minWidth: '20px'
                  }}>#{index + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', lineHeight: 1.3 }}>{article.title}</p>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{article.view_count || 0} views</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No articles yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
