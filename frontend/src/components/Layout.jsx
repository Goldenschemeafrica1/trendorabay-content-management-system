import { useState, useEffect, useContext, useRef, createContext } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Mic,
  User as UserIcon,
  UserCheck,
  Lightbulb,
  Users,
  ImageIcon,
  ShoppingBag,
  Package,
  TrendingUp,
  Heart,
  DollarSign,
  BarChart3,
  Shield,
  AlertTriangle,
  UserPlus,
  Calendar,
  MessageCircle,
  Home,
  File,
  Users as TeamIcon,
  Inbox,
  Building2,
  Mail,
  Award,
  CreditCard,
  Folder,
  MailIcon,
  Search,
  Moon,
  Sun,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
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

// Create context for theme control
export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {}
})

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, notificationKey: null },
  { section: 'Content' },
  { name: 'Stories', href: '/dashboard/stories', icon: FileText, notificationKey: 'stories' },
  { name: 'Magazines', href: '/dashboard/magazines', icon: BookOpen, notificationKey: 'magazines' },
  { name: 'Podcasts', href: '/dashboard/podcasts', icon: Mic, notificationKey: null },
  { name: 'Podcast Hosts', href: '/dashboard/podcast-hosts', icon: UserIcon, notificationKey: null },
  { name: 'Podcast Guests', href: '/dashboard/podcast-guests', icon: UserCheck, notificationKey: null },
  { name: 'Guest Applications', href: '/dashboard/guest-applications', icon: UserCheck, notificationKey: 'guestApplications' },
  { name: 'Pitch Submissions', href: '/dashboard/pitch-submissions', icon: Lightbulb, notificationKey: 'pitchSubmissions' },
  { name: 'Authors', href: '/dashboard/authors', icon: Users, notificationKey: null },
  { name: 'User Management', href: '/dashboard/users', icon: Users, notificationKey: 'userManagement' },
  { name: 'Media Library', href: '/dashboard/media', icon: ImageIcon, notificationKey: null },
  { section: 'Store' },
  { name: 'Products', href: '/dashboard/merchandise', icon: ShoppingBag, notificationKey: null },
  { name: 'Orders', href: '/dashboard/orders', icon: Package, notificationKey: 'orders' },
  { section: 'Analytics' },
  { name: 'Traffic', href: '/dashboard/analytics', icon: TrendingUp, notificationKey: null },
  { name: 'Engagement', href: '/dashboard/engagement', icon: Heart, notificationKey: null },
  { name: 'Sales', href: '/dashboard/sales', icon: DollarSign, notificationKey: null },
  { name: 'Performance', href: '/dashboard/performance', icon: BarChart3, notificationKey: null },
  { section: 'Security' },
  { name: 'Security Dashboard', href: '/dashboard/security', icon: Shield, notificationKey: null },
  { name: 'Security Events', href: '/dashboard/security-events', icon: Shield, notificationKey: 'securityEvents' },
  { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileText, notificationKey: null },
  { name: 'CSP Violations', href: '/dashboard/csp-violations', icon: AlertTriangle, notificationKey: null },
  { section: 'Community' },
  { name: 'Contributors', href: '/dashboard/contributors', icon: UserPlus, notificationKey: null },
  { name: 'Events', href: '/dashboard/events', icon: Calendar, notificationKey: 'events' },
  { name: 'Community Hub', href: '/dashboard/community', icon: MessageCircle, notificationKey: null },
  { section: 'Pages' },
  { name: 'Homepage', href: '/dashboard/homepage', icon: Home, notificationKey: null },
  { name: 'PodcastPage', href: '/dashboard/podcast', icon: File, notificationKey: null },
  { name: 'Store', href: '/dashboard/store', icon: ShoppingBag, notificationKey: null },
  { name: 'Mission', href: '/dashboard/mission', icon: File, notificationKey: null },
  { name: 'Team', href: '/dashboard/team', icon: TeamIcon, notificationKey: null },
  { name: 'Gallery', href: '/dashboard/gallery', icon: ImageIcon, notificationKey: null },
  { name: 'Contact Messages', href: '/dashboard/contact-messages', icon: Inbox, notificationKey: 'contactMessages' },
  { section: 'Advertisers' },
  { name: 'Partners', href: '/dashboard/partners', icon: Building2, notificationKey: null },
  { name: 'Partners Inquiry', href: '/dashboard/partnership-inquiries', icon: Mail, notificationKey: 'partnersInquiry' },
  { name: 'Sponsorships', href: '/dashboard/sponsorships', icon: Award, notificationKey: null },
  { name: 'Advertisements', href: '/dashboard/advertisements', icon: ImageIcon, notificationKey: null },
  { name: 'Ad Inquiries', href: '/dashboard/advertisement-inquiries', icon: Mail, notificationKey: null },
  { section: 'Subscriptions' },
  { name: 'Plans', href: '/dashboard/plans', icon: CreditCard, notificationKey: null },
  { name: 'Subscribers', href: '/dashboard/subscribers', icon: Users, notificationKey: null },
  { section: 'Settings' },
  { name: 'Categories', href: '/dashboard/categories', icon: Folder, notificationKey: null },
  { name: 'Email Templates', href: '/dashboard/email-templates', icon: MailIcon, notificationKey: null },
]

