const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('./middleware/xss');
const { cspMiddleware } = require('./middleware/csp');
const { createRoleBasedRateLimiter, createStrictRateLimiter, createApiRateLimiter } = require('./middleware/userRateLimit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // We use custom CSP middleware
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Custom CSP middleware
app.use(cspMiddleware);

// User-based rate limiting for API routes
const apiLimiter = createApiRateLimiter();

// Strict rate limiting for auth routes
const authLimiter = createStrictRateLimiter();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://trendorabay-content-management-syst.vercel.app', /.+\.vercel\.app$/], // Restrict to specific origins and Vercel domains
  credentials: true
}));

// XSS Protection
app.use(xss);

// Security monitoring - detect suspicious activity
// app.use(suspiciousActivityDetector);

// Apply rate limiting
app.use('/api/auth/', authLimiter);
app.use('/api/', apiLimiter);
app.use(bodyParser.json({ limit: '10mb' })); // Add request size limit
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with enhanced configuration
const uploadsPath = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve static files with restricted CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://trendorabay-content-management-syst.vercel.app', /.+\.vercel\.app$/];

app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return allowed === origin;
  });
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(uploadsPath));

console.log('Serving static files from:', uploadsPath);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CMS Backend API is running' });
});

// Import routes
console.log('Loading routes...');
const storiesRoutes = require('./routes/stories');
const authorsRoutes = require('./routes/authors');
const magazinesRoutes = require('./routes/magazines');
const podcastsRoutes = require('./routes/podcasts');
const usersRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const partnersRoutes = require('./routes/partners');
const partnershipInquiriesRoutes = require('./routes/partnershipInquiries');
const sponsorshipsRoutes = require('./routes/sponsorships');
const plansRoutes = require('./routes/plans');
const subscribersRoutes = require('./routes/subscribers');
const contributorsRoutes = require('./routes/contributors');
const eventsRoutes = require('./routes/events');
const communityRoutes = require('./routes/community');
const categoriesRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');
const seoRoutes = require('./routes/seo');
const emailTemplatesRoutes = require('./routes/emailTemplates');
const teamRoutes = require('./routes/team');
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const advertisementsRoutes = require('./routes/advertisements');
const advertisementInquiriesRoutes = require('./routes/advertisementInquiries');
const podcastHostsRoutes = require('./routes/podcastHosts');
const podcastGuestsRoutes = require('./routes/podcastGuests');
const guestApplicationsRoutes = require('./routes/guestApplications');
const pitchSubmissionsRoutes = require('./routes/pitchSubmissions');
const contactMessagesRoutes = require('./routes/contactMessages');
const galleryRoutes = require('./routes/gallery');
const securityRoutes = require('./routes/security');
const notificationsRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
console.log('Routes loaded successfully');

// Use routes
app.use('/api/stories', storiesRoutes);
app.use('/api/authors', authorsRoutes);
app.use('/api/magazines', magazinesRoutes);
app.use('/api/podcasts', podcastsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/partnership-inquiries', partnershipInquiriesRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/sponsorships', sponsorshipsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/contributors', contributorsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/advertisements', advertisementsRoutes);
app.use('/api/advertisement-inquiries', advertisementInquiriesRoutes);
app.use('/api/podcast-hosts', podcastHostsRoutes);
app.use('/api/podcast-guests', podcastGuestsRoutes);
app.use('/api/guest-applications', guestApplicationsRoutes);
app.use('/api/pitch-submissions', pitchSubmissionsRoutes);
app.use('/api/contact-messages', contactMessagesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error without stack trace in production
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  } else {
    console.error('Error:', err.message);
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
