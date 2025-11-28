-- ============================================================================
-- UC Davis Diet Tracker - Database Schema
-- ============================================================================
-- Backend: Node.js + Express
-- Database: Supabase (PostgreSQL)
-- Auth: Supabase Auth
--
-- IMPORTANT NOTES:
-- - This schema is designed for Supabase PostgreSQL
-- - The auth.users table is managed by Supabase Auth (do NOT create it)
-- - Copy this entire file into the Supabase SQL Editor and execute
-- - Run this in a fresh database or carefully review DROP statements
--
-- USAGE:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire file
-- 5. Click "Run" to execute
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- OPTIONAL: Drop existing tables (CAUTION: This will delete all data!)
-- Uncomment the following block if you want to recreate tables from scratch
-- ============================================================================
/*
DROP TABLE IF EXISTS meal_logs CASCADE;
DROP TABLE IF EXISTS nutrition_facts CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_days CASCADE;
DROP TABLE IF EXISTS dining_halls CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
*/

-- ============================================================================
-- TABLE: dining_halls
-- Reference table for UC Davis dining locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    short_name VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- TABLE: user_profiles
-- Extended user information for fitness tracking and goal setting
-- Links to Supabase auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    height_inches NUMERIC(5,2) NOT NULL CHECK (height_inches > 0),
    weight_lbs NUMERIC(6,2) NOT NULL CHECK (weight_lbs > 0),
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    sex VARCHAR(20) NOT NULL CHECK (sex IN ('male', 'female', 'other')),
    goal VARCHAR(20) NOT NULL CHECK (goal IN ('cut', 'bulk', 'maintain')),
    activity_level VARCHAR(20) DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    target_calories INTEGER CHECK (target_calories > 0),
    target_protein_g NUMERIC(6,2) CHECK (target_protein_g >= 0),
    target_carbs_g NUMERIC(6,2) CHECK (target_carbs_g >= 0),
    target_fat_g NUMERIC(6,2) CHECK (target_fat_g >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user profile lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================================================
-- TABLE: user_preferences
-- Dietary restrictions, preferences, and food-related choices
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    is_vegetarian BOOLEAN DEFAULT FALSE NOT NULL,
    is_vegan BOOLEAN DEFAULT FALSE NOT NULL,
    is_pescatarian BOOLEAN DEFAULT FALSE NOT NULL,
    is_gluten_free BOOLEAN DEFAULT FALSE NOT NULL,
    is_dairy_free BOOLEAN DEFAULT FALSE NOT NULL,
    is_halal BOOLEAN DEFAULT FALSE NOT NULL,
    is_kosher BOOLEAN DEFAULT FALSE NOT NULL,
    is_hindu_non_veg BOOLEAN DEFAULT FALSE NOT NULL,
    allergies TEXT[] DEFAULT '{}' NOT NULL,
    dislikes TEXT[] DEFAULT '{}' NOT NULL,
    preferences TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user preference lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- TABLE: menu_days
-- Represents a specific meal period at a dining hall on a specific date
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dining_hall_id UUID NOT NULL REFERENCES dining_halls(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'brunch', 'late_night')),
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Composite unique constraint: one menu per hall/date/meal
    CONSTRAINT unique_menu_day UNIQUE (dining_hall_id, date, meal_type)
);

-- Indexes for menu queries
CREATE INDEX IF NOT EXISTS idx_menu_days_dining_hall_date ON menu_days(dining_hall_id, date);
CREATE INDEX IF NOT EXISTS idx_menu_days_date_meal_type ON menu_days(date, meal_type);
CREATE INDEX IF NOT EXISTS idx_menu_days_date ON menu_days(date);

