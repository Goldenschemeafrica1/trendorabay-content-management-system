import { useState, useEffect, useContext } from 'react'
import {
  Users,
  FileText,
  BookOpen,
  Building2,
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
  ExternalLink,
  Filter,
  Search,
  Plus,
  Mic,
  Image as ImageIcon,
  ShoppingBag,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Home,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { ThemeContext } from '../contexts/LayoutContexts'
import api from '../services/api'

export default function Overview() {
  const { isDarkMode } = useContext(ThemeContext)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Statistics data
  const [stats, setStats] = useState({
    totalMembers: 0,
    publishedArticles: 0,
    totalMagazines: 0,
    activeCommunities: 0,
    publishedOpportunities: 0,
    activeAdvertisements: 0,
    websiteVisitors: 0,
    totalRevenue: 0
  })

  // Website analytics data
  const [analyticsData, setAnalyticsData] = useState([])
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    totalPageViews: 0,
    uniqueVisitors: 0,
    avgEngagementTime: '0m 0s'
  })

  // Revenue data
  const [revenueData, setRevenueData] = useState([])
  const [revenueBreakdown, setRevenueBreakdown] = useState([])

  // Recent content
  const [recentContent, setRecentContent] = useState([])

  // Pending tasks
  const [pendingTasks, setPendingTasks] = useState([])

  // Recent activity
  const [recentActivity, setRecentActivity] = useState([])

  // Homepage data
  const [homepageData, setHomepageData] = useState({
    featuredStory: null,
    latestMagazines: [],
    featuredStoriesCount: 0,
    activeAds: 0,
    lastUpdate: null
  })

  useEffect(() => {
    fetchOverviewData()
  }, [dateRange])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const data = await api.get('/overview', false, false)

      // Set statistics
      setStats(data.stats || {
        totalMembers: 0,
        publishedArticles: 0,
        totalMagazines: 0,
        activeCommunities: 0,
        publishedOpportunities: 0,
        activeAdvertisements: 0,
        websiteVisitors: 0,
        totalRevenue: 0
      })

      // Set analytics data
      setAnalyticsData(data.analytics?.chartData || [])
      setAnalyticsMetrics(data.analytics?.metrics || {
        totalPageViews: 0,
        uniqueVisitors: 0,
        avgEngagementTime: '0m 0s'
      })

      // Set revenue data
      setRevenueData(data.revenue?.chartData || [])
      setRevenueBreakdown(data.revenue?.breakdown || [])

      // Set recent content
      setRecentContent(data.recentContent || [])

      // Set pending tasks
      setPendingTasks(data.pendingTasks || [])

      // Set recent activity
      setRecentActivity(data.recentActivity || [])

      // Set homepage data
      setHomepageData(data.homepage || {
        featuredStory: null,
        latestMagazines: [],
        featuredStoriesCount: 0,
        activeAds: 0,
        lastUpdate: null
      })

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch overview data:', error)
      setLoading(false)
    }
  }

  const quickActions = [
    { name: 'Create Article', icon: FileText, href: '/dashboard/stories/create' },
    { name: 'Add Magazine', icon: BookOpen, href: '/dashboard/magazines/create' },
    { name: 'Publish Opportunity', icon: Calendar, href: '/dashboard/events/create' },
    { name: 'Add Podcast Episode', icon: Mic, href: '/dashboard/podcasts' },
    { name: 'Create Advertisement', icon: ImageIcon, href: '/dashboard/advertisements' },
    { name: 'Add Product', icon: ShoppingBag, href: '/dashboard/merchandise/create' },
    { name: 'Review Applications', icon: Users, href: '/dashboard/pitch-applications' },
  ]

  const statCards = [
    { label: 'Total Members', value: stats.totalMembers, icon: Users, change: '+12%', changeLabel: 'vs last 30 days' },
    { label: 'Published Articles', value: stats.publishedArticles, icon: FileText, change: '+8%', changeLabel: 'vs last 30 days' },
    { label: 'Total Magazines', value: stats.totalMagazines, icon: BookOpen, change: '+5%', changeLabel: 'vs last 30 days' },
    { label: 'Active Communities', value: stats.activeCommunities, icon: Building2, change: '+15%', changeLabel: 'vs last 30 days' },
    { label: 'Published Opportunities', value: stats.publishedOpportunities, icon: Calendar, change: '+10%', changeLabel: 'vs last 30 days' },
    { label: 'Active Advertisements', value: stats.activeAdvertisements, icon: ImageIcon, change: '+3%', changeLabel: 'vs last 30 days' },
    { label: 'Website Visitors', value: stats.websiteVisitors.toLocaleString(), icon: Eye, change: '+18%', changeLabel: 'vs last 30 days' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, change: '+22%', changeLabel: 'vs last 30 days' },
  ]

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return { bg: '#dcfce7', text: '#166534' }
      case 'Draft': return { bg: '#fef3c7', text: '#92400e' }
      case 'Pending Review': return { bg: '#dbeafe', text: '#1e40af' }
      case 'Scheduled': return { bg: '#e0e7ff', text: '#3730a3' }
      case 'Archived': return { bg: '#f1f5f9', text: '#475569' }
      default: return { bg: '#f1f5f9', text: '#475569' }
    }
  }

  const filteredContent = recentContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: isDarkMode ? '#0f172a' : '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '14px' }}>Loading overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '24px 32px',
      background: isDarkMode ? '#0f172a' : '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            marginBottom: '4px'
          }}>
            Overview
          </h1>
          <p style={{
            fontSize: '14px',
            color: isDarkMode ? '#94a3b8' : '#64748b'
          }}>
            Here's what's happening across Trendorabay
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: '13px',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontWeight: '500'
          }}>
            {getCurrentDate()}
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: isDarkMode ? '#1e293b' : '#f8fafc',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <Filter style={{ width: '16px', height: '16px', color: '#64748b' }} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          <a
            href="https://trendorabay.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#8b5cf6',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#7c3aed'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8b5cf6'
            }}
          >
            View Website
            <ExternalLink style={{ width: '16px', height: '16px' }} />
          </a>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              background: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '12px',
              padding: '14px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#f5f3ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
              </div>
              {stat.change && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '3px 6px',
                  background: '#dcfce7',
                  borderRadius: '4px'
                }}>
                  <ArrowUp style={{ width: '10px', height: '10px', color: '#166534' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#166534' }}>{stat.change}</span>
                </div>
              )}
            </div>
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              marginBottom: '6px',
              fontWeight: '500'
            }}>
              {stat.label}
            </p>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: isDarkMode ? '#f1f5f9' : '#0f172a',
              marginBottom: '3px'
            }}>
              {stat.value}
            </h3>
            {stat.changeLabel && (
              <p style={{
                fontSize: '10px',
                color: isDarkMode ? '#64748b' : '#94a3b8'
              }}>
                {stat.changeLabel}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '12px',
        padding: '16px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        marginBottom: '32px'
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: isDarkMode ? '#f1f5f9' : '#0f172a',
          marginBottom: '14px'
        }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px'
        }}>
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '14px',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '10px',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = '#8b5cf6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                background: '#f5f3ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <action.icon style={{ width: '15px', height: '15px', color: '#8b5cf6' }} />
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                textAlign: 'center'
              }}>
                {action.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Content */}
      <div style={{
        background: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a'
          }}>
            Recent Content
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              position: 'relative',
              width: '250px'
            }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  fontSize: '13px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  outline: 'none'
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                fontSize: '13px',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
              }}>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Title
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Type
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Author
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Category
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Last Updated
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.length > 0 ? (
                filteredContent.map((item) => {
                  const statusColors = getStatusColor(item.status)
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
                      }}
                    >
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: isDarkMode ? '#f1f5f9' : '#0f172a',
                        fontWeight: '500'
                      }}>
                        {item.title}
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: isDarkMode ? '#94a3b8' : '#64748b'
                      }}>
                        {item.type}
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: isDarkMode ? '#94a3b8' : '#64748b'
                      }}>
                        {item.author}
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: isDarkMode ? '#94a3b8' : '#64748b'
                      }}>
                        {item.category}
                      </td>
                      <td style={{
                        padding: '12px'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          background: statusColors.bg,
                          color: statusColors.text,
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px',
                        fontSize: '13px',
                        color: isDarkMode ? '#94a3b8' : '#64748b'
                      }}>
                        {item.lastUpdated}
                      </td>
                      <td style={{
                        padding: '12px'
                      }}>
                        <button style={{
                          padding: '6px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}>
                          <MoreHorizontal style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{
                    padding: '32px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                  }}>
                    No content found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Tasks and Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Pending Tasks */}
        <div style={{
          background: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '16px',
          padding: '24px',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            marginBottom: '20px'
          }}>
            Pending Tasks
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: '#fef3c7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock style={{ width: '18px', height: '18px', color: '#92400e' }} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isDarkMode ? '#f1f5f9' : '#0f172a',
                        marginBottom: '2px'
                      }}>
                        {task.type}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#94a3b8' : '#64748b'
                      }}>
                        {task.count} awaiting review
                      </p>
                    </div>
                  </div>
                  <button style={{
                    padding: '8px 12px',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#7c3aed'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#8b5cf6'
                  }}>
                    {task.action}
                  </button>
                </div>
              ))
            ) : (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                fontSize: '13px',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                <CheckCircle style={{
                  width: '48px',
                  height: '48px',
                  color: '#10b981',
                  marginBottom: '12px',
                  margin: '0 auto 12px'
                }} />
                No pending tasks
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '16px',
          padding: '24px',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            marginBottom: '20px'
          }}>
            Recent Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: '#f5f3ff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <activity.icon style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: isDarkMode ? '#f1f5f9' : '#0f172a',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {activity.description}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: isDarkMode ? '#94a3b8' : '#64748b'
                    }}>
                      by {activity.user}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: isDarkMode ? '#64748b' : '#94a3b8',
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}>
                    {activity.time}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                fontSize: '13px',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Homepage Overview */}
      <div style={{
        background: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '16px',
        padding: '24px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a'
          }}>
            Homepage Overview
          </h2>
          <a
            href="/dashboard/homepage"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#8b5cf6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#7c3aed'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8b5cf6'
            }}
          >
            Manage Homepage
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            padding: '16px',
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Featured Story
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f1f5f9' : '#0f172a'
            }}>
              {homepageData.featuredStory || 'Not set'}
            </p>
          </div>

          <div style={{
            padding: '16px',
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Latest Magazines
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f1f5f9' : '#0f172a'
            }}>
              {homepageData.latestMagazines.length > 0
                ? homepageData.latestMagazines.join(', ')
                : 'None'}
            </p>
          </div>

          <div style={{
            padding: '16px',
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Featured Stories
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f1f5f9' : '#0f172a'
            }}>
              {homepageData.featuredStoriesCount} stories
            </p>
          </div>

          <div style={{
            padding: '16px',
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Active Ads
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f1f5f9' : '#0f172a'
            }}>
              {homepageData.activeAds} active
            </p>
          </div>

          <div style={{
            padding: '16px',
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }}>
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Last Update
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#f1f5f9' : '#0f172a'
            }}>
              {homepageData.lastUpdate || 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Website Performance */}
      <div style={{
        background: isDarkMode ? '#1e293b' : 'white',
        borderRadius: '12px',
        padding: '16px',
        border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a'
          }}>
            Website Performance
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div>
              <p style={{
                fontSize: '11px',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                marginBottom: '2px'
              }}>
                Total Page Views
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: '700',
                color: isDarkMode ? '#f1f5f9' : '#0f172a'
              }}>
                {analyticsMetrics.totalPageViews.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '11px',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                marginBottom: '2px'
              }}>
                Unique Visitors
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: '700',
                color: isDarkMode ? '#f1f5f9' : '#0f172a'
              }}>
                {analyticsMetrics.uniqueVisitors.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '11px',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                marginBottom: '2px'
              }}>
                Avg Engagement Time
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: '700',
                color: isDarkMode ? '#f1f5f9' : '#0f172a'
              }}>
                {analyticsMetrics.avgEngagementTime}
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
              <XAxis
                dataKey="date"
                stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
              />
              <YAxis
                stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
              />
              <Tooltip
                contentStyle={{
                  background: isDarkMode ? '#1e293b' : 'white',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '12px',
          padding: '16px',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            marginBottom: '14px'
          }}>
            Revenue Overview
          </h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey="month"
                  stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                />
                <YAxis
                  stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: isDarkMode ? '#1e293b' : 'white',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          background: isDarkMode ? '#1e293b' : 'white',
          borderRadius: '12px',
          padding: '16px',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            marginBottom: '14px'
          }}>
            Revenue by Source
          </h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: isDarkMode ? '#1e293b' : 'white',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '12px'
          }}>
            {revenueBreakdown.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color
                }} />
                <span style={{
                  fontSize: '11px',
                  color: isDarkMode ? '#94a3b8' : '#64748b'
                }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
