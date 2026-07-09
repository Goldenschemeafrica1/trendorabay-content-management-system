-- Add indexes to improve query performance
USE trendorabay;

-- Stories table indexes
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_category_id ON stories(category_id);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON stories(published_at DESC);

-- Magazines table indexes
CREATE INDEX IF NOT EXISTS idx_magazines_category_id ON magazines(category_id);
CREATE INDEX IF NOT EXISTS idx_magazines_published_date ON magazines(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_magazines_created_at ON magazines(created_at DESC);

-- Podcasts table indexes
CREATE INDEX IF NOT EXISTS idx_podcasts_category_id ON podcasts(category_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_host_id ON podcasts(host_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_published_at ON podcasts(published_at DESC);

-- Authors table indexes
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- CMS Users table indexes
CREATE INDEX IF NOT EXISTS idx_cms_users_email ON cms_users(email);
CREATE INDEX IF NOT EXISTS idx_cms_users_role ON cms_users(role);
CREATE INDEX IF NOT EXISTS idx_cms_users_status ON cms_users(status);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Partners table indexes
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at DESC);

-- Sponsorships table indexes
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_partner_id ON sponsorships(partner_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_dates ON sponsorships(start_date, end_date);

-- Subscribers table indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_plan_id ON subscribers(plan_id);

-- Contributors table indexes
CREATE INDEX IF NOT EXISTS idx_contributors_email ON contributors(email);
CREATE INDEX IF NOT EXISTS idx_contributors_status ON contributors(status);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Community Posts table indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_published_at ON community_posts(published_at DESC);

-- Email Templates table indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(template_name);

-- Team Members table indexes
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);

-- Advertisement Inquiries table indexes
CREATE INDEX IF NOT EXISTS idx_ad_inquiries_status ON advertisement_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_ad_inquiries_created_at ON advertisement_inquiries(created_at DESC);

-- Guest Applications table indexes
CREATE INDEX IF NOT EXISTS idx_guest_applications_status ON guest_applications(status);
CREATE INDEX IF NOT EXISTS idx_guest_applications_created_at ON guest_applications(created_at DESC);

-- Pitch Submissions table indexes
CREATE INDEX IF NOT EXISTS idx_pitch_submissions_status ON pitch_submissions(status);
CREATE INDEX IF NOT EXISTS idx_pitch_submissions_created_at ON pitch_submissions(created_at DESC);

-- Contact Messages table indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Analytics tables indexes
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_engagement_timestamp ON user_engagement(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);

-- Advertisements table indexes
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(active);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_advertisements_location ON advertisements(location);
