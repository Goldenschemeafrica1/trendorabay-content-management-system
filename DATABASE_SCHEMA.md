# Database Schema Documentation

Complete database schema documentation for the Trendorabay CMS.

## Database Name

`trendorabay`

## Overview

The CMS database consists of 30+ tables organized into the following categories:

- **Authentication & Users**: User management and authentication
- **Content Management**: Stories, authors, magazines, podcasts, categories
- **E-commerce**: Products, orders, subscriptions
- **Advertising**: Partners, sponsorships, advertisements
- **Community**: Contributors, events, community posts
- **Configuration**: Settings, SEO, email templates, team
- **Analytics**: Page views, user engagement
- **Forms & Submissions**: Guest applications, pitch submissions, contact messages

---

## Authentication & Users

### cms_users

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

**Relationships:**
- One-to-many with `media` (uploaded_by)
- One-to-many with `community_posts` (author_id)
- One-to-many with `user_engagement` (user_id)

### users

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

**Relationships:**
- Many-to-one with `cms_users` (cms_user_id)

---

## Content Management

### authors

Content author profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Author's name |
| bio | TEXT | NULL | Author biography |
| avatar_url | VARCHAR(500) | NULL | Profile image URL |
| email | VARCHAR(255) | NULL | Contact email |
| social_links | JSON | NULL | Social media links (twitter, linkedin, etc.) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Relationships:**
- One-to-many with `stories` (author_id)

### categories

Content categorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Category name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| description | TEXT | NULL | Category description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Relationships:**
- One-to-many with `stories` (category_id)
- One-to-many with `magazines` (category_id)
- One-to-many with `podcasts` (category_id)

### stories

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

**Relationships:**
- Many-to-one with `authors` (author_id)
- Many-to-one with `categories` (category_id)

### magazines

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

**Relationships:**
- Many-to-one with `categories` (category_id)

### podcasts

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

**Relationships:**
- Many-to-one with `categories` (category_id)
- Many-to-one with `podcast_hosts` (host_id)

### podcast_hosts

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

**Relationships:**
- One-to-many with `podcasts` (host_id)

### podcast_guests

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

---

## E-commerce

### products

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

**Relationships:**
- One-to-many with `order_items` (product_id)

### orders

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

**Relationships:**
- One-to-many with `order_items` (order_id)

### order_items

Individual items within an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| order_id | INT | FOREIGN KEY | Reference to orders.id |
| product_id | INT | FOREIGN KEY | Reference to products.id |
| quantity | INT | NOT NULL | Item quantity |
| price | DECIMAL(10,2) | NOT NULL | Price per item |

**Relationships:**
- Many-to-one with `orders` (order_id)
- Many-to-one with `products` (product_id)

### subscription_plans

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

**Relationships:**
- One-to-many with `subscribers` (plan_id)

### subscribers

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

**Relationships:**
- Many-to-one with `subscription_plans` (plan_id)

---

## Media Management

### media

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

**Relationships:**
- Many-to-one with `cms_users` (uploaded_by)

---

## Advertising

### partners

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

**Relationships:**
- One-to-many with `sponsorships` (partner_id)

### sponsorships

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

**Relationships:**
- Many-to-one with `partners` (partner_id)

### advertisements

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

### advertisement_inquiries

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

---

## Community

### contributors

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

### events

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

### community_posts

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

**Relationships:**
- Many-to-one with `cms_users` (author_id)

---

## Configuration

### site_settings

Global site configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | Setting key |
| setting_value | TEXT | NULL | Setting value |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### seo_settings

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

### email_templates

Customizable email templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| template_name | VARCHAR(100) | UNIQUE, NOT NULL | Template identifier |
| subject | VARCHAR(255) | NULL | Email subject |
| content | LONGTEXT | NULL | Email body (HTML) |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

### team_members

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

---

## Analytics

### page_views

Page view tracking for analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| page_url | VARCHAR(500) | NOT NULL | Page URL |
| view_count | INT | DEFAULT 0 | View count |
| date | DATE | NOT NULL | Tracking date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Indexes:**
- UNIQUE KEY `unique_page_date` (page_url, date)

### user_engagement

User engagement tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | FOREIGN KEY | Reference to cms_users.id |
| action | VARCHAR(100) | NOT NULL | Action type |
| page_url | VARCHAR(500) | NULL | Page URL |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Action timestamp |

