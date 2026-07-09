# CMS API Documentation

Complete API documentation for the Trendorabay CMS backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All endpoints return JSON responses:

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

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User
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

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Content Management Endpoints

### Stories

#### Get All Stories
**GET** `/stories`

Retrieve all stories with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `published`)
- `category_id` (optional): Filter by category
- `author_id` (optional): Filter by author
- `featured` (optional): Filter featured stories (`0`, `1`)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Sample Story",
      "slug": "sample-story",
      "content": "Story content here...",
      "excerpt": "Brief excerpt...",
      "featured_image_url": "http://example.com/image.jpg",
      "author_id": 1,
      "category_id": 1,
      "status": "published",
      "featured": 1,
      "published_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Story
**POST** `/stories`

Create a new story.

**Request Body:**
```json
{
  "title": "New Story",
  "slug": "new-story",
  "content": "Full story content...",
  "excerpt": "Brief excerpt",
  "featured_image_url": "http://example.com/image.jpg",
  "author_id": 1,
  "category_id": 1,
  "status": "draft",
  "featured": 0
}
```

**Response (201):**
```json
{
  "message": "Story created successfully",
  "data": {
    "id": 2,
    "title": "New Story",
    "slug": "new-story",
    ...
  }
}
```

#### Get Single Story
**GET** `/stories/:id`

Retrieve a specific story by ID.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "title": "Sample Story",
    "slug": "sample-story",
    ...
  }
}
```

#### Update Story
**PUT** `/stories/:id`

Update an existing story.

**Request Body:** Same as create story

**Response (200):**
```json
{
  "message": "Story updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Story",
    ...
  }
}
```

#### Delete Story
**DELETE** `/stories/:id`

Delete a story.

**Response (200):**
```json
{
  "message": "Story deleted successfully"
}
```

### Authors

#### Get All Authors
**GET** `/authors`

Retrieve all authors.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Jane Smith",
      "bio": "Author bio...",
      "avatar_url": "http://example.com/avatar.jpg",
      "email": "jane@example.com",
      "social_links": {
        "twitter": "@janesmith",
        "linkedin": "jane-smith"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Author
**POST** `/authors`

Create a new author.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "bio": "Author bio...",
  "avatar_url": "http://example.com/avatar.jpg",
  "email": "jane@example.com",
  "social_links": {
    "twitter": "@janesmith",
    "linkedin": "jane-smith"
  }
}
```

**Response (201):**
```json
{
  "message": "Author created successfully",
  "data": { "id": 1, ... }
}
```

#### Get Single Author
**GET** `/authors/:id`

Retrieve a specific author.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Jane Smith",
    ...
  }
}
```

#### Update Author
**PUT** `/authors/:id`

Update an author.

**Request Body:** Same as create author

**Response (200):**
```json
{
  "message": "Author updated successfully",
  "data": { "id": 1, ... }
}
```

#### Delete Author
**DELETE** `/authors/:id`

Delete an author.

**Response (200):**
```json
{
  "message": "Author deleted successfully"
}
```

### Magazines

#### Get All Magazines
**GET** `/magazines`

Retrieve all magazines.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Tech Monthly",
      "issue": "January 2024",
      "description": "Monthly tech magazine...",
      "cover_image_url": "http://example.com/cover.jpg",
      "pdf_url": "http://example.com/magazine.pdf",
      "category_id": 1,
      "published_date": "2024-01-01",
      "price": 9.99,
      "digital_price": 4.99,
      "print_price": 12.99,
      "subscription_price": 8.99,
      "pages": 120,
      "language": "English",
      "publisher": "Tech Publishing",
      "rating": 4.5,
      "review_count": 150,
      "table_of_contents": "Content list...",
      "contributors": "Contributor list...",
      "preview_pages": "1-10",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Magazine
**POST** `/magazines`

Create a new magazine.

**Request Body:**
```json
{
  "title": "Tech Monthly",
  "issue": "January 2024",
  "description": "Monthly tech magazine...",
  "cover_image_url": "http://example.com/cover.jpg",
  "pdf_url": "http://example.com/magazine.pdf",
  "category_id": 1,
  "published_date": "2024-01-01",
  "price": 9.99,
  "digital_price": 4.99,
  "print_price": 12.99,
  "subscription_price": 8.99,
  "pages": 120,
  "language": "English",
  "publisher": "Tech Publishing"
}
```

**Response (201):**
```json
{
  "message": "Magazine created successfully",
  "data": { "id": 1, ... }
}
```

#### Get Single Magazine
**GET** `/magazines/:id`

Retrieve a specific magazine.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "title": "Tech Monthly",
    ...
  }
}
```

