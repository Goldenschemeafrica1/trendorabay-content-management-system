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
  UserPlus,
  Plus
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
  const [usersCount, setUsersCount] = useState(0)
  const [originalStats, setOriginalStats] = useState([
    { name: 'Total Stories', value: '0', change: '+12%', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Magazines', value: '0', change: '+5%', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Podcasts', value: '0', change: '+8%', icon: Mic, gradient: 'from-violet-500 to-purple-500' },
    { name: 'Users', value: '0', change: '+15%', icon: Users, gradient: 'from-orange-500 to-amber-500' },
    { name: 'Orders', value: '0', change: '+3%', icon: ShoppingBag, gradient: 'from-pink-500 to-rose-500' },
  ])
  // New analytics metrics
  const [latestUsers, setLatestUsers] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [stories, magazines, podcasts, orders, users, subscribers, events] = await Promise.all([
          api.get('/stories').catch(() => []),
          api.get('/magazines').catch(() => []),
          api.get('/podcasts').catch(() => []),
          isEditorOrHigher ? api.get('/orders').catch(() => []) : Promise.resolve([]),
          isAdminOrHigher ? api.get('/users').catch(() => []) : Promise.resolve([]),
          isAdminOrHigher ? api.get('/subscribers').catch(() => []) : Promise.resolve([]),
          api.get('/events').catch(() => [])
        ])
        
        // Calculate article metrics
        const published = stories.filter(s => s.status === 'published').length
        const draft = stories.filter(s => s.status === 'draft').length
        const scheduled = stories.filter(s => s.published_at && new Date(s.published_at) > new Date()).length
        
        setPublishedArticles(published)
        setDraftArticles(draft)
        setScheduledPosts(scheduled)
        setPendingReview(0) // No pending review status in current schema
        setUsersCount(users.filter(user => user.role !== 'superadmin').length)

        // Set top stories (most recent published - top 10)
        const latestPublished = stories.filter(s => s.status === 'published').sort((a, b) => 
          new Date(b.published_at) - new Date(a.published_at)
        ).slice(0, 10)
        setTopStories(latestPublished || [])

        // Update original stats with real data
        setOriginalStats([
          { name: 'Total Stories', value: stories.length.toString(), change: '+12%', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
          { name: 'Magazines', value: magazines.length.toString(), change: '+5%', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
          { name: 'Podcasts', value: podcasts.length.toString(), change: '+8%', icon: Mic, gradient: 'from-violet-500 to-purple-500' },
          { name: 'Orders', value: orders.length.toString(), change: '+3%', icon: ShoppingBag, gradient: 'from-pink-500 to-rose-500' },
        ])
        
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
        setLatestSubscribers(subscribers.slice(0, 5))

        // Latest users from User Management
        const sortedUsers = users
          .sort((a, b) => new Date(b.cms_created_at || 0) - new Date(a.cms_created_at || 0))
          .slice(0, 5)
          .map(user => ({
            id: user.cms_user_id,
            name: user.name || user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
            email: user.email || 'No email',
            role: user.role || 'user',
            joined_at: user.cms_created_at || new Date().toISOString()
          }))
        setLatestUsers(sortedUsers.length > 0 ? sortedUsers : [])

        // Upcoming events (filter for events with status 'upcoming' or event_date >= today)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcoming = events
          .filter(event => {
            const eventDate = new Date(event.event_date)
            eventDate.setHours(0, 0, 0, 0)
            return event.status === 'upcoming' || eventDate >= today
          })
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 3)
        setUpcomingEvents(upcoming.length > 0 ? upcoming : [])

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
    { name: 'Users', value: usersCount.toString(), icon: Users, gradient: 'from-orange-500 to-amber-500' },
    { name: 'Published Articles', value: publishedArticles.toString(), icon: FileText, gradient: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Main Layout - Left: Stats + Users + Events, Right: Top Stories */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', width: '100%' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stats Cards - 3x2 Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px'
          }}>
            {[...metrics, ...originalStats].map((stat, index) => (
              <div key={`stat-${index}`} style={{
                background: stat.gradient === 'from-blue-500 to-cyan-500' ? 'rgba(59, 130, 246, 0.08)' :
                          stat.gradient === 'from-emerald-500 to-teal-500' ? 'rgba(16, 185, 129, 0.08)' :
                          stat.gradient === 'from-violet-500 to-purple-500' ? 'rgba(139, 92, 246, 0.08)' :
                          stat.gradient === 'from-orange-500 to-amber-500' ? 'rgba(249, 115, 22, 0.08)' :
                          stat.gradient === 'from-yellow-500 to-orange-500' ? 'rgba(234, 179, 8, 0.08)' :
                          stat.gradient === 'from-orange-500 to-red-500' ? 'rgba(249, 115, 22, 0.08)' :
                          stat.gradient === 'from-pink-500 to-rose-500' ? 'rgba(236, 72, 153, 0.08)' :
                          'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '16px',
                border: stat.gradient === 'from-blue-500 to-cyan-500' ? '1px solid rgba(59, 130, 246, 0.2)' :
                          stat.gradient === 'from-emerald-500 to-teal-500' ? '1px solid rgba(16, 185, 129, 0.2)' :
                          stat.gradient === 'from-violet-500 to-purple-500' ? '1px solid rgba(139, 92, 246, 0.2)' :
                          stat.gradient === 'from-orange-500 to-amber-500' ? '1px solid rgba(249, 115, 22, 0.2)' :
                          stat.gradient === 'from-yellow-500 to-orange-500' ? '1px solid rgba(234, 179, 8, 0.2)' :
                          stat.gradient === 'from-orange-500 to-red-500' ? '1px solid rgba(249, 115, 22, 0.2)' :
                          stat.gradient === 'from-pink-500 to-rose-500' ? '1px solid rgba(236, 72, 153, 0.2)' :
                          '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    background: stat.gradient === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                              stat.gradient === 'from-emerald-500 to-teal-500' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                              stat.gradient === 'from-violet-500 to-purple-500' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                              stat.gradient === 'from-orange-500 to-amber-500' ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' :
                              stat.gradient === 'from-yellow-500 to-orange-500' ? 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' :
                              stat.gradient === 'from-orange-500 to-red-500' ? 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' :
                              stat.gradient === 'from-pink-500 to-rose-500' ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                              'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    flexShrink: 0
                  }}>
                    <stat.icon style={{ width: '18px', height: '18px', color: 'white' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', lineHeight: 1.2 }}>{stat.name}</p>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>{stat.value}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    background: '#f1f5f9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}>
                    <Plus style={{ width: '16px', height: '16px', color: '#64748b' }} />
                  </div>
                  <button style={{
                    fontSize: '10px', 
                    fontWeight: '600', 
                    color: '#8b5cf6', 
                    background: '#f5f3ff', 
                    padding: '5px 10px', 
                    borderRadius: '10px', 
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
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
              </div>
            ))}
          </div>

          {/* Latest Users and Upcoming Events */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {/* Latest Users */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Recent Users</h3>
                <Users style={{ width: '16px', height: '16px', color: '#f97316' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {latestUsers.length > 0 ? (
                  latestUsers.map((user, index) => (
                    <div key={`user-${user.id || index}`} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '10px 12px', 
                      background: '#f8fafc', 
                      borderRadius: '10px'
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{user.name}</p>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>{user.email}</p>
                      </div>
                      <span style={{ 
                        padding: '3px 8px', 
                        background: '#fef3c7', 
                        color: '#92400e', 
                        borderRadius: '12px', 
                        fontSize: '10px', 
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {user.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No users yet</p>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Upcoming Events</h3>
                <Calendar style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <div key={event.id || `event-${index}`} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '10px',
                      padding: '10px 12px', 
                      background: '#f8fafc', 
                      borderRadius: '10px'
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {new Date(event.event_date).getDate()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.6em' }}>{event.title}</p>
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{event.location || 'TBD'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No upcoming events</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Top Stories (Full Height) */}
        {topStories.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            height: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Top Stories</h2>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topStories.map((story, index) => (
                <div key={story.id || `story-${index}`} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
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
              latestSubscribers.map((subscriber, index) => (
                <div key={subscriber.id || `subscriber-${index}`} style={{ 
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
            {quickActions.map((action, index) => (
              <a
                key={action.name || `action-${index}`}
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
              recentActivity.map((activity, index) => (
                <div key={activity.id || `activity-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', transition: 'background 0.2s ease', border: '1px solid rgba(226, 232, 240, 0.8)' }}
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
