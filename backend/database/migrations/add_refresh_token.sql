-- Add refresh_token column to cms_users table
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(500) UNIQUE;
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMP NULL;
