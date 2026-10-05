-- Add display settings columns to stories table
-- These columns control how stories appear on the trendorabay website

USE trendorabay;

-- Add display section column (featured, trending, latest, etc.)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS display_section ENUM('default', 'featured', 'trending', 'latest', 'spotlight') DEFAULT 'default' AFTER status;

-- Add display order column (for manual ordering within sections)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 AFTER display_section;

-- Add priority column (for category sorting)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0 AFTER display_order;

-- Add display start date (optional scheduling)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS display_start_date DATE NULL AFTER priority;

-- Add display end date (optional scheduling)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS display_end_date DATE NULL AFTER display_start_date;

-- Add is_pinned column (to pin stories to top of sections)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) DEFAULT 0 AFTER display_end_date;

-- Add index for efficient querying by display section and order
CREATE INDEX IF NOT EXISTS idx_stories_display_section_order ON stories(display_section, display_order);

-- Add index for pinned stories
CREATE INDEX IF NOT EXISTS idx_stories_pinned ON stories(is_pinned, display_section);

-- Add index for date-based display
CREATE INDEX IF NOT EXISTS idx_stories_display_dates ON stories(display_start_date, display_end_date);
