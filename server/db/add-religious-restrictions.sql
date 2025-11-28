-- ============================================================================
-- Add Religious Dietary Restrictions to user_preferences
-- ============================================================================
-- This migration adds support for halal, kosher, and hindu dietary restrictions
--
-- USAGE:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Paste this file
-- 5. Click "Run" to execute
-- ============================================================================

-- Add new columns for religious dietary restrictions
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS is_halal BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_kosher BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_hindu_non_veg BOOLEAN DEFAULT FALSE NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.is_halal IS 'User follows halal dietary laws';
COMMENT ON COLUMN user_preferences.is_kosher IS 'User follows kosher dietary laws';
COMMENT ON COLUMN user_preferences.is_hindu_non_veg IS 'User follows Hindu dietary restrictions (no beef)';

