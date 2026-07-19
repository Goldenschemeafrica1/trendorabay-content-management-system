-- Create traffic_sources table
CREATE TABLE IF NOT EXISTS traffic_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_name VARCHAR(100) NOT NULL,
  percentage INT NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#8b5cf6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create device_types table
CREATE TABLE IF NOT EXISTS device_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_name VARCHAR(50) NOT NULL,
  percentage INT NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#8b5cf6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  percentage INT NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#8b5cf6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial mock data for traffic_sources
INSERT INTO traffic_sources (source_name, percentage, color) VALUES
('Organic Search', 45, '#8b5cf6'),
('Direct', 25, '#10b981'),
('Social Media', 18, '#f59e0b'),
('Referral', 12, '#ef4444')
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), color = VALUES(color);

-- Insert initial mock data for device_types
INSERT INTO device_types (device_name, percentage, color) VALUES
('Desktop', 52, '#8b5cf6'),
('Mobile', 38, '#10b981'),
('Tablet', 10, '#f59e0b')
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), color = VALUES(color);

-- Insert initial mock data for countries
INSERT INTO countries (country_name, percentage, color) VALUES
('United States', 35, '#8b5cf6'),
('United Kingdom', 18, '#10b981'),
('Germany', 12, '#f59e0b'),
('France', 10, '#ef4444'),
('Canada', 8, '#ec4899')
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), color = VALUES(color);
