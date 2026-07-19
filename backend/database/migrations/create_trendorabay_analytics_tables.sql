-- Create trendorabay_traffic_sources table
CREATE TABLE IF NOT EXISTS trendorabay_traffic_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_name VARCHAR(100) NOT NULL,
  percentage INT NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create trendorabay_device_types table
CREATE TABLE IF NOT EXISTS trendorabay_device_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_name VARCHAR(50) NOT NULL,
  percentage INT NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create trendorabay_countries table
CREATE TABLE IF NOT EXISTS trendorabay_countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  percentage INT NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial mock data for trendorabay_traffic_sources
INSERT INTO trendorabay_traffic_sources (source_name, percentage, color) VALUES
('Organic Search', 52, '#3b82f6'),
('Direct', 20, '#10b981'),
('Social Media', 15, '#f59e0b'),
('Referral', 13, '#ef4444')
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), color = VALUES(color);

-- Insert initial mock data for trendorabay_device_types
INSERT INTO trendorabay_device_types (device_name, percentage, color) VALUES
('Desktop', 45, '#3b82f6'),
('Mobile', 48, '#10b981'),
('Tablet', 7, '#f59e0b')
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), color = VALUES(color);

-- Insert initial mock data for trendorabay_countries
INSERT INTO trendorabay_countries (country_name, percentage, color) VALUES
('Nigeria', 40, '#3b82f6'),
('United States', 15, '#10b981'),
('United Kingdom', 12, '#f59e0b'),
('Ghana', 10, '#ef4444'),
('Kenya', 8, '#ec4899')
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), color = VALUES(color);
