# Trendorabay CMS - Complete Documentation

**Version:** 1.0.0  
**Last Updated:** July 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Quick Start Guide](#quick-start-guide)
5. [Project Structure](#project-structure)
6. [Authentication & Authorization](#authentication--authorization)
7. [Backend Documentation](#backend-documentation)
8. [Frontend Documentation](#frontend-documentation)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [Security Features](#security-features)
12. [Deployment Guide](#deployment-guide)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

Trendorabay CMS is a comprehensive Content Management System built with a modern full-stack architecture, featuring content management, e-commerce, community features, analytics, and advertising capabilities.

### Technology Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- TipTap (Rich Text Editor)
- Lucide React (Icons)
- Recharts (Data Visualization)
- React Router DOM (Routing)

**Backend:**
- Node.js (v14+)
- Express.js
- MySQL (v8.0+)
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Multer (File Uploads)
- Helmet.js (Security)
- Express Rate Limit

---

## Architecture

The CMS follows a modern full-stack architecture with clear separation of concerns:

### Frontend Architecture
- Component-based React architecture
- Client-side routing with React Router
- Centralized API service layer
- Role-based protected routes
- Responsive design with TailwindCSS

### Backend Architecture
- RESTful API design
- Modular route organization
- Middleware-based security
- Database abstraction layer
- File upload handling

### Data Flow
1. Frontend makes API calls through centralized service
2. Backend validates requests and processes business logic
3. MySQL database stores and retrieves data
4. Responses return as JSON to frontend
5. Frontend updates UI based on responses

---

## Features

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

---

## Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd cms
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

#### 3. Configure Backend Environment
Create or copy `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trendorabay
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

#### 4. Set up Database
```bash
mysql -u root -p < database/schema.sql
```

#### 5. Start Backend Server
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

#### 6. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
```

#### 7. Start Frontend Development Server
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### Verification
1. Access the frontend at `http://localhost:5173`
2. Register a new user account
3. Login with the created credentials
4. Navigate through the dashboard to verify functionality

---

## Project Structure

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
│   ├── .env                # Environment variables
│   ├── package.json
│   └── README.md
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── lib/            # Utility functions
│   │   ├── main.jsx        # React entry point
│   │   ├── App.jsx         # Main app component
│   │   └── index.css       # Global styles
│   ├── public/             # Public static files
│   ├── package.json
│   └── README.md
├── README.md               # Main project documentation
├── API_DOCUMENTATION.md    # API reference
└── DATABASE_SCHEMA.md      # Database schema documentation
```

---

## Authentication & Authorization

### User Roles

The CMS uses JWT-based authentication with role-based access control:

- **superadmin**: Full system access, including analytics
- **admin**: Full access except analytics
- **editor**: Content management access
- **contributor**: Limited content creation access
- **user**: Basic access

### Authentication Flow

1. User registers via `/login` page
2. Backend validates credentials and generates JWT token
3. Token stored in localStorage on frontend
4. User data stored in localStorage
5. Protected routes check for valid token and role permissions
6. API calls include JWT token in Authorization header
7. Logout clears token and user data from localStorage

### Protected Routes

Routes are protected using the `ProtectedRoute` component which checks:
- User authentication (JWT token in localStorage)
- User role permissions

Backend middleware validates JWT tokens on protected endpoints.

---

## Backend Documentation

### Tech Stack

- **Node.js** (v14+) - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver with promise support
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Installation

```bash
cd backend
npm install
```

### Configuration

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trendorabay
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js        # Authentication middleware
│   │   ├── xss.js         # XSS protection
│   │   └── upload.js      # File upload configuration
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   ├── stories.js     # Story routes
│   │   ├── authors.js     # Author routes
│   │   ├── magazines.js   # Magazine routes
│   │   ├── podcasts.js    # Podcast routes
│   │   ├── users.js       # User routes
│   │   ├── media.js       # Media routes
│   │   ├── products.js    # Product routes
│   │   ├── orders.js      # Order routes
│   │   └── ...            # Other route files
│   └── server.js          # Main server entry point
├── database/
│   ├── schema.sql         # Database schema
│   └── migrations/        # Database migrations
├── uploads/               # Uploaded media files
├── .env                   # Environment variables
├── package.json
└── README.md
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Key Dependencies

- `express` - Web framework
- `mysql2` - MySQL database driver
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `multer` - File upload handling
- `dotenv` - Environment variable management
- `nodemon` - Development auto-reload (dev dependency)

---

## Frontend Documentation

### Tech Stack

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

### Installation

```bash
cd frontend
npm install
```

### Configuration

The frontend is configured to communicate with the backend API at `http://localhost:5000`. Update the API base URL in `src/services/api.js` for production environments.

### Running the Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run lint` - Run oxlint for code quality checks
- `npm run preview` - Preview production build locally

### Project Structure

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

### UI Features

#### Layout
- **Sidebar Navigation**: Collapsible sidebar with categorized navigation
- **Header**: User profile, notifications, and logout functionality
- **Responsive Design**: Desktop-optimized with mobile device blocker
- **Role-Based Navigation**: Menu items filtered based on user role

#### Components
- **Layout**: Main layout component with sidebar, header, and content area
- **MobileBlocker**: Prevents access on mobile devices
- **ProtectedRoute**: Route protection wrapper for authentication and authorization

#### Styling
- **TailwindCSS**: Utility-first CSS framework for styling
- **Custom Styles**: Additional styles in App.css and index.css
- **Glassmorphism**: Modern UI with backdrop blur effects
- **Gradient Effects**: Linear gradients for buttons and active states

### Key Dependencies

- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Client-side routing
- `@tiptap/react` - Rich text editor
- `@tiptap/starter-kit` - TipTap starter kit
- `lucide-react` - Icon library
- `recharts` - Data visualization
- `tailwind-merge` - Conditional class utilities
- `clsx` - Conditional class names
- `date-fns` - Date manipulation

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Authentication Endpoints

#### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

#### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Content Management Endpoints

#### Stories
- `GET /stories` - Get all stories
- `POST /stories` - Create a new story
- `GET /stories/:id` - Get a single story
- `PUT /stories/:id` - Update a story
- `DELETE /stories/:id` - Delete a story

#### Authors
- `GET /authors` - Get all authors
- `POST /authors` - Create a new author
- `GET /authors/:id` - Get a single author
- `PUT /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author

#### Magazines
- `GET /magazines` - Get all magazines
- `POST /magazines` - Create a new magazine
- `GET /magazines/:id` - Get a single magazine
- `PUT /magazines/:id` - Update a magazine
- `DELETE /magazines/:id` - Delete a magazine

#### Podcasts
- `GET /podcasts` - Get all podcasts
- `POST /podcasts` - Create a new podcast
- `GET /podcasts/:id` - Get a single podcast
- `PUT /podcasts/:id` - Update a podcast
- `DELETE /podcasts/:id` - Delete a podcast

#### Podcast Hosts
- `GET /podcast-hosts` - Get all podcast hosts
- `POST /podcast-hosts` - Create a new host
- `GET /podcast-hosts/:id` - Get a single host
- `PUT /podcast-hosts/:id` - Update a host
- `DELETE /podcast-hosts/:id` - Delete a host

#### Podcast Guests
- `GET /podcast-guests` - Get all podcast guests
- `POST /podcast-guests` - Create a new guest
- `GET /podcast-guests/:id` - Get a single guest
- `PUT /podcast-guests/:id` - Update a guest
- `DELETE /podcast-guests/:id` - Delete a guest

#### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create a new category
- `GET /categories/:id` - Get a single category
- `PUT /categories/:id` - Update a category
- `DELETE /categories/:id` - Delete a category

### User Management Endpoints

#### Users
- `GET /users` - Get all users
- `POST /users` - Create a new user
- `GET /users/:id` - Get a single user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user
- `PATCH /users/:id/status` - Ban/unban user

### E-commerce Endpoints

#### Products
- `GET /products` - Get all products
- `POST /products` - Create a new product
- `GET /products/:id` - Get a single product
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

#### Orders
- `GET /orders` - Get all orders
- `POST /orders` - Create a new order
- `GET /orders/:id` - Get a single order
- `PUT /orders/:id` - Update an order
- `DELETE /orders/:id` - Delete an order
- `PATCH /orders/:id/status` - Update order status

### Media Management Endpoints

#### Media Library
- `GET /media` - Get all media files
- `POST /media` - Upload a new media file
- `DELETE /media/:id` - Delete media

### Advertising Endpoints

#### Partners
- `GET /partners` - Get all partners
- `POST /partners` - Create a new partner
- `GET /partners/:id` - Get a single partner
- `PUT /partners/:id` - Update a partner
- `DELETE /partners/:id` - Delete a partner

#### Sponsorships
- `GET /sponsorships` - Get all sponsorships
- `POST /sponsorships` - Create a new sponsorship
- `GET /sponsorships/:id` - Get a single sponsorship
- `PUT /sponsorships/:id` - Update a sponsorship
- `DELETE /sponsorships/:id` - Delete a sponsorship

#### Advertisements
- `GET /advertisements` - Get all advertisements
- `POST /advertisements` - Create a new advertisement
- `GET /advertisements/:id` - Get a single advertisement
- `PUT /advertisements/:id` - Update an advertisement
- `DELETE /advertisements/:id` - Delete an advertisement

#### Advertisement Inquiries
- `GET /advertisement-inquiries` - Get all ad inquiries
- `POST /advertisement-inquiries` - Create a new inquiry
- `GET /advertisement-inquiries/:id` - Get a single inquiry
- `PUT /advertisement-inquiries/:id` - Update an inquiry
- `DELETE /advertisement-inquiries/:id` - Delete an inquiry

### Subscription Endpoints

#### Subscription Plans
- `GET /plans` - Get all subscription plans
- `POST /plans` - Create a new plan
- `GET /plans/:id` - Get a single plan
- `PUT /plans/:id` - Update a plan
- `DELETE /plans/:id` - Delete a plan

#### Subscribers
- `GET /subscribers` - Get all subscribers
- `POST /subscribers` - Create a new subscriber
- `GET /subscribers/:id` - Get a single subscriber
- `PUT /subscribers/:id` - Update a subscriber
- `DELETE /subscribers/:id` - Delete a subscriber

### Community Endpoints

#### Contributors
- `GET /contributors` - Get all contributors
- `POST /contributors` - Create a new contributor
- `GET /contributors/:id` - Get a single contributor
- `PUT /contributors/:id` - Update a contributor
- `DELETE /contributors/:id` - Delete a contributor

#### Events
- `GET /events` - Get all events
- `POST /events` - Create a new event
- `GET /events/:id` - Get a single event
- `PUT /events/:id` - Update an event
- `DELETE /events/:id` - Delete an event

#### Community Posts
- `GET /community` - Get all community posts
- `POST /community` - Create a new post
- `GET /community/:id` - Get a single post
- `PUT /community/:id` - Update a post
- `DELETE /community/:id` - Delete a post

### Guest Applications & Pitches

#### Guest Applications
- `GET /guest-applications` - Get all guest applications
- `POST /guest-applications` - Create a new application
- `GET /guest-applications/:id` - Get a single application
- `PUT /guest-applications/:id` - Update an application
- `DELETE /guest-applications/:id` - Delete an application

#### Pitch Submissions
- `GET /pitch-submissions` - Get all pitch submissions
- `POST /pitch-submissions` - Create a new submission
- `GET /pitch-submissions/:id` - Get a single submission
- `PUT /pitch-submissions/:id` - Update a submission
- `DELETE /pitch-submissions/:id` - Delete a submission

### Contact Messages

#### Contact Messages
- `GET /contact-messages` - Get all contact messages
- `POST /contact-messages` - Create a new message
- `GET /contact-messages/:id` - Get a single message
- `PUT /contact-messages/:id` - Update a message
- `DELETE /contact-messages/:id` - Delete a message

### Settings & Configuration Endpoints

#### Site Settings
- `GET /settings/:key` - Get a setting value
- `PUT /settings/:key` - Update a setting value

#### SEO Settings
- `GET /seo/:page_name` - Get SEO settings for a page
- `PUT /seo/:page_name` - Update SEO settings for a page

#### Email Templates
- `GET /email-templates/:template_name` - Get an email template
- `PUT /email-templates/:template_name` - Update an email template

#### Team Members
- `GET /team` - Get all team members
- `POST /team` - Create a new team member
- `GET /team/:id` - Get a single team member
- `PUT /team/:id` - Update a team member
- `DELETE /team/:id` - Delete a team member

### Analytics Endpoints

#### Analytics
- `GET /analytics` - Get analytics data
- `GET /analytics/traffic` - Get traffic analytics
- `GET /analytics/engagement` - Get engagement analytics
- `GET /analytics/sales` - Get sales analytics

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP

When rate limit is exceeded, the API returns:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### Pagination

Some endpoints support pagination via query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Example: `GET /stories?page=2&limit=20`

### Sorting

Some endpoints support sorting via query parameters:

- `sort_by`: Field to sort by
- `order`: Sort order (`asc` or `desc`)

Example: `GET /stories?sort_by=created_at&order=desc`

---

## Database Schema

### Database Name

`trendorabay`

### Overview

The CMS database consists of 30+ tables organized into the following categories:

- **Authentication & Users**: User management and authentication
- **Content Management**: Stories, authors, magazines, podcasts, categories
- **E-commerce**: Products, orders, subscriptions
- **Advertising**: Partners, sponsorships, advertisements
- **Community**: Contributors, events, community posts
- **Configuration**: Settings, SEO, email templates, team
- **Analytics**: Page views, user engagement
- **Forms & Submissions**: Guest applications, pitch submissions, contact messages

### Authentication & Users Tables

#### cms_users

Main user authentication table for CMS access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| role | ENUM | DEFAULT 'user' | User role: 'admin', 'user', 'contributor', 'superadmin', 'editor' |
| status | ENUM | DEFAULT 'active' | Account status: 'active', 'banned' |
| profile_image_url | VARCHAR(500) | NULL | Profile picture URL |
| last_active | TIMESTAMP | NULL | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### users

Extended user information table for user management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| cms_user_id | INT | UNIQUE, FOREIGN KEY | Reference to cms_users.id |
| username | VARCHAR(255) | NOT NULL | Unique username |
| first_name | VARCHAR(255) | NULL | First name |
| last_name | VARCHAR(255) | NULL | Last name |
| email | VARCHAR(255) | NOT NULL | Email address |
| password | VARCHAR(255) | NULL | Hashed password |
| role | ENUM | DEFAULT 'user' | User role |
| profile_image_url | VARCHAR(500) | NULL | Profile image URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### Content Management Tables

#### authors

Content author profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Author's name |
| bio | TEXT | NULL | Author biography |
| avatar_url | VARCHAR(500) | NULL | Profile image URL |
| email | VARCHAR(255) | NULL | Contact email |
| social_links | JSON | NULL | Social media links |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### categories

Content categorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Category name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| description | TEXT | NULL | Category description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### stories

Articles and blog posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Story title |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| content | LONGTEXT | NULL | Full story content |
| excerpt | TEXT | NULL | Brief excerpt/summary |
| featured_image_url | VARCHAR(500) | NULL | Featured image URL |
| author_id | INT | FOREIGN KEY | Reference to authors.id |
| category_id | INT | FOREIGN KEY | Reference to categories.id |
| status | ENUM | DEFAULT 'draft' | Status: 'draft', 'published' |
| featured | TINYINT(1) | DEFAULT 0 | Featured flag (0/1) |
| published_at | TIMESTAMP | NULL | Publication date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### magazines

Digital magazine issues.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Magazine title |
| issue | VARCHAR(100) | NULL | Issue number/name |
| description | TEXT | NULL | Magazine description |
| cover_image_url | VARCHAR(500) | NULL | Cover image URL |
| pdf_url | VARCHAR(500) | NULL | PDF download URL |
| category_id | INT | FOREIGN KEY | Reference to categories.id |
| published_date | DATE | NULL | Publication date |
| price | DECIMAL(10,2) | NULL | Standard price |
| digital_price | DECIMAL(10,2) | NULL | Digital version price |
| print_price | DECIMAL(10,2) | NULL | Print version price |
| subscription_price | DECIMAL(10,2) | NULL | Subscription price |
| pages | INT | NULL | Number of pages |
| language | VARCHAR(50) | NULL | Publication language |
| publisher | VARCHAR(255) | NULL | Publisher name |
| rating | DECIMAL(3,2) | NULL | Average rating (0.00-5.00) |
| review_count | INT | DEFAULT 0 | Number of reviews |
| table_of_contents | TEXT | NULL | Table of contents |
| contributors | TEXT | NULL | Contributor list |
| preview_pages | TEXT | NULL | Available preview pages |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### podcasts

Audio content/episodes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Episode title |
| episode_number | INT | NULL | Episode number |
| description | TEXT | NULL | Episode description |
| cover_art_url | VARCHAR(500) | NULL | Cover art URL |
| audio_file_url | VARCHAR(500) | NULL | Audio file URL |
| category_id | INT | FOREIGN KEY | Reference to categories.id |
| host_id | INT | FOREIGN KEY | Reference to podcast_hosts.id |
| published_at | TIMESTAMP | NULL | Publication date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### podcast_hosts

Podcast presenters/hosts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Host's name |
| bio | TEXT | NULL | Host biography |
| avatar_url | VARCHAR(500) | NULL | Profile image URL |
| email | VARCHAR(255) | NULL | Contact email |
| social_links | JSON | NULL | Social media links |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### podcast_guests

Podcast episode guests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Guest's name |
| title | VARCHAR(255) | NULL | Guest's title/position |
| bio | TEXT | NULL | Guest biography |
| avatar_url | VARCHAR(500) | NULL | Profile image URL |
| email | VARCHAR(255) | NULL | Contact email |
| episode | VARCHAR(255) | NULL | Episode appearance |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### E-commerce Tables

#### products

E-commerce products/merchandise.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT | NULL | Product description |
| price | DECIMAL(10,2) | NOT NULL | Product price |
| stock | INT | DEFAULT 0 | Available stock quantity |
| image_url | VARCHAR(500) | NULL | Product image URL |
| category | VARCHAR(100) | NULL | Product category |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### orders

Customer orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| order_number | VARCHAR(100) | UNIQUE, NOT NULL | Order number |
| customer_name | VARCHAR(255) | NOT NULL | Customer's name |
| customer_email | VARCHAR(255) | NOT NULL | Customer's email |
| total_amount | DECIMAL(10,2) | NOT NULL | Total order amount |
| status | ENUM | DEFAULT 'pending' | Status: 'pending', 'processing', 'shipped', 'delivered', 'cancelled' |
| shipping_address | TEXT | NULL | Shipping address |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Order creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### order_items

Individual items within an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| order_id | INT | FOREIGN KEY | Reference to orders.id |
| product_id | INT | FOREIGN KEY | Reference to products.id |
| quantity | INT | NOT NULL | Item quantity |
| price | DECIMAL(10,2) | NOT NULL | Price per item |

#### subscription_plans

Subscription tiers for content access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Plan name |
| description | TEXT | NULL | Plan description |
| price | DECIMAL(10,2) | NOT NULL | Monthly/yearly price |
| billing_cycle | ENUM | DEFAULT 'monthly' | Cycle: 'monthly', 'yearly' |
| features | JSON | NULL | Plan features list |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### subscribers

Subscription users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Subscriber's name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Subscriber's email |
| plan_id | INT | FOREIGN KEY | Reference to subscription_plans.id |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive', 'cancelled' |
| subscription_start | DATE | NULL | Subscription start date |
| subscription_end | DATE | NULL | Subscription end date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### Media Management Tables

#### media

Centralized media library.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| filename | VARCHAR(255) | NOT NULL | Stored filename |
| original_name | VARCHAR(255) | NOT NULL | Original filename |
| file_url | VARCHAR(500) | NOT NULL | File access URL |
| file_type | VARCHAR(50) | NULL | MIME type |
| file_size | BIGINT | NULL | File size in bytes |
| folder | VARCHAR(255) | NULL | Organization folder |
| uploaded_by | INT | FOREIGN KEY | Reference to cms_users.id |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload time |

### Advertising Tables

#### partners

Advertising/sponsorship partners.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Partner company name |
| logo_url | VARCHAR(500) | NULL | Company logo URL |
| website_url | VARCHAR(500) | NULL | Company website |
| contact_email | VARCHAR(255) | NULL | Contact email |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### sponsorships

Sponsorship deals and agreements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Sponsorship title |
| partner_id | INT | FOREIGN KEY | Reference to partners.id |
| amount | DECIMAL(10,2) | NULL | Sponsorship amount |
| start_date | DATE | NULL | Start date |
| end_date | DATE | NULL | End date |
| status | ENUM | DEFAULT 'pending' | Status: 'active', 'inactive', 'pending' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### advertisements

Ad campaigns and placements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Ad title |
| advertiser_name | VARCHAR(255) | NULL | Advertiser name |
| campaign_name | VARCHAR(255) | NULL | Campaign name |
| image_url | VARCHAR(500) | NULL | Desktop image URL |
| mobile_image_url | VARCHAR(500) | NULL | Mobile image URL |
| destination_url | VARCHAR(500) | NULL | Click-through URL |
| location | ENUM | DEFAULT 'top-banner' | Placement: 'top-banner', 'between-sections', 'sidebar-vertical', 'footer-banner', 'sponsored-story', 'mobile-banner' |
| priority | INT | DEFAULT 1 | Display priority |
| rotation | BOOLEAN | DEFAULT TRUE | Rotate with other ads |
| active | BOOLEAN | DEFAULT TRUE | Currently active |
| start_date | DATE | NULL | Campaign start |
| end_date | DATE | NULL | Campaign end |
| budget | DECIMAL(10,2) | NULL | Campaign budget |
| impressions | INT | DEFAULT 0 | Total impressions |
| clicks | INT | DEFAULT 0 | Total clicks |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### advertisement_inquiries

Advertising inquiry submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| contact_name | VARCHAR(255) | NOT NULL | Contact person name |
| contact_email | VARCHAR(255) | NULL | Contact email |
| contact_phone | VARCHAR(100) | NULL | Contact phone |
| company_name | VARCHAR(255) | NULL | Company name |
| message | TEXT | NULL | Inquiry message |
| budget_range | VARCHAR(100) | NULL | Budget range |
| preferred_duration | VARCHAR(100) | NULL | Preferred duration |
| status | ENUM | DEFAULT 'pending' | Status: 'pending', 'approved', 'rejected' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### Community Tables

#### contributors

Community contributors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Contributor's name |
| email | VARCHAR(255) | NULL | Contact email |
| bio | TEXT | NULL | Contributor biography |
| role | VARCHAR(100) | NULL | Contributor role |
| followers | INT | DEFAULT 0 | Follower count |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### events

Community events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Event title |
| description | TEXT | NOT NULL | Event description |
| event_date | DATE | NOT NULL | Event date |
| event_time | VARCHAR(50) | NULL | Event time |
| location | VARCHAR(255) | NULL | Event location |
| event_type | ENUM | DEFAULT 'In-Person' | Type: 'In-Person', 'Virtual', 'Hybrid' |
| image_url | VARCHAR(500) | NULL | Event image URL |
| category | VARCHAR(100) | NULL | Event category |
| attendees | INT | DEFAULT 0 | Expected/actual attendees |
| price | VARCHAR(50) | NULL | Ticket price |
| featured | TINYINT(1) | DEFAULT 0 | Featured flag |
| status | ENUM | DEFAULT 'upcoming' | Status: 'upcoming', 'ongoing', 'completed', 'cancelled' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |
| type | VARCHAR(100) | DEFAULT 'Conference' | Event type |

#### community_posts

Community discussion posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Post title |
| content | LONGTEXT | NULL | Post content |
| author_id | INT | FOREIGN KEY | Reference to cms_users.id |
| status | ENUM | DEFAULT 'draft' | Status: 'draft', 'published', 'archived' |
| published_at | TIMESTAMP | NULL | Publication date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### Configuration Tables

#### site_settings

Global site configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | Setting key |
| setting_value | TEXT | NULL | Setting value |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### seo_settings

Page-specific SEO configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| page_name | VARCHAR(100) | UNIQUE, NOT NULL | Page identifier |
| meta_title | VARCHAR(255) | NULL | Meta title |
| meta_description | TEXT | NULL | Meta description |
| og_title | VARCHAR(255) | NULL | Open Graph title |
| og_description | TEXT | NULL | Open Graph description |
| og_image | VARCHAR(500) | NULL | Open Graph image |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### email_templates

Customizable email templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| template_name | VARCHAR(100) | UNIQUE, NOT NULL | Template identifier |
| subject | VARCHAR(255) | NULL | Email subject |
| content | LONGTEXT | NULL | Email body (HTML) |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### team_members

Team member profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Team member name |
| role | VARCHAR(100) | NULL | Team role/position |
| bio | TEXT | NULL | Biography |
| avatar_url | VARCHAR(500) | NULL | Profile image URL |
| email | VARCHAR(255) | NULL | Contact email |
| status | ENUM | DEFAULT 'active' | Status: 'active', 'inactive' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### Analytics Tables

#### page_views

Page view tracking for analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| page_url | VARCHAR(500) | NOT NULL | Page URL |
| view_count | INT | DEFAULT 0 | View count |
| date | DATE | NOT NULL | Tracking date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

#### user_engagement

User engagement tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | FOREIGN KEY | Reference to cms_users.id |
| action | VARCHAR(100) | NOT NULL | Action type |
| page_url | VARCHAR(500) | NULL | Page URL |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Action timestamp |

### Forms & Submissions Tables

#### guest_applications

Podcast guest applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| applicant_name | VARCHAR(255) | NOT NULL | Applicant's name |
| applicant_email | VARCHAR(255) | NOT NULL | Applicant's email |
| applicant_phone | VARCHAR(100) | NULL | Applicant's phone |
| company_name | VARCHAR(255) | NULL | Company name |
| job_title | VARCHAR(255) | NULL | Job title |
| bio | TEXT | NULL | Biography |
| expertise_areas | TEXT | NULL | Areas of expertise |
| social_links | JSON | NULL | Social media links |
| proposed_topics | TEXT | NULL | Proposed discussion topics |
| availability | TEXT | NULL | Availability information |
| status | ENUM | DEFAULT 'pending' | Status: 'pending', 'under_review', 'approved', 'rejected' |
| admin_notes | TEXT | NULL | Internal admin notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### pitch_submissions

Content pitch submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| submitter_name | VARCHAR(255) | NOT NULL | Submitter's name |
| submitter_email | VARCHAR(255) | NOT NULL | Submitter's email |
| submitter_phone | VARCHAR(100) | NULL | Submitter's phone |
| pitch_title | VARCHAR(255) | NOT NULL | Pitch title |
| pitch_description | TEXT | NOT NULL | Pitch description |
| target_audience | TEXT | NULL | Target audience |
| episode_format | VARCHAR(100) | NULL | Episode format |
| estimated_duration | VARCHAR(50) | NULL | Estimated duration |
| key_takeaways | TEXT | NULL | Key takeaways |
| additional_resources | TEXT | NULL | Additional resources |
| article_attachment | VARCHAR(255) | NULL | Attachment filename |
| status | ENUM | DEFAULT 'pending' | Status: 'pending', 'under_review', 'approved', 'rejected' |
| admin_notes | TEXT | NULL | Internal admin notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

#### contact_messages

Contact form submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Sender's name |
| email | VARCHAR(255) | NOT NULL | Sender's email |
| phone | VARCHAR(100) | NULL | Sender's phone |
| subject | VARCHAR(255) | NULL | Message subject |
| message | TEXT | NOT NULL | Message content |
| status | ENUM | DEFAULT 'unread' | Status: 'pending', 'unread', 'read', 'replied', 'archived' |
| admin_notes | TEXT | NULL | Internal admin notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### Database Relationships

#### Entity Relationship Summary

**Users & Authentication:**
- `cms_users` ← `users` (one-to-one)
- `cms_users` → `media` (one-to-many)
- `cms_users` → `community_posts` (one-to-many)
- `cms_users` → `user_engagement` (one-to-many)

**Content:**
- `authors` → `stories` (one-to-many)
- `categories` → `stories` (one-to-many)
- `categories` → `magazines` (one-to-many)
- `categories` → `podcasts` (one-to-many)
- `podcast_hosts` → `podcasts` (one-to-many)

**E-commerce:**
- `products` → `order_items` (one-to-many)
- `orders` → `order_items` (one-to-many)
- `subscription_plans` → `subscribers` (one-to-many)

**Advertising:**
- `partners` → `sponsorships` (one-to-many)

**Community:**
- `cms_users` → `community_posts` (one-to-many)

### Database Setup

To set up the database:

1. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS trendorabay;
USE trendorabay;
```

2. Run the schema file:
```bash
mysql -u root -p < database/schema.sql
```

---

## Security Features

### Backend Security

- **Helmet.js**: Security headers for HTTP responses
- **Rate Limiting**: 100 requests per 15 minutes (5 for auth routes)
- **XSS Protection**: Custom middleware for input sanitization
- **CORS**: Configured for specific origins only
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Token-based authentication with expiration
- **Input Validation**: Express-validator for request validation
- **Request Size Limits**: 10MB limit on request bodies

### Frontend Security

- **JWT Token Storage**: Secure localStorage implementation
- **Protected Routes**: Role-based access control on frontend
- **Token Expiration Handling**: Automatic logout on token expiry
- **Input Sanitization**: Backend validation for all user inputs
- **Secure API Communication**: HTTPS recommended for production

### Data Security

- **Password Storage**: Never store plain text passwords
- **Sensitive Data**: Email addresses and personal information protected
- **Access Control**: Role-based permissions enforced at API level
- **SQL Injection Prevention**: Parameterized queries throughout

---

## Deployment Guide

### Backend Deployment

#### Prerequisites
- Production server with Node.js (v14+)
- MySQL database server
- Domain name and SSL certificate

#### Steps

1. **Set Environment Variables**
```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=trendorabay
DB_PORT=3306
PORT=5000
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

2. **Install Production Dependencies**
```bash
cd backend
npm install --production
```

3. **Set Up Database**
```bash
mysql -u your_user -p < database/schema.sql
```

4. **Start Server with Process Manager**
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start src/server.js --name cms-backend
pm2 startup
pm2 save
```

5. **Configure Reverse Proxy (Nginx)**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable SSL/TLS**
```bash
# Using Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

### Frontend Deployment

#### Prerequisites
- Production server or hosting service
- Domain name and SSL certificate

#### Steps

1. **Build Production Bundle**
```bash
cd frontend
npm run build
```

2. **Deploy to Hosting Service**

**Option A: Vercel/Netlify**
- Connect your repository
- Configure build command: `npm run build`
- Set output directory: `dist`
- Deploy

**Option B: Traditional Hosting**
```bash
# Upload dist folder to your server
scp -r dist/* user@your-server:/var/www/html/
```

3. **Configure Nginx for SPA**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

4. **Environment Configuration**
Update API base URL in production build or use environment variables.

### Database Backup

**Automated Backup Script**
```bash
#!/bin/bash
# Backup script
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u your_user -p your_password trendorabay > backup_$DATE.sql
```

**Set up Cron Job**
```bash
0 2 * * * /path/to/backup-script.sh
```

### Monitoring

**Recommended Tools**
- PM2 for process monitoring
- New Relic or Datadog for application monitoring
- MySQL slow query log for database performance
- Log aggregation with ELK stack or similar

---

## Troubleshooting

### Common Issues

#### Backend Issues

**Server Won't Start**
- Check if port 5000 is already in use
- Verify database connection in `.env` file
- Check MySQL service is running
- Review server logs for error messages

**Database Connection Errors**
- Verify database credentials in `.env`
- Ensure MySQL server is accessible
- Check database exists and schema is imported
- Verify network connectivity to database server

**API Errors**
- Check JWT token is valid and not expired
- Verify CORS configuration allows your frontend origin
- Review rate limiting headers if getting 429 errors
- Check request payload matches expected format

#### Frontend Issues

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

**API Connection Issues**
- Ensure backend server is running
- Check API base URL in `src/services/api.js`
- Verify CORS configuration on backend
- Check network connectivity between frontend and backend

**Authentication Issues**
- Clear localStorage and re-login
- Verify JWT token is being sent in Authorization header
- Check backend authentication endpoints are working
- Review token expiration settings

#### Database Issues

**Slow Queries**
- Add missing indexes on frequently queried columns
- Use EXPLAIN to analyze query execution plans
- Consider partitioning large tables
- Archive old data periodically

**Connection Pool Exhaustion**
- Increase database connection pool size
- Implement connection timeout settings
- Review application for connection leaks
- Use connection pooling middleware

**Disk Space Issues**
- Implement data archival for old records
- Clean up temporary files and logs
- Monitor table sizes and growth rates
- Consider database compression

### Performance Optimization

**Backend Optimization**
- Enable database query caching
- Implement response caching for static data
- Use connection pooling
- Optimize N+1 queries
- Implement pagination for large datasets

**Frontend Optimization**
- Code splitting with React.lazy
- Image optimization and lazy loading
- Implement virtual scrolling for large lists
- Use memoization for expensive computations
- Optimize bundle size with tree shaking

**Database Optimization**
- Regular table optimization: `OPTIMIZE TABLE`
- Update statistics: `ANALYZE TABLE`
- Monitor and optimize slow queries
- Implement read replicas for reporting
- Use appropriate data types

### Debugging Tips

**Enable Debug Logging**
```javascript
// Backend
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

**Database Query Logging**
```javascript
// Log slow queries
const slowQueryLog = 'slow-query.log';
```

**Frontend Debugging**
- Use React DevTools for component inspection
- Enable Redux DevTools if using Redux
- Use browser network tab for API debugging
- Implement error boundaries for better error reporting

---

## Support and Maintenance

### Regular Maintenance Tasks

**Weekly**
- Review error logs
- Monitor server performance
- Check disk space usage
- Review security updates

**Monthly**
- Update dependencies
- Review and optimize slow queries
- Backup verification
- Security audit

**Quarterly**
- Performance review
- Capacity planning
- Disaster recovery testing
- Documentation updates

### Getting Help

For issues and questions:
1. Check this documentation first
2. Review error logs and messages
3. Search existing issues in repository
4. Create a new issue with detailed information
5. Include steps to reproduce the problem

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following existing code style
4. Test thoroughly
5. Update documentation as needed
6. Submit a pull request with descriptive message

---

## Appendix

### Environment Variables Reference

**Backend (.env)**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trendorabay
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Frontend**
- API base URL configured in `src/services/api.js`
- No additional environment variables required for basic setup

### Port Reference

- **Backend API**: 5000
- **Frontend Dev Server**: 5173
- **MySQL**: 3306 (default)

### File Size Limits

- **Request Body**: 10MB
- **File Uploads**: Configured in Multer middleware
- **Database Text Fields**: LONGTEXT for large content

### Default Credentials

**Initial Setup**
- No default users - registration required
- First registered user can be promoted to admin via database
- Default database user: root (from MySQL installation)

### License

ISC

---

**End of Documentation**
