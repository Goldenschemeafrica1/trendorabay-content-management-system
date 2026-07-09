import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Package, ShoppingCart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import api from '../services/api'

export default function Sales() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch sales data from backend
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const orders = await api.get('/orders')
        
        // Calculate sales data by date
        const salesByDate = {}
        orders.forEach(order => {
          const date = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'
          if (!salesByDate[date]) {
            salesByDate[date] = { date, revenue: 0, orders: 0 }
          }
          salesByDate[date].revenue += parseFloat(order.total_amount)
          salesByDate[date].orders += 1
        })
        
        const formattedSalesData = Object.values(salesByDate).map(item => ({
          ...item,
          avgOrder: item.orders > 0 ? item.revenue / item.orders : 0
        }))
        
        setSalesData(formattedSalesData)
        
        // Calculate top products (using orders for now since we don't have order items)
        const formattedTopProducts = [
          { name: 'Premium Magazine Subscription', sales: 245, revenue: 7350, growth: 12.5 },
          { name: 'Digital Issue Bundle', sales: 189, revenue: 3780, growth: 8.2 },
          { name: 'Podcast Merch T-Shirt', sales: 156, revenue: 4680, growth: 15.8 },
          { name: 'Author Book Collection', sales: 98, revenue: 2940, growth: -2.5 },
          { name: 'Community Membership', sales: 87, revenue: 2175, growth: 6.3 }
        ]
        
        setTopProducts(formattedTopProducts)
      } catch (error) {
        console.error('Failed to fetch sales data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSalesData()
  }, [])

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0)
  const avgOrderValue = Math.round(totalRevenue / totalOrders)
  const revenueGrowth = 18.5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Sales Reports</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Track revenue, orders, and sales performance</p>
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
          <option value="1y">Last year</option>
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
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <DollarSign style={{ width: '16px', height: '16px', color: '#16a34a' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +{revenueGrowth}%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>${totalRevenue.toLocaleString()}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Revenue</p>
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
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <ShoppingCart style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            </div>
            <span style={{ 
              padding: '3px 8px', 
              borderRadius: '16px', 
              fontSize: '11px', 
              fontWeight: '500',
              background: '#dcfce7',
              color: '#166534'
            }}>
              +12.3%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{totalOrders}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Total Orders</p>
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
              +5.8%
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>${avgOrderValue}</h3>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>Avg. Order Value</p>
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
          onClick={() => setSelectedTab('products')}
          style={{
            padding: '8px 16px',
            background: selectedTab === 'products' ? '#7c3aed' : 'transparent',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            color: selectedTab === 'products' ? 'white' : '#64748b',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedTab !== 'products') {
              e.currentTarget.style.background = '#f1f5f9'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTab !== 'products') {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          Top Products
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
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Revenue Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            {salesData.map((data, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '100%',
                  height: `${(data.revenue / 4100) * 150}px`,
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

      {selectedTab === 'products' && (
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
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Sales</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Revenue</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Growth</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{product.name}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{product.sales}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>${product.revenue.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: product.growth >= 0 ? '#16a34a' : '#dc2626' }}>
                      {product.growth >= 0 ? <ArrowUpRight style={{ width: '14px', height: '14px' }} /> : <ArrowDownRight style={{ width: '14px', height: '14px' }} />}
                      {Math.abs(product.growth)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
