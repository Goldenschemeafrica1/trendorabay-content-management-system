import { useState } from 'react'
import { Save, Mail, Plus, Edit, Trash2, FileText } from 'lucide-react'

const templates = [
  { id: 1, name: 'Welcome Email', subject: 'Welcome to Our Platform', type: 'user', lastModified: '2024-01-07' },
  { id: 2, name: 'Order Confirmation', subject: 'Your Order Has Been Confirmed', type: 'order', lastModified: '2024-01-06' },
  { id: 3, name: 'Password Reset', subject: 'Reset Your Password', type: 'user', lastModified: '2024-01-05' },
  { id: 4, name: 'Subscription Renewal', subject: 'Your Subscription Has Been Renewed', type: 'subscription', lastModified: '2024-01-04' },
  { id: 5, name: 'Newsletter', subject: 'Weekly Newsletter', type: 'newsletter', lastModified: '2024-01-03' },
]

export default function EmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template)
    setSubject(template.subject)
    setContent(`Dear [User Name],\n\nThank you for ${template.name}.\n\nBest regards,\nThe Team`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Email Templates</h1>
          <p style={{ color: '#64748b', marginTop: '2px', fontSize: '13px' }}>Manage email templates for automated communications</p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
        }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          New Template
        </button>
      </div>

      {/* Templates List */}
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
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Template</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Last Modified</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template, index) => (
              <tr key={template.id || `template-${index}`} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              onClick={() => handleSelectTemplate(template)}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '500', color: '#0f172a', fontSize: '13px' }}>{template.name}</span>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>{template.subject}</span>
                  </div>
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
                    {template.type}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{template.lastModified}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation()
                      e.currentTarget.style.background = '#f1f5f9'
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation()
                      e.currentTarget.style.background = 'transparent'
                    }}>
                      <Edit style={{ width: '14px', height: '14px', color: '#64748b' }} />
                    </button>
                    <button style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation()
                      e.currentTarget.style.background = '#fef2f2'
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation()
                      e.currentTarget.style.background = 'transparent'
                    }}>
                      <Trash2 style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Template Editor */}
      {selectedTemplate && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '20px', height: '20px' }} />
              Edit: {selectedTemplate.name}
            </h3>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              Save
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '13px',
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
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '13px',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  fontFamily: 'monospace'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Available variables: [User Name], [Email], [Order ID], [Subscription Date]</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
