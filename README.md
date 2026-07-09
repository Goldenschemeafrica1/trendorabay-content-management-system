# Trendorabay CMS

A comprehensive Content Management System (CMS) built with a modern full-stack architecture, featuring content management, e-commerce, community features, analytics, and advertising capabilities.

## 🏗️ Architecture

This CMS uses a modern full-stack architecture:

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + MySQL
- **Styling**: TailwindCSS
- **Rich Text Editor**: TipTap
- **Icons**: Lucide React
- **Charts**: Recharts
- **Authentication**: JWT with bcrypt

## 📋 Features

### Content Management
- **Stories**: Create, edit, and manage articles with rich text editing
- **Authors**: Manage author profiles and contributions
- **Magazines**: Digital magazine publishing with PDF support
- **Podcasts**: Audio content management with hosts and guests
- **Categories**: Organize content with hierarchical categories
- **Media Library**: Centralized file upload and management

### E-commerce
- **Products**: Manage merchandise and products
- **Orders**: Track and manage customer orders
- **Subscription Plans**: Create and manage subscription tiers
- **Subscribers**: Manage subscription base

### Community
- **Contributors**: Manage community contributors
- **Events**: Create and manage events (in-person, virtual, hybrid)
- **Community Hub**: Community posts and discussions

### Advertising
- **Partners**: Manage advertising partners
- **Sponsorships**: Track sponsorship deals
- **Advertisements**: Create and manage ad campaigns
- **Ad Inquiries**: Handle advertising inquiries

### Analytics
- **Traffic Analytics**: Page views and visitor tracking
- **Engagement Metrics**: User engagement analytics
- **Sales Analytics**: Revenue and sales tracking
- **Performance Reports**: System performance metrics

### User Management
- **Role-Based Access Control**: Admin, Editor, Superadmin, Contributor, User roles
- **User Management**: Comprehensive user administration
- **Authentication**: Secure JWT-based authentication

### Settings & Configuration
- **Site Settings**: Global site configuration
- **SEO Management**: Per-page SEO optimization
- **Email Templates**: Customizable email templates
- **Team Management**: Team member profiles

### Additional Features
- **Guest Applications**: Podcast guest application management
- **Pitch Submissions**: Content pitch submission system
- **Contact Messages**: Contact form message management
- **Mobile Responsive**: Desktop-only admin interface with mobile blocker

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd cms
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Backend Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Set up Database**
```bash
mysql -u root -p < database/schema.sql
```

5. **Start Backend Server**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

6. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
```

7. **Start Frontend Development Server**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
cms/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Express middleware (auth, validation, etc.)
│   │   ├── routes/         # API route handlers
│   │   └── server.js       # Main server entry point
│   ├── database/
│   │   ├── schema.sql      # Database schema
│   │   └── migrations/     # Database migrations
│   ├── uploads/            # Uploaded media files
│   └── package.json
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── lib/            # Utility functions
│   │   └── main.jsx        # React entry point
│   └── package.json
└── README.md
```

## 🔐 Authentication & Authorization

The CMS uses JWT-based authentication with role-based access control:

- **superadmin**: Full system access, including analytics
- **admin**: Full access except analytics
- **editor**: Content management access
- **contributor**: Limited content creation access
- **user**: Basic access

Protected routes are enforced on both frontend and backend.

## 📊 Database Schema

The database includes tables for:
- Users & CMS Users (authentication)
- Authors, Categories, Stories, Magazines, Podcasts (content)
- Products, Orders, Order Items (e-commerce)
- Partners, Sponsorships, Advertisements (advertising)
- Subscription Plans, Subscribers (subscriptions)
- Contributors, Events, Community Posts (community)
- Site Settings, SEO Settings, Email Templates (configuration)
- Team Members, Analytics (management & reporting)

See `backend/database/schema.sql` for complete schema definition.

## 🔧 API Documentation

The backend provides RESTful APIs for all CMS features. Base URL: `http://localhost:5000/api`

### Main API Endpoints
- `/api/auth` - Authentication
- `/api/stories` - Stories management
- `/api/authors` - Authors management
- `/api/magazines` - Magazines management
- `/api/podcasts` - Podcasts management
- `/api/users` - User management
- `/api/media` - Media library
- `/api/products` - Products
- `/api/orders` - Orders
- `/api/partners` - Partners
- `/api/sponsorships` - Sponsorships
- `/api/plans` - Subscription plans
- `/api/subscribers` - Subscribers
- `/api/contributors` - Contributors
- `/api/events` - Events
- `/api/community` - Community posts
- `/api/categories` - Categories
- `/api/settings` - Site settings
- `/api/seo` - SEO settings
- `/api/email-templates` - Email templates
- `/api/team` - Team members
- `/api/analytics` - Analytics
- `/api/advertisements` - Advertisements
- `/api/advertisement-inquiries` - Ad inquiries
- `/api/guest-applications` - Guest applications
- `/api/pitch-submissions` - Pitch submissions
- `/api/contact-messages` - Contact messages

For detailed API documentation, see `backend/README.md`.

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server
```

### Code Quality
```bash
# Frontend linting
cd frontend
npm run lint  # Uses oxlint
```

## 🚢 Deployment

### Backend Deployment
1. Set environment variables in production
2. Build and start the server:
```bash
cd backend
npm start
```

### Frontend Deployment
1. Build the production bundle:
```bash
cd frontend
npm run build
```
2. Deploy the `dist` folder to your hosting service

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting (100 requests/15min, 5 auth requests/15min)
- XSS protection middleware
- CORS configuration
- Password hashing with bcrypt
- JWT authentication
- Input validation with express-validator

## 📝 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trendorabay
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👥 Support

For issues and questions, please open an issue in the repository.
