-- Supabase Setup for Hero Image System
-- Run this in your Supabase SQL editor to ensure proper database structure

-- 1. Ensure the images table has the correct structure
-- (This assumes you already have an images table, but let's make sure it has the right columns)

-- Add category column if it doesn't exist (should already exist based on your code)
ALTER TABLE images ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'art';

-- Add display_name column if it doesn't exist (optional, for better image management)
ALTER TABLE images ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add order column if it doesn't exist (optional, for ordering images)
ALTER TABLE images ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Set default values for existing images
UPDATE images SET category = 'art' WHERE category IS NULL;
UPDATE images SET display_name = filename WHERE display_name IS NULL;
UPDATE images SET "order" = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at DESC)
  FROM images i2 
  WHERE i2.id = images.id
) WHERE "order" IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_order ON images("order");

-- 2. Optional: Create a view for hero images (makes it easier to query)
CREATE OR REPLACE VIEW hero_images AS
SELECT id, filename, url, description, category, uploaded_by, created_at
FROM images 
WHERE category = 'hero'
ORDER BY created_at DESC;

-- 3. Optional: Create a function to set hero image (alternative approach)
CREATE OR REPLACE FUNCTION set_hero_image(image_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  -- Reset all images to non-hero category
  UPDATE images SET category = 'art' WHERE category = 'hero';
  
  -- Set the selected image as hero
  UPDATE images SET category = 'hero' WHERE id = image_id;
  
  -- Check if the update was successful
  IF FOUND THEN
    result := TRUE;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Usage example for the function:
-- SELECT set_hero_image('your-image-uuid-here');

-- 4. Test queries to verify everything works:

-- Check all images with their categories
SELECT id, filename, category, created_at FROM images ORDER BY created_at DESC;

-- Check hero images specifically
SELECT id, filename, url, created_at FROM hero_images;

-- Check if there's currently a hero image set
SELECT COUNT(*) as hero_image_count FROM images WHERE category = 'hero';