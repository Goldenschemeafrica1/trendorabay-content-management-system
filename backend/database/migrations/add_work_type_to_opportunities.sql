-- Add work_type column to opportunities table
ALTER TABLE opportunities ADD COLUMN work_type ENUM('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Volunteer', 'Remote', 'Hybrid') DEFAULT NULL AFTER category;
