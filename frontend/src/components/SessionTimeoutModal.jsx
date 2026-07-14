import { Clock, LogOut } from 'lucide-react';

export default function SessionTimeoutModal({ timeRemaining, onExtend, onLogout }) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Clock style={{ width: '32px', height: '32px', color: '#d97706' }} />
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '8px'
        }}>
          Session Timeout Warning
        </h2>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          You've been inactive for a while. Your session will expire in:
        </p>

        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#d97706',
          marginBottom: '8px',
          fontFamily: 'monospace'
        }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <p style={{
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '24px'
        }}>
          minutes remaining
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onExtend}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
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
            Stay Logged In
          </button>

          <button
            onClick={onLogout}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#64748b',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
