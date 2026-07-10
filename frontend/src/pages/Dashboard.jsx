import { useState, useEffect } from 'react'
import { 
  FileText, 
  BookOpen, 
  Mic, 
  Users, 
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Calendar,
  UserPlus
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'

export default function Dashboard() {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const userRole = user?.role || 'user'
  const isAdminOrHigher = userRole === 'admin' || userRole === 'superadmin'
  const isEditorOrHigher = userRole === 'editor' || userRole === 'admin' || userRole === 'superadmin'

  const [loading, setLoading] = useState(true)
  const [publishedArticles, setPublishedArticles] = useState(0)
  const [draftArticles, setDraftArticles] = useState(0)
  const [pendingReview, setPendingReview] = useState(0)
  const [scheduledPosts, setScheduledPosts] = useState(0)
  const [topStories, setTopStories] = useState([])
  const [latestSubscribers, setLatestSubscribers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [originalStats, setOriginalStats] = useState([
    { name: 'Total Stories', value: '0', change: '+12%', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Magazines', value: '0', change: '+5%', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Podcasts', value: '0', change: '+8%', icon: Mic, gradient: 'from-violet-500 to-purple-500' },
    { name: 'Users', value: '0', change: '+15%', icon: Users, gradient: 'from-orange-500 to-amber-500' },
    { name: 'Orders', value: '0', change: '+3%', icon: ShoppingBag, gradient: 'from-pink-500 to-rose-500' },
  ])
  // New analytics metrics
  const [popularCategories, setPopularCategories] = useState([])
  const [mostReadArticles, setMostReadArticles] = useState([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stories
        const stories = await api.get('/stories').catch(() => [])
        
        // Calculate article metrics
        const published = stories.filter(s => s.status === 'published').length
        const draft = stories.filter(s => s.status === 'draft').length
        const scheduled = stories.filter(s => s.published_at && new Date(s.published_at) > new Date()).length
        
        setPublishedArticles(published)
        setDraftArticles(draft)
        setScheduledPosts(scheduled)
        setPendingReview(0) // No pending review status in current schema

        // Set top stories (most recent published - top 3)
        const latestPublished = stories.filter(s => s.status === 'published').sort((a, b) => 
          new Date(b.published_at) - new Date(a.published_at)
        ).slice(0, 3)
        setTopStories(latestPublished || [])

        // Build recent activity from fetched data
        const activity = []
        
        if (stories.length > 0) {
          const latestStory = stories[0]
          activity.push({
            id: 1,
            action: 'New story published',
            user: latestStory.author_name || 'Unknown',
            time: 'Recently',
            type: 'story'
          })
        }
        
        // Fetch other content types for activity and original stats
        const [magazines, podcasts, orders, authors] = await Promise.all([
          api.get('/magazines').catch(() => []),
          api.get('/podcasts').catch(() => []),
          isEditorOrHigher ? api.get('/orders').catch(() => []) : Promise.resolve([]),
          isEditorOrHigher ? api.get('/authors').catch(() => []) : Promise.resolve([])
        ])
        
        // Update original stats with real data
        setOriginalStats([
          { name: 'Total Stories', value: stories.length.toString(), change: '+12%', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
          { name: 'Magazines', value: magazines.length.toString(), change: '+5%', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
          { name: 'Podcasts', value: podcasts.length.toString(), change: '+8%', icon: Mic, gradient: 'from-violet-500 to-purple-500' },
          { name: 'Users', value: authors.length.toString(), change: '+15%', icon: Users, gradient: 'from-orange-500 to-amber-500' },
          { name: 'Orders', value: orders.length.toString(), change: '+3%', icon: ShoppingBag, gradient: 'from-pink-500 to-rose-500' },
        ])
        
        if (magazines.length > 0) {
          const latestMagazine = magazines[0]
          activity.push({
            id: 2,
            action: 'Magazine issue uploaded',
            user: latestMagazine.title || 'Unknown',
            time: 'Recently',
            type: 'magazine'
          })
        }
        
        if (podcasts.length > 0) {
          const latestPodcast = podcasts[0]
          activity.push({
            id: 3,
            action: 'Podcast episode added',
            user: latestPodcast.title || 'Unknown',
            time: 'Recently',
            type: 'podcast'
          })
        }

        if (orders.length > 0) {
          const latestOrder = orders[0]
          activity.push({
            id: 4,
            action: `Order #${latestOrder.order_number || latestOrder.id} completed`,
            user: latestOrder.customer_name || 'Unknown',
            time: 'Recently',
            type: 'order'
          })
        }

        setRecentActivity(activity.slice(0, 5))

        // Fetch subscribers
        const subscribers = isAdminOrHigher ? await api.get('/subscribers').catch(() => []) : []
        setLatestSubscribers(subscribers.slice(0, 5))

        // Popular categories from stories
        const categories = {}
        stories.forEach(story => {
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

        // Most read articles (sorted by views if available, otherwise by publish date)
        const publishedStories = stories.filter(s => s.status === 'published')
        const sortedStories = publishedStories
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 3)
        setMostReadArticles(sortedStories.length > 0 ? sortedStories : [])

        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const quickActions = [
    { name: 'Create Story', href: '/dashboard/stories/new', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Upload Magazine', href: '/dashboard/magazines/new', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Add Podcast', href: '/dashboard/podcasts/new', icon: Mic, gradient: 'from-violet-500 to-purple-500' },
    { name: 'Add Author', href: '/dashboard/authors/new', icon: Users, gradient: 'from-orange-500 to-amber-500' },
  ]

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  const metrics = [
    { name: 'Published Articles', value: publishedArticles.toString(), icon: FileText, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Draft Articles', value: draftArticles.toString(), icon: FileText, gradient: 'from-yellow-500 to-orange-500' },
    { name: 'Scheduled Posts', value: scheduledPosts.toString(), icon: Calendar, gradient: 'from-violet-500 to-purple-500' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        borderRadius: '24px',
        padding: '20px 32px',
        color: 'white',
        boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
        width: 'fit-content',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>Welcome back, Admin! 👋</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Here's what's happening with your content today.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        position: 'relative', 
        overflow: 'hidden',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          animation: 'marquee 60s linear infinite',
          animationPlayState: 'running',
          width: 'fit-content'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = 'paused'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = 'running'
        }}>
          {[...metrics, ...originalStats, ...metrics, ...originalStats].map((stat, index) => (
            <div key={`stat-${index}`} style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '12px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              minHeight: '110px',
              minWidth: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  background: stat.gradient === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                            stat.gradient === 'from-emerald-500 to-teal-500' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                            stat.gradient === 'from-violet-500 to-purple-500' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                            stat.gradient === 'from-orange-500 to-amber-500' ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' :
                            stat.gradient === 'from-yellow-500 to-orange-500' ? 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' :
                            stat.gradient === 'from-orange-500 to-red-500' ? 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' :
                            'linear-gradient(135deg, #ec4899 0%, #f43f5e 100',
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  flexShrink: 0
                }}>
                  <stat.icon style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                {stat.change && (
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: '600', 
                    color: '#059669', 
                    background: '#ecfdf5', 
                    padding: '3px 6px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '2px',
                    whiteSpace: 'nowrap'
                  }}>
                    <TrendingUp style={{ width: '8px', height: '8px' }} />
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', lineHeight: 1.2 }}>{stat.value}</h3>
                <p style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontWeight: '500', lineHeight: 1.2 }}>{stat.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%', minWidth: '0' }}>
        {/* Top Stories */}
        {topStories.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Top Stories</h2>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topStories.map((story, index) => (
                <div key={story.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      color: '#8b5cf6', 
                      minWidth: '18px'
                    }}>#{index + 1}</span>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3', maxHeight: '2.6em' }}>{story.title}</h3>
                  </div>
                  {story.excerpt && <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{story.excerpt}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>
                      {story.published_at ? new Date(story.published_at).toLocaleDateString() : 'Not published'}
                    </span>
                    <span style={{ 
                      padding: '2px 6px', 
                      background: '#dcfce7', 
                      color: '#166534', 
                      borderRadius: '10px', 
                      fontSize: '10px', 
                      fontWeight: '500' 
                    }}>
                      Published
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Categories */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>Popular Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {popularCategories.length > 0 ? (
              popularCategories.map((category, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 12px', 
                  background: '#f8fafc', 
                  borderRadius: '10px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{category.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#8b5cf6' }}>{category.count} articles</span>
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
          borderRadius: '24px',
          padding: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px' }}>Most Read Articles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mostReadArticles.length > 0 ? (
              mostReadArticles.map((article, index) => (
                <div key={article.id} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px',
                  padding: '10px 12px', 
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
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.6em' }}>{article.title}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{article.view_count || 0} views</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No articles yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Latest Subscribers, Quick Actions, Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {/* Latest Subscribers */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Latest Subscribers</h2>
            <UserPlus style={{ width: '16px', height: '16px', color: '#f43f5e' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {latestSubscribers.length > 0 ? (
              latestSubscribers.map((subscriber) => (
                <div key={subscriber.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '10px',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {subscriber.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{subscriber.name}</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>{subscriber.email}</p>
                  </div>
                  <span style={{ 
                    padding: '3px 8px', 
                    background: subscriber.status === 'active' ? '#dcfce7' : '#fef9c3', 
                    color: subscriber.status === 'active' ? '#166534' : '#854d0e', 
                    borderRadius: '12px', 
                    fontSize: '11px', 
                    fontWeight: '500' 
                  }}>
                    {subscriber.status}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No subscribers yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Quick Actions</h2>
            <ArrowUpRight style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: action.gradient === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                            action.gradient === 'from-emerald-500 to-teal-500' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                            action.gradient === 'from-violet-500 to-purple-500' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                            'linear-gradient(135deg, #f97316 0%, #f59e0b 100',
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}>
                  <action.icon style={{ width: '18px', height: '18px', color: 'white' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{action.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Recent Activity</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Latest updates and changes</p>
            </div>
            <button style={{
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#8b5cf6', 
              background: '#f5f3ff', 
              padding: '6px 12px', 
              borderRadius: '10px', 
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ede9fe'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f3ff'
            }}>
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', transition: 'background 0.2s ease', border: '1px solid rgba(226, 232, 240, 0.8)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: activity.type === 'story' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100)' :
                              activity.type === 'magazine' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100)' :
                              activity.type === 'podcast' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100)' :
                              activity.type === 'user' ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100)' :
                              'linear-gradient(135deg, #ec4899 0%, #f43f5e 100)'
                  }}>
                    {activity.type === 'story' && <FileText style={{ width: '16px', height: '16px', color: 'white' }} />}
                    {activity.type === 'magazine' && <BookOpen style={{ width: '16px', height: '16px', color: 'white' }} />}
                    {activity.type === 'podcast' && <Mic style={{ width: '16px', height: '16px', color: 'white' }} />}
                    {activity.type === 'user' && <Users style={{ width: '16px', height: '16px', color: 'white' }} />}
                    {activity.type === 'order' && <ShoppingBag style={{ width: '16px', height: '16px', color: 'white' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{activity.action}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>by {activity.user}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0, fontWeight: '500' }}>{activity.time}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
