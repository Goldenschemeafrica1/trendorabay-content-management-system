# CMS Frontend

React 19 + TypeScript + Vite frontend for the Trendorabay CMS application.

## 📋 Overview

This frontend provides a modern, responsive admin interface for managing all CMS features including content management, e-commerce, analytics, community features, and advertising.

## 🔧 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **TipTap** - Rich text editor
- **Lucide React** - Icon library
- **Recharts** - Data visualization charts
- **clsx & tailwind-merge** - Conditional class utilities
- **date-fns** - Date manipulation

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Configure API endpoint:**
   - Ensure the backend API is running on `http://localhost:5000`
   - The frontend is configured to communicate with the backend via the API service layer

3. **Start the development server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🚀 Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run lint` - Run oxlint for code quality checks
- `npm run preview` - Preview production build locally

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Layout.jsx      # Main layout with sidebar and header
│   │   └── MobileBlocker.jsx # Mobile device blocker
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Stories.jsx     # Stories management
│   │   ├── Magazines.jsx   # Magazines management
│   │   ├── Podcasts.jsx    # Podcasts management
│   │   ├── Authors.jsx     # Authors management
│   │   ├── Users.jsx       # User management
│   │   ├── Media.jsx       # Media library
│   │   ├── Merchandise.jsx # Products management
│   │   ├── Orders.jsx      # Orders management
│   │   ├── Analytics.jsx   # Analytics dashboard
│   │   ├── Engagement.jsx  # Engagement metrics
│   │   ├── Sales.jsx       # Sales analytics
│   │   ├── Performance.jsx # Performance metrics
│   │   ├── Contributors.jsx # Contributors management
│   │   ├── Events.jsx      # Events management
│   │   ├── CommunityHub.jsx # Community posts
│   │   ├── Homepage.jsx    # Homepage management
│   │   ├── PodcastPage.jsx # Podcast page management
│   │   ├── StorePage.jsx   # Store page management
│   │   ├── Mission.jsx     # Mission page management
│   │   ├── Team.jsx        # Team management
│   │   ├── Partners.jsx    # Partners management
│   │   ├── Sponsorships.jsx # Sponsorships management
│   │   ├── Advertisements.jsx # Ad management
│   │   ├── AdvertisementInquiries.jsx # Ad inquiries
│   │   ├── Plans.jsx       # Subscription plans
│   │   ├── Subscribers.jsx # Subscribers management
│   │   ├── Categories.jsx  # Categories management
│   │   ├── EmailTemplates.jsx # Email templates
│   │   ├── GuestApplicationsPage.jsx # Guest applications
│   │   ├── PitchSubmissionsPage.jsx # Pitch submissions
│   │   ├── ContactMessagesPage.jsx # Contact messages
│   │   ├── Login.jsx       # Login page
│   │   └── Register.jsx    # Registration page
│   ├── services/           # API service layer
│   │   └── api.js          # API client configuration
│   ├── lib/                # Utility functions
│   │   └── utils.js        # Helper functions
│   ├── assets/             # Static assets
│   │   └── logoo.png       # Logo image
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # Application entry point
│   ├── index.css           # Global styles
│   └── App.css             # App-specific styles
├── public/                 # Public static files
│   └── logoo.png           # Logo image
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── postcss.config.js       # PostCSS configuration
├── package.json
└── README.md
```

## 🔐 Authentication & Authorization

The frontend implements role-based access control (RBAC) with the following user roles:

- **superadmin**: Full system access including analytics
- **admin**: Full access except analytics
- **editor**: Content management access
- **contributor**: Limited content creation access
- **user**: Basic access

### Protected Routes

Routes are protected using the `ProtectedRoute` component which checks:
- User authentication (JWT token in localStorage)
- User role permissions

### Authentication Flow

1. User logs in via `/login` page
2. Backend returns JWT token
3. Token stored in localStorage
4. User data stored in localStorage
5. Protected routes check for valid token and role permissions
6. Logout clears token and user data from localStorage

## 🎨 UI Features

### Layout
- **Sidebar Navigation**: Collapsible sidebar with categorized navigation
- **Header**: User profile, notifications, and logout functionality
- **Responsive Design**: Desktop-optimized with mobile device blocker
- **Role-Based Navigation**: Menu items filtered based on user role

### Components
- **Layout**: Main layout component with sidebar, header, and content area
- **MobileBlocker**: Prevents access on mobile devices
- **ProtectedRoute**: Route protection wrapper for authentication and authorization

### Styling
- **TailwindCSS**: Utility-first CSS framework for styling
- **Custom Styles**: Additional styles in App.css and index.css
- **Glassmorphism**: Modern UI with backdrop blur effects
- **Gradient Effects**: Linear gradients for buttons and active states