-- ============================================================================
-- TABLE: menu_items
-- Individual dishes/foods served at a specific meal period
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_day_id UUID NOT NULL REFERENCES menu_days(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('entree', 'side', 'salad', 'soup', 'dessert', 'beverage', 'condiment', 'other')),
    station VARCHAR(100),
    is_vegetarian BOOLEAN DEFAULT FALSE NOT NULL,
    is_vegan BOOLEAN DEFAULT FALSE NOT NULL,
    contains_gluten BOOLEAN DEFAULT FALSE NOT NULL,
    contains_dairy BOOLEAN DEFAULT FALSE NOT NULL,
    contains_nuts BOOLEAN DEFAULT FALSE NOT NULL,
    allergen_info TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for menu item queries
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_day_id ON menu_items(menu_day_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- ============================================================================
-- TABLE: nutrition_facts
-- Nutritional information for each menu item (1:1 relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nutrition_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
    serving_size VARCHAR(50),
    serving_size_g NUMERIC(7,2) CHECK (serving_size_g >= 0),
    calories NUMERIC(7,2) CHECK (calories >= 0),
    protein_g NUMERIC(6,2) CHECK (protein_g >= 0),
    carbs_g NUMERIC(6,2) CHECK (carbs_g >= 0),
    fat_g NUMERIC(6,2) CHECK (fat_g >= 0),
    saturated_fat_g NUMERIC(6,2) CHECK (saturated_fat_g >= 0),
    trans_fat_g NUMERIC(6,2) CHECK (trans_fat_g >= 0),
    fiber_g NUMERIC(6,2) CHECK (fiber_g >= 0),
    sugar_g NUMERIC(6,2) CHECK (sugar_g >= 0),
    sodium_mg NUMERIC(7,2) CHECK (sodium_mg >= 0),
    cholesterol_mg NUMERIC(6,2) CHECK (cholesterol_mg >= 0),
    calcium_mg NUMERIC(6,2) CHECK (calcium_mg >= 0),
    iron_mg NUMERIC(6,2) CHECK (iron_mg >= 0),
    vitamin_a_mcg NUMERIC(6,2) CHECK (vitamin_a_mcg >= 0),
    vitamin_c_mg NUMERIC(6,2) CHECK (vitamin_c_mg >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast nutrition lookups when joining with menu items
CREATE INDEX IF NOT EXISTS idx_nutrition_facts_menu_item_id ON nutrition_facts(menu_item_id);

-- ============================================================================
-- TABLE: meal_logs
-- Records what users actually ate, including when and how much
-- ============================================================================
CREATE TABLE IF NOT EXISTS meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    eaten_at TIMESTAMPTZ,
    servings NUMERIC(4,2) DEFAULT 1.0 NOT NULL CHECK (servings > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for meal log queries
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id_logged_at ON meal_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at ON meal_logs(logged_at);
-- Note: The (user_id, logged_at) index above can efficiently handle date-based queries
-- For specific date filtering, queries can use: WHERE logged_at::date = '2025-01-26'

-- ============================================================================
-- SEED DATA: Dining Halls
-- Pre-populate with UC Davis dining commons
-- ============================================================================
INSERT INTO dining_halls (name, short_name, location, is_active)
VALUES 
    ('Latitude Restaurant', 'Latitude', 'Latitude Area, UC Davis', true),
    ('Segundo Dining Commons', 'Segundo', 'Segundo Area, UC Davis', true),
    ('Tercero Dining Commons', 'Tercero', 'Tercero Area, UC Davis', true),
    ('Cuarto Dining Commons', 'Cuarto', 'Cuarto Area, UC Davis', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS (Optional)
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at columns
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_days_updated_at ON menu_days;
CREATE TRIGGER update_menu_days_updated_at
    BEFORE UPDATE ON menu_days
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nutrition_facts_updated_at ON nutrition_facts;
CREATE TRIGGER update_nutrition_facts_updated_at
    BEFORE UPDATE ON nutrition_facts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES (Optional - Run these to verify schema)
-- ============================================================================
/*
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count records in each table
SELECT 'dining_halls' as table_name, COUNT(*) as count FROM dining_halls
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'user_preferences', COUNT(*) FROM user_preferences
UNION ALL
SELECT 'menu_days', COUNT(*) FROM menu_days
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'nutrition_facts', COUNT(*) FROM nutrition_facts
UNION ALL
SELECT 'meal_logs', COUNT(*) FROM meal_logs;

-- Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
*/

-- ============================================================================
-- SCHEMA CREATED SUCCESSFULLY!
-- ============================================================================
-- Next steps:
-- 1. Set up Row Level Security (RLS) policies for user tables
-- 2. Create API endpoints to interact with this schema
-- 3. Implement the menu scraper to populate menu data
-- 4. Build the mobile app frontend
-- ============================================================================

