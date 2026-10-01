import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MobileBlocker from './components/MobileBlocker'
import Layout from './components/Layout'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Stories = lazy(() => import('./pages/Stories'))
const CreateStory = lazy(() => import('./pages/CreateStory'))
const EditStory = lazy(() => import('./pages/EditStory'))
const ViewStory = lazy(() => import('./pages/ViewStory'))
const Magazines = lazy(() => import('./pages/Magazines'))
const Podcasts = lazy(() => import('./pages/Podcasts'))
const PodcastHosts = lazy(() => import('./pages/PodcastHosts'))
const PodcastGuests = lazy(() => import('./pages/PodcastGuests'))
const Authors = lazy(() => import('./pages/Authors'))
const Users = lazy(() => import('./pages/Users'))
const Media = lazy(() => import('./pages/Media'))
const Merchandise = lazy(() => import('./pages/Merchandise'))
const Orders = lazy(() => import('./pages/Orders'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Engagement = lazy(() => import('./pages/Engagement'))
const Sales = lazy(() => import('./pages/Sales'))
const Performance = lazy(() => import('./pages/Performance'))
const Contributors = lazy(() => import('./pages/Contributors'))
const Opportunities = lazy(() => import('./pages/Opportunities'))
const CreateOpportunity = lazy(() => import('./pages/CreateOpportunity'))
const EditOpportunity = lazy(() => import('./pages/EditOpportunity'))
const Homepage = lazy(() => import('./pages/Homepage'))
const PodcastPage = lazy(() => import('./pages/PodcastPage'))
const StorePage = lazy(() => import('./pages/StorePage'))
const Mission = lazy(() => import('./pages/Mission'))
const Team = lazy(() => import('./pages/Team'))
const Partners = lazy(() => import('./pages/Partners'))
const PartnershipInquiries = lazy(() => import('./pages/PartnershipInquiries'))
const Sponsorships = lazy(() => import('./pages/Sponsorships'))
const Advertisements = lazy(() => import('./pages/Advertisements'))
const AdvertisementInquiries = lazy(() => import('./pages/AdvertisementInquiries'))
const Plans = lazy(() => import('./pages/Plans'))
const Subscribers = lazy(() => import('./pages/Subscribers'))
const Categories = lazy(() => import('./pages/Categories'))
const EmailTemplates = lazy(() => import('./pages/EmailTemplates'))
const GuestApplicationsPage = lazy(() => import('./pages/GuestApplicationsPage'))
const PitchSubmissionsPage = lazy(() => import('./pages/PitchSubmissionsPage'))
const PitchApplicationsPage = lazy(() => import('./pages/PitchApplicationsPage'))
const Gallery = lazy(() => import('./pages/Gallery'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard'))
const SecurityEvents = lazy(() => import('./pages/SecurityEvents'))
const AuditLogs = lazy(() => import('./pages/AuditLogs'))
const CspViolations = lazy(() => import('./pages/CspViolations'))

function ProtectedRoute({ children, allowedRoles = [] }) {
  const userStr = sessionStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <MobileBlocker>
      <BrowserRouter>
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="stories" element={<Stories />} />
          <Route path="stories/create" element={<CreateStory />} />
          <Route path="stories/edit/:id" element={<EditStory />} />
          <Route path="stories/view/:id" element={<ViewStory />} />
          <Route path="magazines" element={<Magazines />} />
          <Route path="podcasts" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Podcasts />
            </ProtectedRoute>
          } />
          <Route path="podcast-hosts" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <PodcastHosts />
            </ProtectedRoute>
          } />
          <Route path="podcast-guests" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <PodcastGuests />
            </ProtectedRoute>
          } />
          <Route path="authors" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Authors />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="media" element={<Media />} />
          <Route path="merchandise" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Merchandise />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="engagement" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Engagement />
            </ProtectedRoute>
          } />
          <Route path="sales" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Sales />
            </ProtectedRoute>
          } />
          <Route path="performance" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Performance />
            </ProtectedRoute>
          } />
          <Route path="contributors" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Contributors />
            </ProtectedRoute>
          } />
          <Route path="events" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Opportunities />
            </ProtectedRoute>
          } />
          <Route path="events/create" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <CreateOpportunity />
            </ProtectedRoute>
          } />
          <Route path="events/edit/:id" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <EditOpportunity />
            </ProtectedRoute>
          } />
          <Route path="homepage" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Homepage />
            </ProtectedRoute>
          } />
          <Route path="podcast" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <PodcastPage />
            </ProtectedRoute>
          } />
          <Route path="store" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <StorePage />
            </ProtectedRoute>
          } />
          <Route path="mission" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Mission />
            </ProtectedRoute>
          } />
          <Route path="team" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Team />
            </ProtectedRoute>
          } />
          <Route path="gallery" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Gallery />
            </ProtectedRoute>
          } />
          <Route path="partners" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Partners />
            </ProtectedRoute>
          } />
          <Route path="partnership-inquiries" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <PartnershipInquiries />
            </ProtectedRoute>
          } />
          <Route path="sponsorships" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Sponsorships />
            </ProtectedRoute>
          } />
          <Route path="advertisements" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Advertisements />
            </ProtectedRoute>
          } />
          <Route path="advertisement-inquiries" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <AdvertisementInquiries />
            </ProtectedRoute>
          } />
          <Route path="plans" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Plans />
            </ProtectedRoute>
          } />
          <Route path="subscribers" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Subscribers />
            </ProtectedRoute>
          } />
          <Route path="categories" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Categories />
            </ProtectedRoute>
          } />
          <Route path="email-templates" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <EmailTemplates />
            </ProtectedRoute>
          } />
          <Route path="guest-applications" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <GuestApplicationsPage />
            </ProtectedRoute>
          } />
          <Route path="pitch-submissions" element={<PitchSubmissionsPage />} />
          <Route path="pitch-applications" element={<PitchApplicationsPage />} />
          <Route path="security" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SecurityDashboard />
            </ProtectedRoute>
          } />
          <Route path="security-events" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SecurityEvents />
            </ProtectedRoute>
          } />
          <Route path="audit-logs" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <AuditLogs />
            </ProtectedRoute>
          } />
          <Route path="csp-violations" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <CspViolations />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
    </MobileBlocker>
  )
}

export default App