### Rich Text Editing
- **TipTap Editor**: Modern rich text editor for content creation
- **Starter Kit**: Includes essential text editing features

### Data Visualization
- **Recharts**: Chart library for analytics dashboards
- **Charts**: Line charts, bar charts, pie charts for data visualization

## 📡 API Integration

The frontend communicates with the backend API through a centralized API service layer:

### API Service (`src/services/api.js`)
- Base URL configuration
- Request/response interceptors
- Error handling
- JWT token attachment

### API Calls
All pages use the API service to make HTTP requests to backend endpoints. The API service automatically:
- Attaches JWT tokens to requests
- Handles authentication errors
- Manages loading states
- Processes error responses

## 🎯 Key Pages

### Dashboard
- Overview of system statistics
- Quick access to recent activities
- Role-based widgets and metrics

### Content Management
- **Stories**: Create, edit, delete articles with rich text editor
- **Magazines**: Manage digital magazine issues
- **Podcasts**: Manage audio content with hosts and guests
- **Authors**: Manage author profiles
- **Categories**: Organize content with categories

### User Management
- **Users**: Manage CMS users with role assignments
- **User Status**: Ban/unban functionality

### E-commerce
- **Products**: Manage merchandise and products
- **Orders**: Track and manage customer orders

### Analytics
- **Traffic**: Page views and visitor analytics
- **Engagement**: User engagement metrics
- **Sales**: Revenue and sales tracking
- **Performance**: System performance metrics

### Community
- **Contributors**: Manage community contributors
- **Events**: Create and manage events
- **Community Hub**: Community posts and discussions

### Advertising
- **Partners**: Manage advertising partners
- **Sponsorships**: Track sponsorship deals
- **Advertisements**: Create and manage ad campaigns
- **Ad Inquiries**: Handle advertising inquiries

### Subscriptions
- **Plans**: Create and manage subscription tiers
- **Subscribers**: Manage subscription base

### Settings
- **Categories**: Content categorization
- **Email Templates**: Customizable email templates

### Pages
- **Homepage**: Manage homepage content
- **Podcast Page**: Podcast landing page
- **Store Page**: E-commerce storefront
- **Mission**: Mission statement page
- **Team**: Team member profiles
- **Contact Messages**: Contact form submissions

### Guest Applications & Pitches
- **Guest Applications**: Podcast guest application management
- **Pitch Submissions**: Content pitch submission management

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (#7c3aed to #4f46e5)
- **Secondary**: Slate/Gray scale (#64748b, #475569, #0f172a)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444, #dc2626)

### Typography
- **Font**: System font stack
- **Weights**: 400 (regular), 500 (medium), 600 (semibold)
- **Sizes**: 11px to 16px for UI elements

### Components
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: White backgrounds with subtle shadows
- **Inputs**: Clean borders with focus states
- **Tables**: Responsive data tables with actions
- **Modals**: Overlay dialogs for forms and confirmations

## 🔧 Development

### Code Quality
```bash
npm run lint  # Run oxlint for code quality checks
```

### Hot Module Replacement
The development server supports hot module replacement for fast development iterations.

### Build Optimization
Vite provides fast builds with:
- ES module bundling
- Code splitting
- Tree shaking
- Asset optimization

## 🚢 Deployment

### Production Build
```bash
npm run build
```

This creates a `dist` folder with optimized production assets.

### Preview Production Build
```bash
npm run preview
```

### Deployment Steps
1. Build the production bundle
2. Upload the `dist` folder to your hosting service
3. Configure the web server to serve the application
4. Set up environment variables if needed
5. Configure the backend API URL for production

### Environment Configuration
- Development: API at `http://localhost:5000`
- Production: Update API base URL in `src/services/api.js`

## 🌐 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Desktop-optimized (mobile access blocked)

## 📱 Mobile Support

The CMS admin interface is designed for desktop use only. A mobile blocker component prevents access on mobile devices to ensure optimal user experience.

## 🔒 Security

- JWT token storage in localStorage
- Protected routes with role-based access
- Automatic token expiration handling
- Secure API communication
- Input sanitization on backend

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors**
- Ensure backend server is running on port 5000
- Check CORS configuration on backend
- Verify API base URL in `src/services/api.js`

**Authentication Issues**
- Clear localStorage and re-login
- Verify JWT token validity
- Check backend authentication endpoints

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Test changes thoroughly
4. Update documentation as needed
5. Use meaningful commit messages

## 📄 License

ISC

## 👥 Support

For issues and questions, please open an issue in the repository.
