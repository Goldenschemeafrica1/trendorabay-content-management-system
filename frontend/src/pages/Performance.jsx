import { useState } from 'react'
import { BarChart3, TrendingUp, Eye, Clock, ArrowUpRight, ArrowDownRight, FileText, Radio, BookOpen, Users } from 'lucide-react'

const performanceData = [
  { type: 'Stories', views: 45200, engagement: 8.5, avgTime: '4:32', growth: 12.3 },
  { type: 'Magazines', views: 28500, engagement: 6.8, avgTime: '5:15', growth: 8.7 },
  { type: 'Podcasts', views: 19800, engagement: 12.2, avgTime: '18:45', growth: 15.4 },
  { type: 'Authors', views: 12500, engagement: 5.4, avgTime: '2:18', growth: 6.2 },
  { type: 'Community', views: 8900, engagement: 9.1, avgTime: '3:45', growth: 18.9 },
]

const topPerforming = [
  { title: 'Breaking: Tech Innovation Story', type: 'Story', views: 8450, engagement: 14.2, date: 'Jan 7' },
  { title: 'January Magazine Issue', type: 'Magazine', views: 6200, engagement: 9.8, date: 'Jan 5' },
  { title: 'Podcast: Future of AI', type: 'Podcast', views: 5100, engagement: 18.5, date: 'Jan 6' },
  { title: 'Author Spotlight Series', type: 'Story', views: 4200, engagement: 11.3, date: 'Jan 4' },
  { title: 'Community Event Announcement', type: 'Post', views: 3800, engagement: 15.7, date: 'Jan 7' },
]

export default function Performance() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedTab, setSelectedTab] = useState('overview')

  const totalViews = performanceData.reduce((sum, d) => sum + d.views, 0)
  const avgEngagement = (performanceData.reduce((sum, d) => sum + d.engagement, 0) / performanceData.length).toFixed(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Content Performance</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Track content metrics and performance analytics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '8px 12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            outline: 'none',
            fontSize: '13px',
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
          }}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
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
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
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
              +14.2%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalViews.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Views</p>
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
              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#9333ea' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +8.5%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{avgEngagement}%</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Avg. Engagement</p>
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
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Clock style={{ width: '16px', height: '16px', color: '#d97706' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +6.8%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>6:55</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Avg. Time on Site</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setSelectedTab('overview')}
          style={{
            padding: '8px 16px',
            background: selectedTab === 'overview' ? '#7c3aed' : 'transparent',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            color: selectedTab === 'overview' ? 'white' : '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedTab !== 'overview') {
              e.currentTarget.style.background = '#f1f5f9'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTab !== 'overview') {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('top')}
          style={{
            padding: '8px 16px',
            background: selectedTab === 'top' ? '#7c3aed' : 'transparent',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            color: selectedTab === 'top' ? 'white' : '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedTab !== 'top') {
              e.currentTarget.style.background = '#f1f5f9'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTab !== 'top') {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          Top Content
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Content Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Views</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Engagement</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Avg. Time</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Growth</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{item.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.views.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '16px', 
                      fontSize: '11px', 
                      fontWeight: '500',
                      background: item.engagement >= 10 ? '#dcfce7' : item.engagement >= 7 ? '#fef3c7' : '#fee2e2',
                      color: item.engagement >= 10 ? '#166534' : item.engagement >= 7 ? '#92400e' : '#991b1b'
                    }}>
                      {item.engagement}%
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.avgTime}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#16a34a' }}>
                      <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                      {item.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTab === 'top' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Content</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Views</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Engagement</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {topPerforming.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{item.title}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '16px', 
                      fontSize: '11px', 
                      fontWeight: '500',
                      background: '#f1f5f9',
                      color: '#475569'
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.views.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '16px', 
                      fontSize: '11px', 
                      fontWeight: '500',
                      background: item.engagement >= 15 ? '#dcfce7' : item.engagement >= 10 ? '#fef3c7' : '#fee2e2',
                      color: item.engagement >= 15 ? '#166534' : item.engagement >= 10 ? '#92400e' : '#991b1b'
                    }}>
                      {item.engagement}%
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
