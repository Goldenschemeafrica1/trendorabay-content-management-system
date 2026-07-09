-- Performance Optimization: Add indexes for commonly queried columns
USE trendorabay;

-- Stories table indexes
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_category_id ON stories(category_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_stories_status_created_at ON stories(status, created_at);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(featured);

-- Authors table indexes
CREATE INDEX IF NOT EXISTS idx_authors_created_at ON authors(created_at);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- CMS Users table indexes
CREATE INDEX IF NOT EXISTS idx_cms_users_email ON cms_users(email);
CREATE INDEX IF NOT EXISTS idx_cms_users_role ON cms_users(role);
CREATE INDEX IF NOT EXISTS idx_cms_users_status ON cms_users(status);
CREATE INDEX IF NOT EXISTS idx_cms_users_email_status ON cms_users(email, status);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_cms_user_id ON users(cms_user_id);

-- Media table indexes
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, event_date);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Partners table indexes
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_status ON subscription_plans(status);

-- Subscribers table indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_plan_id ON subscribers(plan_id);

-- Contributors table indexes
CREATE INDEX IF NOT EXISTS idx_contributors_status ON contributors(status);
CREATE INDEX IF NOT EXISTS idx_contributors_email ON contributors(email);

-- Community posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- Podcasts table indexes
CREATE INDEX IF NOT EXISTS idx_podcasts_category_id ON podcasts(category_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_host_id ON podcasts(host_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_published_at ON podcasts(published_at);

-- Podcast hosts indexes
CREATE INDEX IF NOT EXISTS idx_podcast_hosts_status ON podcast_hosts(status);

-- Podcast guests indexes
CREATE INDEX IF NOT EXISTS idx_podcast_guests_status ON podcast_guests(status);

-- Advertisements indexes
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(active);
CREATE INDEX IF NOT EXISTS idx_advertisements_location ON advertisements(location);
CREATE INDEX IF NOT EXISTS idx_advertisements_priority ON advertisements(priority);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);

-- Guest applications indexes
CREATE INDEX IF NOT EXISTS idx_guest_applications_status ON guest_applications(status);
CREATE INDEX IF NOT EXISTS idx_guest_applications_email ON guest_applications(applicant_email);

-- Pitch submissions indexes
CREATE INDEX IF NOT EXISTS idx_pitch_submissions_status ON pitch_submissions(status);
CREATE INDEX IF NOT EXISTS idx_pitch_submissions_email ON pitch_submissions(email);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Advertisement inquiries indexes
CREATE INDEX IF NOT EXISTS idx_advertisement_inquiries_status ON advertisement_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_advertisement_inquiries_email ON advertisement_inquiries(contact_email);

-- Page views indexes (for analytics)
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(date);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);

-- User engagement indexes (for analytics)
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_timestamp ON user_engagement(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_engagement_action ON user_engagement(action);
