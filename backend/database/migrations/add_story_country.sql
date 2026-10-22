-- Add country column to stories table
ALTER TABLE stories
ADD COLUMN country VARCHAR(100) AFTER category_id;
