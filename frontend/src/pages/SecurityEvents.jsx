import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Filter, RefreshCw } from 'lucide-react';
import api from '../services/api';

const SecurityEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    event_type: '',
    severity: '',
    limit: 100
  });

  const user = api.getCurrentUser();

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      setError('Access denied. Superadmin role required.');
      setLoading(false);
      return;
    }

    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getSecurityEvents(filters);
      setEvents(data.data || []);
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
            Security Events
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>View and filter security event logs</p>
        </div>
        <button
          onClick={loadEvents}
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
          <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        backgroundColor: 'var(--bg-primary)', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Filter style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Filters</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>Event Type</label>
            <select
              value={filters.event_type}
              onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <option value="">All Types</option>
              <option value="AUTH_FAILED">Failed Authentication</option>
              <option value="AUTH_SUCCESS">Successful Authentication</option>
              <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
              <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
              <option value="MALICIOUS_INPUT">Malicious Input</option>
              <option value="RATE_LIMIT_BREACH">Rate Limit Breach</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div style={{ 
        backgroundColor: 'var(--bg-primary)', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden' 
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
            <Shield style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
            Security Events ({events.length})
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Event Type</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IP Address</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Endpoint</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Method</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--bg-primary)' }}>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No security events found
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const colors = getSeverityColor(event.severity);
                  return (
                    <tr key={event.id} style={{ borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }} onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    }}>
                      <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {getEventTypeLabel(event.event_type)}
                      </td>
                      <td style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          borderRadius: '9999px',
                          backgroundColor: colors.bg,
                          color: colors.text
                        }}>
                          {event.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {event.user_email || '-'}
                      </td>
                      <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {event.ip_address || '-'}
                      </td>
                      <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {event.endpoint || '-'}
                      </td>
                      <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {event.method || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityEvents;
