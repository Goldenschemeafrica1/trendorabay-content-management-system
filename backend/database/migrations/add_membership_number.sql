-- Add membership_number column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_number VARCHAR(20);
ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS idx_membership_number (membership_number);
