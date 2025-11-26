-- ============================================================================
-- Migration: Convert user_profiles from metric to imperial units
-- ============================================================================
-- This migration changes height_cm to height_inches and weight_kg to weight_lbs
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Add new columns
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS height_inches NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS weight_lbs NUMERIC(6,2);

-- Step 2: Convert existing data (if any)
-- This converts cm to inches and kg to lbs
UPDATE user_profiles 
SET 
  height_inches = height_cm / 2.54,
  weight_lbs = weight_kg / 0.453592
WHERE height_cm IS NOT NULL AND weight_kg IS NOT NULL;

-- Step 3: Drop old columns
ALTER TABLE user_profiles 
  DROP COLUMN IF EXISTS height_cm,
  DROP COLUMN IF EXISTS weight_kg;

-- Step 4: Add constraints to new columns
ALTER TABLE user_profiles 
  ALTER COLUMN height_inches SET NOT NULL,
  ALTER COLUMN weight_lbs SET NOT NULL;

ALTER TABLE user_profiles 
  ADD CONSTRAINT check_height_inches CHECK (height_inches > 0),
  ADD CONSTRAINT check_weight_lbs CHECK (weight_lbs > 0);

-- Verification: Check the updated schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('height_inches', 'weight_lbs', 'height_cm', 'weight_kg')
ORDER BY column_name;

-- ============================================================================
-- Expected result after migration:
-- column_name     | data_type | is_nullable
-- ----------------+-----------+-------------
-- height_inches   | numeric   | NO
-- weight_lbs      | numeric   | NO
-- ============================================================================

