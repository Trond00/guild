-- Content Sections Table Schema for About Us Management
-- Run this in your Supabase SQL editor to create the content management system

-- Create the content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance on section_key queries
CREATE INDEX IF NOT EXISTS idx_content_sections_key ON content_sections(section_key);

-- Insert default About Us content if it doesn't exist
INSERT INTO content_sections (section_key, title, content)
VALUES ('about_us', 'About Us', 'ExPurged is a legendary Horde guild on Ragnaros server, dedicated to conquering the greatest challenges Azeroth has to offer. From raiding the toughest dungeons to PvP glory, we stand united for the Horde''s supremacy.')
ON CONFLICT (section_key) DO NOTHING;

-- Create a function to update content with automatic timestamp update
CREATE OR REPLACE FUNCTION update_content_section(
  p_section_key TEXT,
  p_title TEXT,
  p_content TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN := FALSE;
BEGIN
  -- Update the content section
  UPDATE content_sections 
  SET title = p_title, 
      content = p_content, 
      updated_at = NOW()
  WHERE section_key = p_section_key;
  
  -- Check if the update was successful
  IF FOUND THEN
    result := TRUE;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Test query to verify the table was created successfully
SELECT * FROM content_sections WHERE section_key = 'about_us';