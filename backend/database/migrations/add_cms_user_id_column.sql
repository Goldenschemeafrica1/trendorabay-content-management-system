-- Add cms_user_id column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS cms_user_id INT UNIQUE;
