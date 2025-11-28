-- ============================================================================
-- Remove Foreign Key Constraints to auth.users
-- ============================================================================
-- Purpose: Remove FK constraints from user_profiles, user_preferences, 
--          and meal_logs to auth.users to allow testing without real auth
--
-- IMPORTANT: This is a temporary development fix. In production, you should
--            either:
--            1. Use real Supabase auth.users
--            2. Or create a local users table instead of referencing auth.users
--
-- Run this in Supabase SQL Editor to remove blocking constraints
-- ============================================================================

-- Get constraint names (for documentation purposes)
-- Uncomment to see current constraints before dropping:
/*
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (tc.table_name = 'user_profiles' 
         OR tc.table_name = 'user_preferences' 
         OR tc.table_name = 'meal_logs')
ORDER BY tc.table_name;
*/

-- ============================================================================
-- Drop Foreign Key Constraints
-- ============================================================================

-- Drop constraint from user_profiles.user_id -> auth.users(id)
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Drop constraint from user_preferences.user_id -> auth.users(id)
ALTER TABLE user_preferences
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

-- Drop constraint from meal_logs.user_id -> auth.users(id)
ALTER TABLE meal_logs
DROP CONSTRAINT IF EXISTS meal_logs_user_id_fkey;

-- ============================================================================
-- Verification
-- ============================================================================
-- Run this query to verify constraints are removed:
/*
SELECT
    tc.table_name,
    tc.constraint_type,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'user_profiles' 
         OR tc.table_name = 'user_preferences' 
         OR tc.table_name = 'meal_logs')
ORDER BY tc.table_name;
*/

-- ============================================================================
-- Result
-- ============================================================================
-- After running this migration:
-- ✅ user_profiles.user_id is now a regular UUID column (no FK constraint)
-- ✅ user_preferences.user_id is now a regular UUID column (no FK constraint)
-- ✅ meal_logs.user_id is now a regular UUID column (no FK constraint)
--
-- You can now:
-- - Insert test users with any valid UUID
-- - Test onboarding without Supabase Auth
-- - Develop locally without authentication overhead
--
-- REMINDER: In production, implement proper authentication or create
--           a dedicated users table.
-- ============================================================================

