-- Partnership Inquiries table for public submissions
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(100),
  company_name VARCHAR(255),
  website_url VARCHAR(500),
  message TEXT,
  partnership_type VARCHAR(100),
  status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
