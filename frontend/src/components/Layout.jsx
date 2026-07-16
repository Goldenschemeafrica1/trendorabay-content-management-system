import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Mic,
  Users,
  Image as ImageIcon,
  ShoppingBag,
  Package,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Search,
  TrendingUp,
  Heart,
  DollarSign,
  BarChart3,
  UserPlus,
  Calendar,
  MessageCircle,
  Home,
  File,
  Users as TeamIcon,
  Mail,
  Building2,
  Award,
  CreditCard,
  Users as SubscribersIcon,
  Cog,
  Folder,
  Globe,
  Mail as MailIcon,
  Smartphone,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  UserCheck,
  Lightbulb,
  Inbox
} from 'lucide-react'
import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useIdleTimeout } from '../hooks/useIdleTimeout'
import SessionTimeoutModal from './SessionTimeoutModal'
import api from '../services/api'

// Create context for header visibility control
export const HeaderVisibilityContext = createContext({
  hideHeader: false,
  setHideHeader: () => {}
})

// Create context for sidebar visibility control
export const SidebarVisibilityContext = createContext({
  hideSidebar: false,
  setHideSidebar: () => {}
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { section: 'Content' },
  { name: 'Stories', href: '/dashboard/stories', icon: FileText },
  { name: 'Magazines', href: '/dashboard/magazines', icon: BookOpen },
  { name: 'Podcasts', href: '/dashboard/podcasts', icon: Mic },
  { name: 'Podcast Hosts', href: '/dashboard/podcast-hosts', icon: UserIcon },
  { name: 'Podcast Guests', href: '/dashboard/podcast-guests', icon: UserCheck },
  { name: 'Guest Applications', href: '/dashboard/guest-applications', icon: UserCheck },
  { name: 'Pitch Submissions', href: '/dashboard/pitch-submissions', icon: Lightbulb },
  { name: 'Authors', href: '/dashboard/authors', icon: Users },
  { name: 'User Management', href: '/dashboard/users', icon: Users },
  { name: 'Media Library', href: '/dashboard/media', icon: ImageIcon },
  { section: 'Store' },
  { name: 'Products', href: '/dashboard/merchandise', icon: ShoppingBag },
  { name: 'Orders', href: '/dashboard/orders', icon: Package },
  { section: 'Analytics' },
  { folder: 'Analytics', icon: TrendingUp, items: [
    { name: 'Traffic', href: '/dashboard/analytics', icon: TrendingUp },
    { name: 'Engagement', href: '/dashboard/engagement', icon: Heart },
    { name: 'Sales', href: '/dashboard/sales', icon: DollarSign },
    { name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
  ]},
  { section: 'Community' },
  { name: 'Contributors', href: '/dashboard/contributors', icon: UserPlus },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Community Hub', href: '/dashboard/community', icon: MessageCircle },
  { section: 'Pages' },
  { name: 'Homepage', href: '/dashboard/homepage', icon: Home },
  { name: 'PodcastPage', href: '/dashboard/podcast', icon: File },
  { name: 'Store', href: '/dashboard/store', icon: ShoppingBag },
  { name: 'Mission', href: '/dashboard/mission', icon: File },
  { name: 'Team', href: '/dashboard/team', icon: TeamIcon },
  { name: 'Gallery', href: '/dashboard/gallery', icon: ImageIcon },
  { name: 'Contact Messages', href: '/dashboard/contact-messages', icon: Inbox },
  { section: 'Advertisers' },
  { name: 'Partners', href: '/dashboard/partners', icon: Building2 },
  { name: 'Partners Inquiry', href: '/dashboard/partnership-inquiries', icon: Mail },
  { name: 'Sponsorships', href: '/dashboard/sponsorships', icon: Award },
  { name: 'Advertisements', href: '/dashboard/advertisements', icon: ImageIcon },
  { name: 'Ad Inquiries', href: '/dashboard/advertisement-inquiries', icon: Mail },
  { section: 'Subscriptions' },
  { name: 'Plans', href: '/dashboard/plans', icon: CreditCard },
  { name: 'Subscribers', href: '/dashboard/subscribers', icon: SubscribersIcon },
  { section: 'Settings' },
  { name: 'Categories', href: '/dashboard/categories', icon: Folder },
  { name: 'Email Templates', href: '/dashboard/email-templates', icon: MailIcon },
]

function HeaderContent({ userInitial, userName, userEmail, profileDropdownOpen, setProfileDropdownOpen, profileRef, handleLogout, hideHeader }) {
  if (hideHeader) return null
  
  return (
    <header style={{
      height: '80px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button style={{
          position: 'relative',
          padding: '10px',
          background: 'transparent',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.boxShadow = 'none'
        }}>
          <Bell style={{ width: '20px', height: '20px', color: '#64748b' }} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%'
          }}></span>
        </button>
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
            }}>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{userInitial}</span>
            </div>
          </div>
          {profileDropdownOpen && (
            <div style={{
              position: 'fixed',
              top: '72px',
              right: '32px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0',
              minWidth: '220px',
              zIndex: 10000
            }}>
              <div style={{ padding: '8px 0' }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: '8px'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{userName}</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{userEmail}</p>
                </div>
                <div 
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '14px', color: '#475569' }}>Profile</span>
                </div>
                <div 
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '14px', color: '#475569' }}>Settings</span>
                </div>
                <div 
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderTop: '1px solid #e2e8f0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(254, 226, 226, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={handleLogout}
                >
                  <LogOut style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                  <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileRef = useRef(null)
  const [expandedSections, setExpandedSections] = useState({
    analytics: true,
    traffic: true
  })
  const [hideHeader, setHideHeader] = useState(false)
  const [hideSidebar, setHideSidebar] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Get user data from localStorage and set state to trigger re-render
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    const userData = userStr ? JSON.parse(userStr) : null
    setCurrentUser(userData)
  }, [])

  const user = currentUser
  const userName = user?.name || 'Admin User'
  const userEmail = user?.email || 'admin@cms.com'
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'A'
  const userRole = user?.role || 'user'

  const handleLogout = () => {
    api.logout()
  }

  // Handle idle timeout
  const handleTimeout = () => {
    handleLogout()
  }

  const { showWarning, timeRemaining, extendSession } = useIdleTimeout(
    handleTimeout,
    () => console.log('Session timeout warning triggered')
  )

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Session Timeout Modal */}
      {showWarning && (
        <SessionTimeoutModal
          timeRemaining={timeRemaining}
          onExtend={extendSession}
          onLogout={handleLogout}
        />
      )}

      {/* Sidebar */}
      {!hideSidebar && (
      <aside 
        style={{
          width: sidebarCollapsed ? '80px' : '288px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Logo */}
        <div style={{ 
          height: '80px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <img 
              src="/logoo.png" 
              alt="Logo" 
              style={{ 
                width: '220px', 
                height: '220px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navigation.filter(item => {
            // Hide User Management for contributors and users (only admin/superadmin can see it)
            if (item.name === 'User Management' && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor')) {
              return false
            }
            // Hide Authors for contributors and users (only editor/admin/superadmin can see it)
            if (item.name === 'Authors' && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            // Hide Media Library for non-superadmin users (only superadmin can see it)
            if (item.name === 'Media Library' && (!userRole || userRole !== 'superadmin')) {
              return false
            }
            // Hide Store section and Products/Orders for contributors and users
            if ((item.name === 'Products' || item.name === 'Orders' || item.section === 'Store') && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            // Hide Analytics section for non-superadmin users
            if ((item.name === 'Traffic' || item.section === 'Analytics' || item.folder === 'Analytics') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
              return false
            }
            // Hide Community section for contributors and users
            if ((item.name === 'Contributors' || item.name === 'Events' || item.name === 'Community Hub' || item.section === 'Community') && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            // Hide Pages section for contributors and users
            if ((item.name === 'Homepage' || item.name === 'PodcastPage' || item.name === 'Store' || item.name === 'Mission' || item.name === 'Team' || item.name === 'Contact Messages' || item.section === 'Pages') && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            // Hide Advertisers section for contributors and users
            if ((item.name === 'Partners' || item.name === 'Partners Inquiry' || item.name === 'Sponsorships' || item.name === 'Advertisements' || item.name === 'Ad Inquiries' || item.section === 'Advertisers') && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            // Hide Subscriptions section for contributors and users
            if ((item.name === 'Plans' || item.name === 'Subscribers' || item.section === 'Subscriptions') && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            // Hide Settings section for contributors and users
            if ((item.name === 'Categories' || item.name === 'Email Templates' || item.section === 'Settings') && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            return true
          }).map((item, filteredIndex) => {
            if (item.section) {
              return (
                <div key={`section-${item.section || 'unknown'}-${filteredIndex}`} style={{ 
                  marginTop: filteredIndex > 0 ? '12px' : '0',
                  paddingTop: filteredIndex > 0 ? '12px' : '0',
                  borderTop: filteredIndex > 0 ? '1px solid #e2e8f0' : 'none'
                }}>
                  {!sidebarCollapsed && (
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      color: '#94a3b8', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {item.section}
                    </span>
                  )}
                </div>
              )
            }
            if (item.folder) {
              const isExpanded = expandedSections[item.folder.toLowerCase()]
              return (
                <div key={`folder-${item.folder || 'unknown'}-${filteredIndex}`}>
                  <button
                    onClick={() => toggleSection(item.folder.toLowerCase())}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      background: 'transparent',
                      color: '#475569',
                      cursor: 'pointer',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'
                      e.currentTarget.style.color = '#1e293b'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#475569'
                    }}
                  >
                    <item.icon style={{ 
                      width: '18px', 
                      height: '18px', 
                      flexShrink: 0
                    }} />
                    {!sidebarCollapsed && (
                      <>
                        <span style={{ fontWeight: '500', fontSize: '13px', flex: 1 }}>{item.folder}</span>
                        {isExpanded ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
                      </>
                    )}
                  </button>
                  {!sidebarCollapsed && isExpanded && (
                    <div style={{ marginLeft: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {item.items.map((subItem, subIndex) => {
                        if (subItem.folder) {
                          const isSubExpanded = expandedSections[subItem.folder.toLowerCase()]
                          return (
                            <div key={`subfolder-${subItem.folder || 'unknown'}-${filteredIndex}-${subIndex}`}>
                              <button
                                onClick={() => toggleSection(subItem.folder.toLowerCase())}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  transition: 'all 0.2s ease',
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#475569',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'
                                  e.currentTarget.style.color = '#1e293b'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = '#475569'
                                }}
                              >
                                <subItem.icon style={{ 
                                  width: '16px', 
                                  height: '16px', 
                                  flexShrink: 0
                                }} />
                                <span style={{ fontWeight: '500', fontSize: '12px', flex: 1 }}>{subItem.folder}</span>
                                {isSubExpanded ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
                              </button>
                              {isSubExpanded && (
                                <div style={{ marginLeft: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {subItem.items.map((nestedItem, nestedIndex) => {
                                    const isNestedActive = location.pathname === nestedItem.href.split('?')[0]
                                    return (
                                      <Link
                                        key={nestedItem.href || `nested-${filteredIndex}-${subIndex}-${nestedIndex}`}
                                        to={nestedItem.href}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          padding: '6px 12px',
                                          borderRadius: '6px',
                                          transition: 'all 0.2s ease',
                                          textDecoration: 'none',
                                          background: isNestedActive ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
                                          color: isNestedActive ? 'white' : '#475569',
                                          boxShadow: isNestedActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isNestedActive) {
                                            e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'
                                            e.currentTarget.style.color = '#1e293b'
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isNestedActive) {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.color = '#475569'
                                          }
                                        }}
                                      >
                                        <nestedItem.icon style={{ 
                                          width: '14px', 
                                          height: '14px', 
                                          flexShrink: 0,
                                          color: isNestedActive ? 'white' : 'inherit'
                                        }} />
                                        <span style={{ fontWeight: '500', fontSize: '11px' }}>{nestedItem.name}</span>
                                      </Link>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        }
                        const isSubActive = location.pathname === subItem.href.split('?')[0]
                        return (
                          <Link
                            key={subItem.href || `sub-${filteredIndex}-${subIndex}`}
                            to={subItem.href}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease',
                              textDecoration: 'none',
                              background: isSubActive ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
                              color: isSubActive ? 'white' : '#475569',
                              boxShadow: isSubActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'
                                e.currentTarget.style.color = '#1e293b'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#475569'
                              }
                            }}
                          >
                            <subItem.icon style={{ 
                              width: '16px', 
                              height: '16px', 
                              flexShrink: 0,
                              color: isSubActive ? 'white' : 'inherit'
                            }} />
                            <span style={{ fontWeight: '500', fontSize: '12px' }}>{subItem.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href || item.name || `nav-item-${filteredIndex}`}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  background: isActive ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
                  color: isActive ? 'white' : '#475569',
                  boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'
                    e.currentTarget.style.color = '#1e293b'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#475569'
                  }
                }}
              >
                <item.icon style={{ 
                  width: '18px', 
                  height: '18px', 
                  flexShrink: 0,
                  color: isActive ? 'white' : 'inherit'
                }} />
                {!sidebarCollapsed && (
                  <span style={{ fontWeight: '500', fontSize: '13px' }}>{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            margin: sidebarCollapsed ? '16px auto' : '16px',
            padding: '6px',
            width: '28px',
            height: '28px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#7c3aed'
            e.currentTarget.style.borderColor = '#7c3aed'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)'
            e.currentTarget.style.transform = 'scale(1.1)'
            const icon = e.currentTarget.querySelector('svg')
            if (icon) icon.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.borderColor = '#e2e8f0'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)'
            e.currentTarget.style.transform = 'scale(1)'
            const icon = e.currentTarget.querySelector('svg')
            if (icon) icon.style.color = '#64748b'
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight style={{ width: '14px', height: '14px', color: '#64748b', transition: 'color 0.25s ease' }} />
          ) : (
            <ChevronLeft style={{ width: '14px', height: '14px', color: '#64748b', transition: 'color 0.25s ease' }} />
          )}
        </button>
      </aside>
      )}

      {/* Main Content */}
      <HeaderVisibilityContext.Provider value={{ hideHeader, setHideHeader }}>
        <SidebarVisibilityContext.Provider value={{ hideSidebar, setHideSidebar }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <HeaderContent 
              userInitial={userInitial}
              userName={userName}
              userEmail={userEmail}
              profileDropdownOpen={profileDropdownOpen}
              setProfileDropdownOpen={setProfileDropdownOpen}
              profileRef={profileRef}
              handleLogout={handleLogout}
              hideHeader={hideHeader}
            />

            {/* Page Content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative', zIndex: 1 }}>
              <Outlet />
            </main>
          </div>
        </SidebarVisibilityContext.Provider>
      </HeaderVisibilityContext.Provider>
    </div>
  )
}
