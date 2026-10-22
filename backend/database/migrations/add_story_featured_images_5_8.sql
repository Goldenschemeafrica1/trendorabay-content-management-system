-- Add additional featured image columns to stories table
ALTER TABLE stories
ADD COLUMN featured_image_url_5 VARCHAR(500) AFTER featured_image_url_4,
ADD COLUMN featured_image_url_6 VARCHAR(500) AFTER featured_image_url_5,
ADD COLUMN featured_image_url_7 VARCHAR(500) AFTER featured_image_url_6,
ADD COLUMN featured_image_url_8 VARCHAR(500) AFTER featured_image_url_7;
