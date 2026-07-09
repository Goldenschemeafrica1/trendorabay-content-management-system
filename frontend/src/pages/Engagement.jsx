import { useState } from 'react'
import { Users, MessageCircle, Heart, Share2, Clock, TrendingUp, Award } from 'lucide-react'

const engagementData = [
  { date: 'Jan 1', likes: 450, comments: 120, shares: 35 },
  { date: 'Jan 2', likes: 520, comments: 145, shares: 42 },
  { date: 'Jan 3', likes: 480, comments: 135, shares: 38 },
  { date: 'Jan 4', likes: 590, comments: 165, shares: 55 },
  { date: 'Jan 5', likes: 680, comments: 190, shares: 62 },
  { date: 'Jan 6', likes: 720, comments: 210, shares: 70 },
  { date: 'Jan 7', likes: 690, comments: 195, shares: 65 },
]

const topContent = [
  { title: 'Latest Magazine Issue', type: 'Magazine', likes: 2850, comments: 420, shares: 180 },
  { title: 'Podcast Episode #45', type: 'Podcast', likes: 1920, comments: 310, shares: 145 },
  { title: 'Breaking News Story', type: 'Story', likes: 1650, comments: 280, shares: 120 },
  { title: 'Author Interview', type: 'Story', likes: 1420, comments: 195, shares: 98 },
  { title: 'Community Event Post', type: 'Post', likes: 980, comments: 165, shares: 75 },
]

export default function Engagement() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedTab, setSelectedTab] = useState('overview')

  const totalLikes = engagementData.reduce((sum, d) => sum + d.likes, 0)
  const totalComments = engagementData.reduce((sum, d) => sum + d.comments, 0)
  const totalShares = engagementData.reduce((sum, d) => sum + d.shares, 0)
  const engagementRate = 8.5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>User Engagement</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Track user interactions and engagement metrics</p>
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
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Heart style={{ width: '16px', height: '16px', color: '#dc2626' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +15.2%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalLikes.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Likes</p>
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
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <MessageCircle style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +12.8%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalComments.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Comments</p>
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
              <Share2 style={{ width: '16px', height: '16px', color: '#d97706' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +18.5%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalShares.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Shares</p>
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
              +5.3%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{engagementRate}%</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Engagement Rate</p>
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
          onClick={() => setSelectedTab('content')}
          style={{
            padding: '8px 16px',
            background: selectedTab === 'content' ? '#7c3aed' : 'transparent',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            color: selectedTab === 'content' ? 'white' : '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedTab !== 'content') {
              e.currentTarget.style.background = '#f1f5f9'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTab !== 'content') {
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
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Engagement Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            {engagementData.map((data, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '100%',
                  height: `${(data.likes / 720) * 150}px`,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }} />
                <span style={{ fontSize: '11px', color: '#64748b' }}>{data.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'content' && (
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
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Likes</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Comments</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Shares</th>
              </tr>
            </thead>
            <tbody>
              {topContent.map((content, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{content.title}</span>
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
                      {content.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{content.likes.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{content.comments.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{content.shares.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
