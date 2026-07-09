# CMS Backend API

Node.js + Express + MySQL backend for the Trendorabay CMS application.

## 📋 Overview

This backend provides a comprehensive RESTful API for the CMS, handling content management, user authentication, e-commerce, analytics, and community features.

## 🔧 Tech Stack

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

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)

### Setup Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Set up the database:**
```bash
mysql -u root -p < database/schema.sql
```

3. **Configure environment variables:**
   - Copy `.env` file (or create one)
   - Update database credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=trendorabay
     DB_PORT=3306
     PORT=5000
     JWT_SECRET=your_jwt_secret_key
     ```

## 🚀 Running the Server

Development mode (with auto-reload using nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

## 📡 API Endpoints

### Content Management

#### Stories
- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create a new story
- `GET /api/stories/:id` - Get a single story
- `PUT /api/stories/:id` - Update a story
- `DELETE /api/stories/:id` - Delete a story

#### Authors
- `GET /api/authors` - Get all authors
- `POST /api/authors` - Create a new author
- `GET /api/authors/:id` - Get a single author
- `PUT /api/authors/:id` - Update an author
- `DELETE /api/authors/:id` - Delete an author

#### Magazines
- `GET /api/magazines` - Get all magazines
- `POST /api/magazines` - Create a new magazine
- `GET /api/magazines/:id` - Get a single magazine
- `PUT /api/magazines/:id` - Update a magazine
- `DELETE /api/magazines/:id` - Delete a magazine

#### Podcasts
- `GET /api/podcasts` - Get all podcasts
- `POST /api/podcasts` - Create a new podcast
- `GET /api/podcasts/:id` - Get a single podcast
- `PUT /api/podcasts/:id` - Update a podcast
- `DELETE /api/podcasts/:id` - Delete a podcast

#### Podcast Hosts
- `GET /api/podcast-hosts` - Get all podcast hosts
- `POST /api/podcast-hosts` - Create a new host
- `GET /api/podcast-hosts/:id` - Get a single host
- `PUT /api/podcast-hosts/:id` - Update a host
- `DELETE /api/podcast-hosts/:id` - Delete a host

#### Podcast Guests
- `GET /api/podcast-guests` - Get all podcast guests
- `POST /api/podcast-guests` - Create a new guest
- `GET /api/podcast-guests/:id` - Get a single guest
- `PUT /api/podcast-guests/:id` - Update a guest
- `DELETE /api/podcast-guests/:id` - Delete a guest

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/:id` - Get a single category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### User Management

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a single user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user
- `PATCH /api/users/:id/status` - Ban/unban user

### E-commerce

#### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get a single product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

#### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get a single order
- `PUT /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order
- `PATCH /api/orders/:id/status` - Update order status

### Media Management

#### Media Library
- `GET /api/media` - Get all media files
- `POST /api/media` - Upload a new media file
- `DELETE /api/media/:id` - Delete media

### Advertising

#### Partners
- `GET /api/partners` - Get all partners
- `POST /api/partners` - Create a new partner
- `GET /api/partners/:id` - Get a single partner
- `PUT /api/partners/:id` - Update a partner
- `DELETE /api/partners/:id` - Delete a partner

#### Sponsorships
- `GET /api/sponsorships` - Get all sponsorships
- `POST /api/sponsorships` - Create a new sponsorship
- `GET /api/sponsorships/:id` - Get a single sponsorship
- `PUT /api/sponsorships/:id` - Update a sponsorship
- `DELETE /api/sponsorships/:id` - Delete a sponsorship

#### Advertisements
- `GET /api/advertisements` - Get all advertisements
- `POST /api/advertisements` - Create a new advertisement
- `GET /api/advertisements/:id` - Get a single advertisement
- `PUT /api/advertisements/:id` - Update an advertisement
- `DELETE /api/advertisements/:id` - Delete an advertisement

#### Advertisement Inquiries
- `GET /api/advertisement-inquiries` - Get all ad inquiries
- `POST /api/advertisement-inquiries` - Create a new inquiry
- `GET /api/advertisement-inquiries/:id` - Get a single inquiry
- `PUT /api/advertisement-inquiries/:id` - Update an inquiry
- `DELETE /api/advertisement-inquiries/:id` - Delete an inquiry

### Subscriptions

#### Subscription Plans
- `GET /api/plans` - Get all subscription plans
- `POST /api/plans` - Create a new plan
- `GET /api/plans/:id` - Get a single plan
- `PUT /api/plans/:id` - Update a plan
- `DELETE /api/plans/:id` - Delete a plan

#### Subscribers
- `GET /api/subscribers` - Get all subscribers
- `POST /api/subscribers` - Create a new subscriber
- `GET /api/subscribers/:id` - Get a single subscriber
- `PUT /api/subscribers/:id` - Update a subscriber
- `DELETE /api/subscribers/:id` - Delete a subscriber

### Community

#### Contributors
- `GET /api/contributors` - Get all contributors
- `POST /api/contributors` - Create a new contributor
- `GET /api/contributors/:id` - Get a single contributor
- `PUT /api/contributors/:id` - Update a contributor
- `DELETE /api/contributors/:id` - Delete a contributor

#### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get a single event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

#### Community Posts
- `GET /api/community` - Get all community posts
- `POST /api/community` - Create a new post
- `GET /api/community/:id` - Get a single post
- `PUT /api/community/:id` - Update a post
- `DELETE /api/community/:id` - Delete a post

### Guest Applications & Pitches

#### Guest Applications
- `GET /api/guest-applications` - Get all guest applications
- `POST /api/guest-applications` - Create a new application
- `GET /api/guest-applications/:id` - Get a single application
- `PUT /api/guest-applications/:id` - Update an application
- `DELETE /api/guest-applications/:id` - Delete an application

#### Pitch Submissions
- `GET /api/pitch-submissions` - Get all pitch submissions
- `POST /api/pitch-submissions` - Create a new submission
- `GET /api/pitch-submissions/:id` - Get a single submission
- `PUT /api/pitch-submissions/:id` - Update a submission
- `DELETE /api/pitch-submissions/:id` - Delete a submission

### Contact Messages

#### Contact Messages
- `GET /api/contact-messages` - Get all contact messages
- `POST /api/contact-messages` - Create a new message
- `GET /api/contact-messages/:id` - Get a single message
- `PUT /api/contact-messages/:id` - Update a message
- `DELETE /api/contact-messages/:id` - Delete a message

### Settings & Configuration

#### Site Settings
- `GET /api/settings/:key` - Get a setting value
- `PUT /api/settings/:key` - Update a setting value

#### SEO Settings
- `GET /api/seo/:page_name` - Get SEO settings for a page
- `PUT /api/seo/:page_name` - Update SEO settings for a page

#### Email Templates
- `GET /api/email-templates/:template_name` - Get an email template
- `PUT /api/email-templates/:template_name` - Update an email template

#### Team Members
- `GET /api/team` - Get all team members
- `POST /api/team` - Create a new team member
- `GET /api/team/:id` - Get a single team member
- `PUT /api/team/:id` - Update a team member
- `DELETE /api/team/:id` - Delete a team member

### Analytics

#### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/traffic` - Get traffic analytics
- `GET /api/analytics/engagement` - Get engagement analytics
- `GET /api/analytics/sales` - Get sales analytics

## 📊 Database Schema

The database includes tables for:
- **Users & CMS Users** - Authentication and authorization
- **Authors** - Content author profiles
- **Categories** - Content categorization
- **Stories** - Articles and blog posts
- **Magazines** - Digital magazine issues
- **Podcasts** - Audio content
- **Podcast Hosts** - Podcast presenters
- **Podcast Guests** - Episode guests
- **Media** - File uploads and media library
- **Products** - E-commerce products
- **Orders** - Customer orders
- **Order Items** - Order line items
- **Partners** - Advertising partners
- **Sponsorships** - Sponsorship deals
- **Advertisements** - Ad campaigns
- **Advertisement Inquiries** - Ad request inquiries
- **Subscription Plans** - Subscription tiers
- **Subscribers** - Subscription users
- **Contributors** - Community contributors
- **Events** - Events management
- **Community Posts** - Community discussions
- **Site Settings** - Global configuration
- **SEO Settings** - Page-specific SEO
- **Email Templates** - Customizable emails
- **Team Members** - Team profiles
- **Page Views** - Analytics tracking
- **User Engagement** - User activity tracking
- **Guest Applications** - Podcast guest requests
- **Pitch Submissions** - Content pitch requests
- **Contact Messages** - Contact form submissions

See `database/schema.sql` for complete schema definition.

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - 100 requests per 15 minutes (5 for auth routes)
- **XSS Protection** - Input sanitization middleware
- **CORS** - Configured for specific origins
- **Password Hashing** - Bcrypt for secure password storage
- **JWT Authentication** - Token-based authentication
- **Input Validation** - Express-validator for request validation

## ⚠️ Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

Error response format:
```json
{
  "error": "Error message description"
}
```

## 📁 Project Structure

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

## 🔧 Development

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

## 🚢 Deployment

1. Set environment variables in production
2. Ensure MySQL database is set up and schema is imported
3. Install dependencies: `npm install --production`
4. Start the server: `npm start`

For production deployment, consider using:
- Process manager (PM2)
- Reverse proxy (Nginx)
- SSL/TLS certificates
- Environment-specific configuration
