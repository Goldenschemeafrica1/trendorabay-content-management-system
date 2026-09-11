import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Lock, Eye, Activity, TrendingUp } from 'lucide-react';
import api from '../services/api';

const SecurityDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const user = api.getCurrentUser();

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      setError('Access denied. Superadmin role required.');
      setLoading(false);
      return;
    }

    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [summaryData, statsData] = await Promise.all([
        api.getSecuritySummary(),
        api.getSecurityStats(7)
      ]);
      setSummary(summaryData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return { bg: '#fef2f2', text: '#dc2626' };
      case 'high': return { bg: '#fff7ed', text: '#ea580c' };
      case 'medium': return { bg: '#fefce8', text: '#ca8a04' };
      case 'low': return { bg: '#f0fdf4', text: '#16a34a' };
      default: return { bg: '#f8fafc', text: '#64748b' };
    }
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      'AUTH_FAILED': 'Failed Authentication',
      'AUTH_SUCCESS': 'Successful Authentication',
      'UNAUTHORIZED_ACCESS': 'Unauthorized Access',
      'SUSPICIOUS_ACTIVITY': 'Suspicious Activity',
      'MALICIOUS_INPUT': 'Malicious Input Detected',
      'RATE_LIMIT_BREACH': 'Rate Limit Breach',
      'PRIVILEGE_ESCALATION': 'Privilege Escalation',
      'DATA_BREACH_ATTEMPT': 'Data Breach Attempt',
      'ACCOUNT_LOCKED': 'Account Locked',
      'PASSWORD_RESET': 'Password Reset'
    };
    return labels[eventType] || eventType;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '3px solid #e2e8f0', 
          borderTopColor: '#7c3aed', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: '#fef2f2', 
        border: '1px solid #fecaca', 
        borderRadius: '8px', 
        padding: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626', marginRight: '8px' }} />
          <p style={{ color: '#991b1b' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Security Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor security events and system threats</p>
        </div>
        <button
          onClick={loadSecurityData}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
          }}
        >
          <Activity style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-color)' }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          {['summary', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 4px',
                borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'capitalize',
                color: activeTab === tab ? '#7c3aed' : 'var(--text-secondary)',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Last 24 Hours */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <Activity style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
              Last 24 Hours
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '8px' }}>Total Events</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{summary.last_24h?.total_events || 0}</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500', marginBottom: '8px' }}>Critical Events</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#dc2626' }}>{summary.last_24h?.critical_events || 0}</p>
              </div>
            </div>
          </div>

          {/* Last 7 Days */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '24px' 
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
              Last 7 Days
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '8px' }}>Total Events</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{summary.last_7d?.total_events || 0}</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '14px', color: '#ea580c', fontWeight: '500', marginBottom: '8px' }}>Failed Logins</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#ea580c' }}>{summary.last_7d?.failed_authentications || 0}</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '14px', color: '#ca8a04', fontWeight: '500', marginBottom: '8px' }}>Unauthorized Access</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#ca8a04' }}>{summary.last_7d?.unauthorized_access || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top IPs */}
          {stats.top_ips && stats.top_ips.length > 0 && (
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <Eye style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Top IP Addresses by Event Count
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.top_ips.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{item.ip_address}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.count} events</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Authentications */}
          {stats.failed_authentications && stats.failed_authentications.length > 0 && (
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Users with Most Failed Logins
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.failed_authentications.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.user_email}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>{item.count} failures</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Counts by Type */}
          {stats.event_counts && stats.event_counts.length > 0 && (
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <Shield style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Events by Type
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.event_counts.map((item, index) => {
                  const colors = getSeverityColor(item.severity);
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{getEventTypeLabel(item.event_type)}</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          borderRadius: '9999px', 
                          marginRight: '8px',
                          backgroundColor: colors.bg,
                          color: colors.text
                        }}>
                          {item.severity}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
