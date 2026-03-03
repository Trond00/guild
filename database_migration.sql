-- Migration script to add display_name and order fields to images table
-- Run this in your Supabase SQL editor to add the new fields

-- Add display_name column (optional, will use filename as default)
ALTER TABLE images ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add order column (optional, will use created_at as default)
ALTER TABLE images ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Set default values for existing images
UPDATE images SET display_name = filename WHERE display_name IS NULL;
UPDATE images SET "order" = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at DESC)
  FROM images i2 
  WHERE i2.id = images.id
) WHERE "order" IS NULL;

-- Create index for better performance on order queries
CREATE INDEX IF NOT EXISTS idx_images_order ON images("order");
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);