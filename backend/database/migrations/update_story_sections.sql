-- Update display_section ENUM to match trendorabay website sections
USE trendorabay;

-- Modify the display_section column to use the new section values
ALTER TABLE stories MODIFY COLUMN display_section ENUM('default', 'latest_stories', 'must_read', 'innovation') DEFAULT 'default';
