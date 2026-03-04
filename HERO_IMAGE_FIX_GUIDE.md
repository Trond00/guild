# Hero Image Fix Guide

## Problem Summary

The frontpage hero was not using the hero image selected in the admin page and was always falling back to the backup picture `/expurgedforside.png`.

## Root Cause

There was a disconnect between:

1. **Admin Frontpage Page**: Only saved hero image selection to `localStorage`
2. **Main Frontpage**: Only queried the Supabase database for images with `category = 'hero'`

Since no images in the database had the `hero` category, the frontpage always fell back to the default image.

## Solution Implemented

### 1. Updated Admin Frontpage (`src/app/admin/frontpage/page.tsx`)

- **Before**: Only saved to `localStorage`
- **After**: Now properly updates the database by:
  - Resetting all images with `category = 'hero'` back to `'art'`
  - Setting the selected image's category to `'hero'`
  - Also saves to `localStorage` for backward compatibility

### 2. Updated Main Frontpage (`src/app/page.tsx`)

- **Before**: Only queried database, ignored `localStorage`
- **After**: Now has a fallback system:
  1. First tries to fetch from database (images with `category = 'hero'`)
  2. If database query fails or no hero image found, falls back to `localStorage`
  3. If neither exists, uses default image

### 3. Database Structure

The solution uses your existing `images` table with the `category` column to mark which image should be the hero image.

## Steps to Complete the Fix

### Step 1: Run the Supabase Setup Script

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and run the contents of `supabase_setup.sql`
4. This ensures your database has the proper structure and indexes

### Step 2: Test the Fix

1. **Upload an image**:
   - Go to Admin → Images
   - Upload a new image (it will default to category 'art')

2. **Set as hero image**:
   - Go to Admin → Frontpage Settings
   - Select your uploaded image
   - Click "Save Selection"
   - You should see "Hero image saved successfully!"

3. **Verify on frontpage**:
   - Visit your main website
   - The hero section should now display your selected image
   - Open browser dev tools and check the console for debug messages

### Step 3: Troubleshooting

#### If the hero image still doesn't appear:

1. **Check database**: Run this query in Supabase SQL Editor:

   ```sql
   SELECT id, filename, category, url FROM images WHERE category = 'hero';
   ```

   - Should return exactly 1 row with your selected image

2. **Check console logs**: Open browser dev tools and look for messages like:
   - "Hero image from database: [URL]"
   - "Using hero image from localStorage: [URL]"
   - "No hero image found, using default"

3. **Check localStorage**: In browser dev tools console, run:
   ```javascript
   localStorage.getItem("heroImage");
   ```

   - Should return your selected image URL

#### If you see multiple hero images:

- The admin panel should automatically reset other images when you save a new selection
- If not, run this query to reset:
  ```sql
  UPDATE images SET category = 'art' WHERE category = 'hero';
  ```

## How It Works

### Database Flow:

1. User selects image in Admin → Frontpage Settings
2. Admin updates database: `UPDATE images SET category = 'hero' WHERE id = [selected_id]`
3. Admin also resets other hero images: `UPDATE images SET category = 'art' WHERE category = 'hero'`
4. Frontpage queries: `SELECT url FROM images WHERE category = 'hero' LIMIT 1`
5. Frontpage displays the returned image

### Fallback Flow:

1. If database query fails → Check `localStorage.getItem('heroImage')`
2. If localStorage is empty or default → Use `/expurgedforside.png`

## Files Modified:

- `src/app/admin/frontpage/page.tsx` - Updated hero image saving logic
- `src/app/page.tsx` - Updated hero image fetching with fallback system
- `supabase_setup.sql` - Database setup script (new file)

## Testing Checklist:

- [ ] Run supabase_setup.sql in Supabase SQL Editor
- [ ] Upload a test image in Admin → Images
- [ ] Set the image as hero in Admin → Frontpage Settings
- [ ] Verify the image appears on the main frontpage
- [ ] Check browser console for successful debug messages
- [ ] Test fallback by temporarily removing hero category from database

The fix ensures that your hero image selection in the admin panel will now properly reflect on the frontpage!
