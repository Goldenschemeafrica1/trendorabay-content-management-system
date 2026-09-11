import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Filter, RefreshCw, CheckCircle, XCircle, FileText } from 'lucide-react';
import api from '../services/api';

const CspViolations = () => {
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('violations');
  const [filters, setFilters] = useState({
    severity: '',
    resolved: '',
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
      const [violationsData, statsData] = await Promise.all([
        api.getCspViolations(filters),
        api.getCspStats(30)
      ]);
      setViolations(violationsData.violations || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    const notes = prompt('Add notes for resolution (optional):');
    if (notes === null) return; // User cancelled

    try {
      await api.resolveCspViolation(id, notes);
      loadData();
    } catch (err) {
      alert('Failed to resolve violation: ' + err.message);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: { bg: '#fef2f2', text: '#dc2626', icon: AlertTriangle },
      medium: { bg: '#fffbeb', text: '#d97706', icon: AlertTriangle },
      low: { bg: '#f0fdf4', text: '#16a34a', icon: Shield }
    };
    return colors[severity] || colors.low;
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
            CSP Violations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor Content Security Policy violations</p>
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

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-color)' }}>
        <nav style={{ display: 'flex', gap: '32px' }}>
          {['violations', 'stats'].map((tab) => (
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

      {/* Violations Tab */}
      {activeTab === 'violations' && (
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
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</label>
                <select
                  value={filters.resolved}
                  onChange={(e) => setFilters({ ...filters, resolved: e.target.value })}
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
                  <option value="">All Status</option>
                  <option value="false">Unresolved</option>
                  <option value="true">Resolved</option>
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

          {/* Violations Table */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden' 
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                <Shield style={{ width: '20px', height: '20px', color: 'var(--primary-color)', marginRight: '8px' }} />
                Violations ({violations.length})
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Directive</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Blocked URI</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--bg-primary)' }}>
                  {violations.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No CSP violations found
                      </td>
                    </tr>
                  ) : (
                    violations.map((violation) => {
                      const severityStyle = getSeverityColor(violation.severity);
                      return (
                        <tr key={violation.id} style={{ borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                        }}>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: 'var(--text-primary)' }}>
                            {new Date(violation.reported_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 24px', fontSize: '14px', color: 'var(--text-primary)' }}>
                            {violation.violated_directive}
                          </td>
                          <td style={{ padding: '12px 24px', fontSize: '14px', color: 'var(--text-primary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {violation.blocked_uri}
                          </td>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                            <span style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px 8px', 
                              fontSize: '12px', 
                              fontWeight: '500', 
                              borderRadius: '9999px',
                              backgroundColor: severityStyle.bg,
                              color: severityStyle.text
                            }}>
                              <severityStyle.icon style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                              {violation.severity}
                            </span>
                          </td>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                            {violation.resolved ? (
                              <span style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px 8px', 
                                fontSize: '12px', 
                                fontWeight: '500', 
                                borderRadius: '9999px',
                                backgroundColor: '#f0fdf4',
                                color: '#16a34a'
                              }}>
                                <CheckCircle style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                                Resolved
                              </span>
                            ) : (
                              <span style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px 8px', 
                                fontSize: '12px', 
                                fontWeight: '500', 
                                borderRadius: '9999px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626'
                              }}>
                                <XCircle style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                                Unresolved
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                            {!violation.resolved && (
                              <button
                                onClick={() => handleResolve(violation.id)}
                                style={{
                                  padding: '4px 8px',
                                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                Resolve
                              </button>
                            )}
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
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>Total Violations</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>{stats.total_violations || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>High Severity</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#dc2626' }}>{stats.by_severity?.high || 0}</p>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>Unresolved</p>
              <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#d97706' }}>{stats.resolved_status?.unresolved || 0}</p>
            </div>
          </div>

          {/* Violations by Directive */}
          {stats.by_directive && stats.by_directive.length > 0 && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <FileText style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Violations by Directive
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.by_directive.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#111827' }}>{item.violated_directive}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Blocked URIs */}
          {stats.top_blocked_uris && stats.top_blocked_uris.length > 0 && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '24px' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: '#7c3aed', marginRight: '8px' }} />
                Top Blocked URIs
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.top_blocked_uris.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#111827', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.blocked_uri}</span>
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

export default CspViolations;