#### Update Magazine
**PUT** `/magazines/:id`

Update a magazine.

**Request Body:** Same as create magazine

**Response (200):**
```json
{
  "message": "Magazine updated successfully",
  "data": { "id": 1, ... }
}
```

#### Delete Magazine
**DELETE** `/magazines/:id`

Delete a magazine.

**Response (200):**
```json
{
  "message": "Magazine deleted successfully"
}
```

### Podcasts

#### Get All Podcasts
**GET** `/podcasts`

Retrieve all podcasts.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Tech Talk",
      "episode_number": 45,
      "description": "Weekly tech discussion...",
      "cover_art_url": "http://example.com/cover.jpg",
      "audio_file_url": "http://example.com/audio.mp3",
      "category_id": 1,
      "host_id": 1,
      "published_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Podcast
**POST** `/podcasts`

Create a new podcast.

**Request Body:**
```json
{
  "title": "Tech Talk",
  "episode_number": 45,
  "description": "Weekly tech discussion...",
  "cover_art_url": "http://example.com/cover.jpg",
  "audio_file_url": "http://example.com/audio.mp3",
  "category_id": 1,
  "host_id": 1
}
```

**Response (201):**
```json
{
  "message": "Podcast created successfully",
  "data": { "id": 1, ... }
}
```

#### Get Single Podcast
**GET** `/podcasts/:id`

Retrieve a specific podcast.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "title": "Tech Talk",
    ...
  }
}
```

#### Update Podcast
**PUT** `/podcasts/:id`

Update a podcast.

**Request Body:** Same as create podcast

**Response (200):**
```json
{
  "message": "Podcast updated successfully",
  "data": { "id": 1, ... }
}
```

#### Delete Podcast
**DELETE** `/podcasts/:id`

Delete a podcast.

**Response (200):**
```json
{
  "message": "Podcast deleted successfully"
}
```

### Categories

#### Get All Categories
**GET** `/categories`

Retrieve all categories.

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Tech-related content",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Category
**POST** `/categories`

Create a new category.

**Request Body:**
```json
{
  "name": "Technology",
  "slug": "technology",
  "description": "Tech-related content"
}
```

**Response (201):**
```json
{
  "message": "Category created successfully",
  "data": { "id": 1, ... }
}
```

#### Get Single Category
**GET** `/categories/:id`

Retrieve a specific category.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Technology",
    ...
  }
}
```

#### Update Category
**PUT** `/categories/:id`

Update a category.

**Request Body:** Same as create category

**Response (200):**
```json
{
  "message": "Category updated successfully",
  "data": { "id": 1, ... }
}
```

#### Delete Category
**DELETE** `/categories/:id`

Delete a category.

**Response (200):**
```json
{
  "message": "Category deleted successfully"
}
```

---

## User Management Endpoints

### Users

#### Get All Users
**GET** `/users`

Retrieve all users.

**Query Parameters:**
- `role` (optional): Filter by role
- `status` (optional): Filter by status (`active`, `banned`)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "cms_user_id": 1,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "admin",
      "profile_image_url": "http://example.com/avatar.jpg",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create User
**POST** `/users`

Create a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "admin",
  "profile_image_url": "http://example.com/avatar.jpg"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "data": { "id": 1, ... }
}
```

#### Get Single User
**GET** `/users/:id`

Retrieve a specific user.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "username": "johndoe",
    ...
  }
}
```

