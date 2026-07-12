import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MobileBlocker from './components/MobileBlocker'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Stories from './pages/Stories'
import Magazines from './pages/Magazines'
import Podcasts from './pages/Podcasts'
import PodcastHosts from './pages/PodcastHosts'
import PodcastGuests from './pages/PodcastGuests'
import Authors from './pages/Authors'
import Users from './pages/Users'
import Media from './pages/Media'
import Merchandise from './pages/Merchandise'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Engagement from './pages/Engagement'
import Sales from './pages/Sales'
import Performance from './pages/Performance'
import Contributors from './pages/Contributors'
import Events from './pages/Events'
import CommunityHub from './pages/CommunityHub'
import Homepage from './pages/Homepage'
import PodcastPage from './pages/PodcastPage'
import StorePage from './pages/StorePage'
import Mission from './pages/Mission'
import Team from './pages/Team'
import Partners from './pages/Partners'
import PartnershipInquiries from './pages/PartnershipInquiries'
import Sponsorships from './pages/Sponsorships'
import Advertisements from './pages/Advertisements'
import AdvertisementInquiries from './pages/AdvertisementInquiries'
import Plans from './pages/Plans'
import Subscribers from './pages/Subscribers'
import Categories from './pages/Categories'
import EmailTemplates from './pages/EmailTemplates'
import GuestApplicationsPage from './pages/GuestApplicationsPage'
import PitchSubmissionsPage from './pages/PitchSubmissionsPage'
import ContactMessagesPage from './pages/ContactMessagesPage'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const userStr = localStorage.getItem('user')
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
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="stories" element={<Stories />} />
          <Route path="magazines" element={<Magazines />} />
          <Route path="podcasts" element={<Podcasts />} />
          <Route path="podcast-hosts" element={<PodcastHosts />} />
          <Route path="podcast-guests" element={<PodcastGuests />} />
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
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
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
              <Events />
            </ProtectedRoute>
          } />
          <Route path="community" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <CommunityHub />
            </ProtectedRoute>
          } />
          <Route path="homepage" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Homepage />
            </ProtectedRoute>
          } />
          <Route path="podcast" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <PodcastPage />
            </ProtectedRoute>
          } />
          <Route path="store" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <StorePage />
            </ProtectedRoute>
          } />
          <Route path="mission" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Mission />
            </ProtectedRoute>
          } />
          <Route path="team" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Team />
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
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Plans />
            </ProtectedRoute>
          } />
          <Route path="subscribers" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Subscribers />
            </ProtectedRoute>
          } />
          <Route path="categories" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <Categories />
            </ProtectedRoute>
          } />
          <Route path="email-templates" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <EmailTemplates />
            </ProtectedRoute>
          } />
          <Route path="guest-applications" element={<GuestApplicationsPage />} />
          <Route path="pitch-submissions" element={<PitchSubmissionsPage />} />
          <Route path="contact-messages" element={
            <ProtectedRoute allowedRoles={['editor', 'admin', 'superadmin']}>
              <ContactMessagesPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
    </MobileBlocker>
  )
}

export default App
