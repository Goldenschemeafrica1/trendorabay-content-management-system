-- Community Members table
CREATE TABLE IF NOT EXISTS community_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  community_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
  status ENUM('active', 'banned', 'pending') DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES cms_users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_community_user (community_id, user_id),
  INDEX idx_community_id (community_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_role (role)
);
