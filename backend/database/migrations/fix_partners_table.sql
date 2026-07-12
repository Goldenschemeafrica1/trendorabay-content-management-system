-- Fix partners table to include 'pending' status
ALTER TABLE partners MODIFY COLUMN status ENUM('active', 'inactive', 'pending') DEFAULT 'pending';

-- Insert sample partners data
INSERT INTO partners (name, logo_url, website_url, contact_email, status) VALUES
('TechCorp Inc', NULL, 'https://techcorp.com', 'partnerships@techcorp.com', 'active'),
('MediaHub LLC', NULL, 'https://mediahub.io', 'contact@mediahub.io', 'active'),
('Startup Ventures', NULL, 'https://startupventures.co', 'info@startupventures.co', 'pending'),
('Digital Solutions', NULL, 'https://digitalsolutions.com', 'sales@digitalsolutions.com', 'inactive');