#### Update User
**PUT** `/users/:id`

Update a user.

**Request Body:** Same as create user (password optional)

**Response (200):**
```json
{
  "message": "User updated successfully",
  "data": { "id": 1, ... }
}
```

#### Delete User
**DELETE** `/users/:id`

Delete a user.

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

#### Update User Status
**PATCH** `/users/:id/status`

Ban or unban a user.

**Request Body:**
```json
{
  "status": "banned"
}
```

**Response (200):**
```json
{
  "message": "User status updated successfully",
  "data": {
    "id": 1,
    "status": "banned"
  }
}
```

---

## E-commerce Endpoints

### Products

#### Get All Products
**GET** `/products`

Retrieve all products.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status (`active`, `inactive`)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "CMS T-Shirt",
      "description": "Official CMS merchandise t-shirt",
      "price": 29.99,
      "stock": 100,
      "image_url": "http://example.com/product.jpg",
      "category": "Apparel",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Product
**POST** `/products`

Create a new product.

**Request Body:**
```json
{
  "name": "CMS T-Shirt",
  "description": "Official CMS merchandise t-shirt",
  "price": 29.99,
  "stock": 100,
  "image_url": "http://example.com/product.jpg",
  "category": "Apparel",
  "status": "active"
}
```

**Response (201):**
```json
{
  "message": "Product created successfully",
  "data": { "id": 1, ... }
}
```

#### Get Single Product
**GET** `/products/:id`

Retrieve a specific product.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "CMS T-Shirt",
    ...
  }
}
```

#### Update Product
**PUT** `/products/:id`

Update a product.

**Request Body:** Same as create product

**Response (200):**
```json
{
  "message": "Product updated successfully",
  "data": { "id": 1, ... }
}
```

#### Delete Product
**DELETE** `/products/:id`

Delete a product.

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

### Orders

#### Get All Orders
**GET** `/orders`

Retrieve all orders.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2024-001",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "total_amount": 59.98,
      "status": "processing",
      "shipping_address": "123 Main St, City, State 12345",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Order
**POST** `/orders`

Create a new order.

**Request Body:**
```json
{
  "order_number": "ORD-2024-001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "total_amount": 59.98,
  "shipping_address": "123 Main St, City, State 12345",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 29.99
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "data": { "id": 1, ... }
}
```

#### Get Single Order
**GET** `/orders/:id`

Retrieve a specific order.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "order_number": "ORD-2024-001",
    ...
  }
}
```

#### Update Order
**PUT** `/orders/:id`

Update an order.

**Request Body:** Same as create order

**Response (200):**
```json
{
  "message": "Order updated successfully",
  "data": { "id": 1, ... }
}
```

#### Delete Order
**DELETE** `/orders/:id`

Delete an order.

**Response (200):**
```json
{
  "message": "Order deleted successfully"
}
```

#### Update Order Status
**PATCH** `/orders/:id/status`

Update order status.

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Response (200):**
```json
{
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "status": "shipped"
  }
}
```

---

## Media Management Endpoints

### Media Library

#### Get All Media
**GET** `/media`

Retrieve all media files.

**Query Parameters:**
- `folder` (optional): Filter by folder
- `file_type` (optional): Filter by file type

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "filename": "image_123.jpg",
      "original_name": "photo.jpg",
      "file_url": "http://localhost:5000/uploads/image_123.jpg",
      "file_type": "image/jpeg",
      "file_size": 1024000,
      "folder": "images",
      "uploaded_by": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Upload Media
**POST** `/media`

Upload a new media file.

**Request:** `multipart/form-data`
- `file`: The file to upload
- `folder` (optional): Folder name for organization

