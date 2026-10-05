-- Add phone_number column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(100);