function HeaderContent({ userInitial, userName, userEmail, profileDropdownOpen, setProfileDropdownOpen, profileRef, handleLogout, hideHeader, isDarkMode, toggleTheme }) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  if (hideHeader) return null

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header style={{
      height: '80px',
      background: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: isDarkMode ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      zIndex: 100
    }}>
      {/* Search Bar */}
      <div style={{
        position: 'relative',
        width: '300px'
      }}>
        <Search style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '18px',
          height: '18px',
          color: '#94a3b8'
        }} />
        <input
          type="text"
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          style={{
            width: '100%',
            padding: '10px 12px 10px 40px',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.8)',
            background: isDarkMode ? '#1e293b' : '#f8fafc',
            fontSize: '14px',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#8b5cf6'
            e.currentTarget.style.background = isDarkMode ? '#0f172a' : 'white'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = isDarkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.8)'
            e.currentTarget.style.background = isDarkMode ? '#1e293b' : '#f8fafc'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleTheme}
          style={{
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
          }}
        >
          {isDarkMode ? <Sun style={{ width: '20px', height: '20px', color: '#64748b' }} /> : <Moon style={{ width: '20px', height: '20px', color: '#64748b' }} />}
        </button>
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
              background: isDarkMode ? '#1e293b' : 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              minWidth: '220px',
              zIndex: 10000
            }}>
              <div style={{ padding: '8px 0' }}>
                <div style={{
                  padding: '16px',
                  borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  marginBottom: '8px'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>{userName}</p>
                  <p style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>{userEmail}</p>
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
                  onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '14px', color: isDarkMode ? '#f1f5f9' : '#475569' }}>Profile</span>
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
                  onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '14px', color: isDarkMode ? '#f1f5f9' : '#475569' }}>Settings</span>
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderTop: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 1)'}
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [notificationCounts, setNotificationCounts] = useState({
    stories: 0,
    magazines: 0,
    guestApplications: 0,
    pitchSubmissions: 0,
    orders: 0,
    securityEvents: 0,
    events: 0,
    contactMessages: 0,
    partnersInquiry: 0,
    userManagement: 0
  })

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev
      localStorage.setItem('theme', newMode ? 'dark' : 'light')
      return newMode
    })
  }

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.style.setProperty('--bg-primary', '#0f172a')
      document.documentElement.style.setProperty('--bg-secondary', '#1e293b')
      document.documentElement.style.setProperty('--text-primary', '#f1f5f9')
      document.documentElement.style.setProperty('--text-secondary', '#94a3b8')
      document.documentElement.style.setProperty('--border-color', '#334155')
    } else {
      document.documentElement.style.setProperty('--bg-primary', '#ffffff')
      document.documentElement.style.setProperty('--bg-secondary', '#f8fafc')
      document.documentElement.style.setProperty('--text-primary', '#0f172a')
      document.documentElement.style.setProperty('--text-secondary', '#64748b')
      document.documentElement.style.setProperty('--border-color', '#e2e8f0')
    }
  }, [isDarkMode])

  // Get user data from sessionStorage and set state to trigger re-render
  useEffect(() => {
    const loadUser = () => {
      const userStr = sessionStorage.getItem('user')
      const userData = userStr ? JSON.parse(userStr) : null
      setCurrentUser(userData)
    }

    loadUser()

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      loadUser()
    }

    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom event for same-tab updates
    window.addEventListener('user-session-changed', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('user-session-changed', handleStorageChange)
    }
  }, [])

  const user = currentUser
  const userName = user?.name || 'Admin User'
  const userEmail = user?.email || ''
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

  // Fetch notification counts from backend
  const fetchNotificationCounts = async () => {
    try {
      const counts = await api.get('/notifications/counts')
      setNotificationCounts(counts)
    } catch (error) {
      console.error('Failed to fetch notification counts:', error)
      // Set default values if API fails
      setNotificationCounts({
        stories: 0,
        magazines: 0,
        guestApplications: 0,
        pitchSubmissions: 0,
        orders: 0,
        securityEvents: 0,
        events: 0,
        contactMessages: 0,
        partnersInquiry: 0,
        userManagement: 0
      })
    }
  }

  // Load notification counts on mount and periodically refresh
  useEffect(() => {
    fetchNotificationCounts()
    const interval = setInterval(fetchNotificationCounts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

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
    <div style={{ display: 'flex', height: '100vh', background: isDarkMode ? '#0f172a' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', position: 'relative' }}>
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
          background: isDarkMode ? '#0f172a' : 'white',
          borderRight: isDarkMode ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
      >
        {/* Logo */}
        <div style={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: isDarkMode ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.8)',
          background: isDarkMode ? '#0f172a' : 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <img 
              src="/logoo.png" 
              alt="Logo" 
              style={{ 
                width: '220px', 
                height: '220px',
                objectFit: 'contain',
                filter: isDarkMode ? 'brightness(0) invert(1)' : 'none'
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', position: 'relative', zIndex: 20 }}>
          {navigation.filter(item => {
            // Hide User Management for contributors and users (only admin/superadmin can see it)
            if (item.name === 'User Management' && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor')) {
              return false
            }
            // Hide Podcasts, Podcast Hosts, Podcast Guests, and Guest Applications for non-superadmin users
            if ((item.name === 'Podcasts' || item.name === 'Podcast Hosts' || item.name === 'Podcast Guests' || item.name === 'Guest Applications') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
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
            // Hide Store section and Products/Orders for non-superadmin users
            if ((item.name === 'Products' || item.name === 'Orders' || item.section === 'Store') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
              return false
            }
            // Hide Analytics section for non-superadmin users
            if ((item.name === 'Traffic' || item.name === 'Engagement' || item.name === 'Sales' || item.name === 'Performance' || item.section === 'Analytics') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
              return false
            }
            // Hide Security section for non-superadmin users
            if ((item.name === 'Security Dashboard' || item.name === 'Security Events' || item.name === 'Audit Logs' || item.name === 'CSP Violations' || item.section === 'Security') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
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
            // Hide Homepage, PodcastPage, Store, and Mission for non-superadmin users
            if ((item.name === 'Homepage' || item.name === 'PodcastPage' || item.name === 'Store' || item.name === 'Mission') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
              return false
            }
            // Hide Advertisers section for contributors and users
            if ((item.name === 'Partners' || item.name === 'Partners Inquiry' || item.name === 'Sponsorships' || item.name === 'Advertisements' || item.name === 'Ad Inquiries' || item.section === 'Advertisers') && (!userRole || userRole === 'contributor' || userRole === 'user')) {
              return false
            }
            // Hide Subscriptions section for non-superadmin users
            if ((item.name === 'Plans' || item.name === 'Subscribers' || item.section === 'Subscriptions') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
              return false
            }
            // Hide Settings section for non-superadmin users
            if ((item.name === 'Categories' || item.name === 'Email Templates' || item.section === 'Settings') && (!userRole || userRole === 'contributor' || userRole === 'user' || userRole === 'editor' || userRole === 'admin')) {
              return false
            }
            return true
          }).map((item, filteredIndex) => {
            if (item.section) {
              return (
                <div key={`section-${item.section || 'unknown'}-${filteredIndex}`} style={{ 
                  marginTop: filteredIndex > 0 ? '12px' : '0',
                  paddingTop: filteredIndex > 0 ? '12px' : '0',
                  borderTop: filteredIndex > 0 ? (isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0') : 'none'
                }}>
                  {!sidebarCollapsed && (
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      color: isDarkMode ? '#64748b' : '#94a3b8', 
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
                      color: isDarkMode ? '#94a3b8' : '#475569',
                      cursor: 'pointer',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                      e.currentTarget.style.color = isDarkMode ? '#f1f5f9' : '#1e293b'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'
                    }}
                  >
                    <item.icon style={{ 
                      width: '18px', 
                      height: '18px', 
                      flexShrink: 0,
                      color: isDarkMode ? '#94a3b8' : '#475569'
                    }} />
                    {!sidebarCollapsed && (
                      <>
                        <span style={{ fontWeight: '500', fontSize: '13px', flex: 1 }}>{item.folder}</span>
                        {isExpanded ? <ChevronUp style={{ width: '16px', height: '16px', color: isDarkMode ? '#94a3b8' : '#475569' }} /> : <ChevronDown style={{ width: '16px', height: '16px', color: isDarkMode ? '#94a3b8' : '#475569' }} />}
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
                                  color: isDarkMode ? '#94a3b8' : '#475569',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                                  e.currentTarget.style.color = isDarkMode ? '#f1f5f9' : '#1e293b'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'
                                }}
                              >
                                <subItem.icon style={{ 
                                  width: '16px', 
                                  height: '16px', 
                                  flexShrink: 0,
                                  color: isDarkMode ? '#94a3b8' : '#475569'
                                }} />
                                <span style={{ fontWeight: '500', fontSize: '12px', flex: 1 }}>{subItem.folder}</span>
                                {isSubExpanded ? <ChevronUp style={{ width: '14px', height: '14px', color: isDarkMode ? '#94a3b8' : '#475569' }} /> : <ChevronDown style={{ width: '14px', height: '14px', color: isDarkMode ? '#94a3b8' : '#475569' }} />}
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
                                          color: isNestedActive ? 'white' : (isDarkMode ? '#94a3b8' : '#475569'),
                                          boxShadow: isNestedActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isNestedActive) {
                                            e.currentTarget.style.background = isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                                            e.currentTarget.style.color = isDarkMode ? '#f1f5f9' : '#1e293b'
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isNestedActive) {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'
                                          }
                                        }}
                                      >
                                        <nestedItem.icon style={{ 
                                          width: '14px', 
                                          height: '14px', 
                                          flexShrink: 0,
                                          color: isNestedActive ? 'white' : (isDarkMode ? '#94a3b8' : 'inherit')
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
                        const subIconGradient = subItem.name === 'Traffic' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                                           subItem.name === 'Engagement' ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                                           subItem.name === 'Sales' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                                           subItem.name === 'Performance' ? 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)' :
                                           'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
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
                              color: isSubActive ? 'white' : (isDarkMode ? '#94a3b8' : '#475569'),
                              boxShadow: isSubActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                                e.currentTarget.style.color = isDarkMode ? '#f1f5f9' : '#1e293b'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubActive) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'
                              }
                            }}
                          >
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: subIconGradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                              <subItem.icon style={{ 
                                width: '16px', 
                                height: '16px', 
                                color: 'white'
                              }} />
                            </div>
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
            const iconGradient = item.name === 'Dashboard' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' :
                              item.name === 'Stories' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                              item.name === 'Magazines' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                              item.name === 'Podcasts' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                              item.name === 'Authors' ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' :
                              item.name === 'User Management' ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' :
                              item.name === 'Media Library' ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                              item.name === 'Products' ? 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)' :
                              item.name === 'Orders' ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                              item.name === 'Contributors' ? 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' :
                              item.name === 'Events' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                              item.name === 'Community Hub' ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' :
                              item.name === 'Homepage' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                              item.name === 'PodcastPage' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                              item.name === 'Store' ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                              item.name === 'Mission' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                              item.name === 'Team' ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' :
                              item.name === 'Gallery' ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                              item.name === 'Contact Messages' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                              item.name === 'Partners' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                              item.name === 'Partners Inquiry' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                              item.name === 'Sponsorships' ? 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)' :
                              item.name === 'Advertisements' ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                              item.name === 'Ad Inquiries' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                              item.name === 'Plans' ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                              item.name === 'Subscribers' ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' :
                              item.name === 'Categories' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                              item.name === 'Email Templates' ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                              item.name === 'Security' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                              item.name === 'Security Events' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' :
                              item.name === 'Audit Logs' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' :
                              item.name === 'CSP Violations' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                              'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
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
                  color: isActive ? 'white' : (isDarkMode ? '#94a3b8' : '#475569'),
                  boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  zIndex: 30,
                  pointerEvents: 'auto'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                    e.currentTarget.style.color = isDarkMode ? '#f1f5f9' : '#1e293b'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'
                  }
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: iconGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                  <item.icon style={{ 
                    width: '18px', 
                    height: '18px', 
                    color: 'white'
                  }} />
                </div>
                {!sidebarCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{item.name}</span>
                    {item.notificationKey && notificationCounts[item.notificationKey] > 0 && (
                      <span style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        minWidth: '18px',
                        textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                      }}>
                        {notificationCounts[item.notificationKey] > 99 ? '99+' : notificationCounts[item.notificationKey]}
                      </span>
                    )}
                  </div>
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
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            borderRadius: '8px',
            background: isDarkMode ? '#1e293b' : 'white',
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
            e.currentTarget.style.background = isDarkMode ? '#1e293b' : 'white'
            e.currentTarget.style.borderColor = isDarkMode ? '#334155' : '#e2e8f0'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)'
            e.currentTarget.style.transform = 'scale(1)'
            const icon = e.currentTarget.querySelector('svg')
            if (icon) icon.style.color = isDarkMode ? '#94a3b8' : '#64748b'
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight style={{ width: '14px', height: '14px', color: isDarkMode ? '#94a3b8' : '#64748b', transition: 'color 0.25s ease' }} />
          ) : (
            <ChevronLeft style={{ width: '14px', height: '14px', color: isDarkMode ? '#94a3b8' : '#64748b', transition: 'color 0.25s ease' }} />
          )}
        </button>
      </aside>
      )}

      {/* Main Content */}
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
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
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
              />

              {/* Page Content */}
              <main style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative', zIndex: 0 }}>
                <Outlet />
              </main>
            </div>
          </SidebarVisibilityContext.Provider>
        </HeaderVisibilityContext.Provider>
      </ThemeContext.Provider>
    </div>
  )
}