**Response (201):**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "filename": "image_123.jpg",
    "file_url": "http://localhost:5000/uploads/image_123.jpg",
    ...
  }
}
```

#### Delete Media
**DELETE** `/media/:id`

Delete a media file.

**Response (200):**
```json
{
  "message": "Media deleted successfully"
}
```

---

## Analytics Endpoints

### Get Analytics Data
**GET** `/analytics`

Retrieve general analytics data.

**Response (200):**
```json
{
  "data": {
    "total_users": 1500,
    "total_stories": 250,
    "total_orders": 500,
    "total_revenue": 15000.00
  }
}
```

### Get Traffic Analytics
**GET** `/analytics/traffic`

Retrieve traffic analytics.

**Query Parameters:**
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Response (200):**
```json
{
  "data": {
    "page_views": 50000,
    "unique_visitors": 15000,
    "avg_session_duration": 300,
    "bounce_rate": 0.45
  }
}
```

### Get Engagement Analytics
**GET** `/analytics/engagement`

Retrieve engagement analytics.

**Response (200):**
```json
{
  "data": {
    "total_interactions": 25000,
    "comments": 5000,
    "shares": 3000,
    "likes": 17000
  }
}
```

### Get Sales Analytics
**GET** `/analytics/sales`

Retrieve sales analytics.

**Query Parameters:**
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Response (200):**
```json
{
  "data": {
    "total_revenue": 15000.00,
    "total_orders": 500,
    "avg_order_value": 30.00,
    "conversion_rate": 0.03
  }
}
```

---

## Settings Endpoints

### Site Settings

#### Get Setting
**GET** `/settings/:key`

Retrieve a specific site setting.

**Response (200):**
```json
{
  "data": {
    "setting_key": "site_title",
    "setting_value": "My CMS Site"
  }
}
```

#### Update Setting
**PUT** `/settings/:key`

Update a site setting.

**Request Body:**
```json
{
  "setting_value": "New Site Title"
}
```

**Response (200):**
```json
{
  "message": "Setting updated successfully",
  "data": {
    "setting_key": "site_title",
    "setting_value": "New Site Title"
  }
}
```

### SEO Settings

#### Get SEO Settings
**GET** `/seo/:page_name`

Retrieve SEO settings for a specific page.

**Response (200):**
```json
{
  "data": {
    "page_name": "homepage",
    "meta_title": "Home - My CMS",
    "meta_description": "Welcome to my CMS",
    "og_title": "Home - My CMS",
    "og_description": "Welcome to my CMS",
    "og_image": "http://example.com/og-image.jpg"
  }
}
```

#### Update SEO Settings
**PUT** `/seo/:page_name`

Update SEO settings for a specific page.

**Request Body:**
```json
{
  "meta_title": "New Meta Title",
  "meta_description": "New meta description",
  "og_title": "New OG Title",
  "og_description": "New OG description",
  "og_image": "http://example.com/new-og-image.jpg"
}
```

**Response (200):**
```json
{
  "message": "SEO settings updated successfully",
  "data": { "page_name": "homepage", ... }
}
```

### Email Templates

#### Get Email Template
**GET** `/email-templates/:template_name`

Retrieve an email template.

**Response (200):**
```json
{
  "data": {
    "template_name": "welcome_email",
    "subject": "Welcome to Our CMS",
    "content": "<h1>Welcome!</h1><p>Thank you for joining...</p>"
  }
}
```

#### Update Email Template
**PUT** `/email-templates/:template_name`

Update an email template.

**Request Body:**
```json
{
  "subject": "New Subject",
  "content": "<h1>New Content</h1><p>Updated content...</p>"
}
```

**Response (200):**
```json
{
  "message": "Email template updated successfully",
  "data": { "template_name": "welcome_email", ... }
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP

When rate limit is exceeded, the API returns:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": "Descriptive error message"
}
```

Common error scenarios:
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side error

## Pagination

Some endpoints support pagination via query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Example: `GET /stories?page=2&limit=20`

## Sorting

Some endpoints support sorting via query parameters:

- `sort_by`: Field to sort by
- `order`: Sort order (`asc` or `desc`)

Example: `GET /stories?sort_by=created_at&order=desc`

## Testing

You can test the API using tools like:
- Postman
- curl
- HTTPie

Example curl request:
```bash
curl -X GET http://localhost:5000/api/stories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
