-- Sync existing cms_users data to users table
-- This will update existing users records and add new ones
INSERT INTO users (cms_user_id, username, email, password, role, profile_image_url, created_at, updated_at)
SELECT id, name, email, password, role, profile_image_url, created_at, updated_at
FROM cms_users
ON DUPLICATE KEY UPDATE 
  cms_user_id = VALUES(cms_user_id),
  username = VALUES(username),
  email = VALUES(email),
  password = VALUES(password),
  role = VALUES(role),
  profile_image_url = VALUES(profile_image_url),
  updated_at = VALUES(updated_at);