**Relationships:**
- Many-to-one with `cms_users` (user_id)

---

## Forms & Submissions

### guest_applications

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

### pitch_submissions

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

### contact_messages

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

---

## Database Relationships

### Entity Relationship Summary

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

---

## Indexes

### Performance Indexes

The following indexes are defined for query optimization:

- `cms_users.email` - UNIQUE
- `users.cms_user_id` - UNIQUE
- `users.email` - INDEX
- `stories.slug` - UNIQUE
- `stories.author_id` - INDEX
- `stories.category_id` - INDEX
- `stories.status` - INDEX
- `categories.slug` - UNIQUE
- `magazines.category_id` - INDEX
- `podcasts.category_id` - INDEX
- `podcasts.host_id` - INDEX
- `orders.order_number` - UNIQUE
- `subscribers.email` - UNIQUE
- `site_settings.setting_key` - UNIQUE
- `seo_settings.page_name` - UNIQUE
- `email_templates.template_name` - UNIQUE
- `page_views.page_url` - INDEX
- `page_views.date` - INDEX
- `page_views` - UNIQUE KEY (page_url, date)

---

## Data Types

### Common Data Types

- **INT**: Integer values (auto-increment for primary keys)
- **VARCHAR(n)**: Variable-length strings up to n characters
- **TEXT**: Variable-length strings (unlimited)
- **LONGTEXT**: Variable-length strings for large content
- **DECIMAL(m,d)**: Fixed-point numbers (m total digits, d decimal places)
- **DATE**: Date values (YYYY-MM-DD)
- **TIMESTAMP**: Date and time values
- **BOOLEAN**: True/false values
- **TINYINT(1)**: Small integer (0 or 1, used as boolean)
- **JSON**: JSON data storage
- **ENUM**: Enumeration of predefined values

---

## Default Values

### Common Defaults

- **Timestamps**: `CURRENT_TIMESTAMP` for creation, `CURRENT_TIMESTAMP ON UPDATE` for updates
- **Status fields**: Typically 'active', 'pending', or 'draft'
- **Counters**: 0 for numeric counters
- **Boolean flags**: 0 (false) or TRUE
- **Foreign keys**: NULL (optional relationships)

---

## Constraints

### Constraint Types

- **PRIMARY KEY**: Unique identifier for each record
- **UNIQUE**: Ensures column values are unique
- **NOT NULL**: Column must have a value
- **FOREIGN KEY**: Enforces referential integrity between tables
- **DEFAULT**: Sets default value for column
- **AUTO_INCREMENT**: Automatically increments integer values

---

## Migration Notes

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

### Backup Recommendations

- Regular backups of the entire database
- Backup before schema changes
- Test backup restoration procedures

### Scaling Considerations

- Monitor table sizes and query performance
- Consider partitioning for large tables (page_views, user_engagement)
- Archive old data periodically
- Implement read replicas for reporting queries

---

## Security Considerations

### Password Storage

- All passwords stored in `cms_users.password` are hashed using bcrypt
- Never store plain text passwords
- Implement password complexity requirements

### Sensitive Data

- Email addresses are stored in multiple tables - ensure proper access controls
- Personal information (phone, addresses) should be protected
- Implement data encryption for sensitive fields if required

### Access Control

- Use the role-based access control system in `cms_users.role`
- Implement proper authentication middleware
- Validate and sanitize all user inputs

---

## Maintenance

### Regular Maintenance Tasks

- **Index optimization**: Run `OPTIMIZE TABLE` periodically
- **Statistics update**: Run `ANALYZE TABLE` for query optimization
- **Log cleanup**: Archive and delete old logs
- **Data archival**: Move old data to archive tables

### Monitoring

- Monitor table sizes and growth rates
- Track query performance
- Monitor disk space usage
- Set up alerts for unusual activity

---

## Troubleshooting

### Common Issues

**Foreign Key Errors:**
- Ensure referenced records exist before creating relationships
- Check data types match between foreign key and referenced key

**Duplicate Key Errors:**
- Check UNIQUE constraints before inserts
- Handle duplicate entries appropriately in application code

**Performance Issues:**
- Review query execution plans
- Add missing indexes
- Optimize slow queries
- Consider database scaling

---

## Additional Resources

- **Schema File**: `backend/database/schema.sql`
- **Migrations**: `backend/database/migrations/`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Backend Documentation**: `backend/README.md`
