import { useState, useEffect } from 'react';
import { FileText, Filter, RefreshCw, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('logs');
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    limit: 100
  });

  const user = api.getCurrentUser();

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      setError('Access denied. Superadmin role required.');
      setLoading(false);
      return;
    }

    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, statsData] = await Promise.all([
        api.getAuditLogs(filters),
        api.getAuditStats(30)
      ]);
      setLogs(logsData.data || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' 
      ? { bg: '#f0fdf4', text: '#16a34a', icon: CheckCircle }
      : { bg: '#fef2f2', text: '#dc2626', icon: XCircle };
  };

  const getActionLabel = (action) => {
    const labels = {
      'USER_CREATED': 'User Created',
      'USER_DELETED': 'User Deleted',
      'USER_ROLE_CHANGED': 'Role Changed',
      'STORY_DELETED': 'Story Deleted',
      'SETTING_UPDATED': 'Setting Updated',
      'MEDIA_DELETED': 'Media Deleted'
    };
    return labels[action] || action;
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
        <p style={{ color: '#991b1b' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Audit Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>View system audit trail and activity logs</p>
        </div>
        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-color)' }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          {['logs', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 4px',
                borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'capitalize',
                color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
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

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Filters */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Filter style={{ width: '20px', height: '20px', color: 'var(--primary-color)', marginRight: '8px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Filters</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
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
                  <option value="">All Actions</option>
                  <option value="USER_CREATED">User Created</option>
                  <option value="USER_DELETED">User Deleted</option>
                  <option value="USER_ROLE_CHANGED">Role Changed</option>
                  <option value="STORY_DELETED">Story Deleted</option>
                  <option value="SETTING_UPDATED">Setting Updated</option>
                  <option value="MEDIA_DELETED">Media Deleted</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>Entity Type</label>
                <select
                  value={filters.entity_type}
                  onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
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
                  <option value="">All Entities</option>
                  <option value="user">User</option>
                  <option value="story">Story</option>
                  <option value="setting">Setting</option>
                  <option value="media">Media</option>
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

          {/* Logs Table */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden' 
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                <FileText style={{ width: '20px', height: '20px', color: 'var(--primary-color)', marginRight: '8px' }} />
                Audit Logs ({logs.length})
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Entity</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--bg-primary)' }}>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const statusStyle = getStatusColor(log.status);
                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                        }}>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                            {getActionLabel(log.action)}
                          </td>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                            {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}
                          </td>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                            {log.user_email || '-'}
                          </td>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                            <span style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px 8px', 
                              fontSize: '12px', 
                              fontWeight: '500', 
                              borderRadius: '9999px',
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text
                            }}>
                              <statusStyle.icon style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                              {log.status}
                            </span>
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
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>Total Actions</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{stats.total_actions || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>Failures</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#dc2626' }}>{stats.failure_count || 0}</p>
            </div>
          </div>

          {/* Top Users */}
          {stats.top_users && stats.top_users.length > 0 && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <User style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Most Active Users
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.top_users.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#111827' }}>{item.user_email}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.count} actions</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entity Counts */}
          {stats.entity_counts && stats.entity_counts.length > 0 && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <FileText style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Actions by Entity Type
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.entity_counts.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#111827', textTransform: 'capitalize' }}>{item.entity_type}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Counts */}
          {stats.action_counts && stats.action_counts.length > 0 && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <Clock style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Actions by Type
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.action_counts.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#111827' }}>{getActionLabel(item.action)}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
