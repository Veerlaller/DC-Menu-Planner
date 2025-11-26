# Data Model: UC Davis Diet Tracker

**Backend:** Node.js + Express  
**Database:** Supabase (PostgreSQL)  
**Auth:** Supabase Auth

---

## Overview

This document defines the complete database schema for a mobile diet-tracking application that helps students track their nutrition using UC Davis dining hall menus. The system supports user profiles, dietary preferences, menu management, nutritional data, and meal logging with personalized recommendations.

### Key Features
- User authentication via Supabase Auth
- Personalized user profiles with fitness goals
- Dietary preference tracking (vegetarian, allergies, dislikes)
- Complete dining hall menu database
- Nutritional information per menu item
- Meal logging and daily macro tracking
- Real-time meal recommendations

---

## Database Tables

### 1. `users` (Supabase Auth)

**Note:** This table is managed by Supabase Auth and exists in the `auth` schema. We reference it but don't create it.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, user identifier |
| `email` | VARCHAR | User's email address |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |

**Constraints:**
- Primary Key: `id`
- Managed by Supabase Auth system

---

### 2. `user_profiles`

Stores extended user information for fitness tracking and goal setting.

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Profile identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `user_id` | UUID | NOT NULL, UNIQUE, FK | Reference to auth.users | `550e8400-e29b-41d4-a716-446655440000` |
| `height_cm` | NUMERIC(5,2) | NOT NULL | Height in centimeters | `175.50` |
| `weight_kg` | NUMERIC(5,2) | NOT NULL | Current weight in kilograms | `70.50` |
| `age` | INTEGER | NOT NULL, CHECK (age > 0 AND age < 150) | Age in years | `20` |
| `sex` | VARCHAR(20) | NOT NULL | Biological sex | `male`, `female`, `other` |
| `goal` | VARCHAR(20) | NOT NULL | Fitness goal | `cut`, `bulk`, `maintain` |
| `activity_level` | VARCHAR(20) | DEFAULT 'moderate' | Activity level for calorie calculation | `sedentary`, `moderate`, `active` |
| `target_calories` | INTEGER | NULL | Daily calorie target (can be calculated) | `2200` |
| `target_protein_g` | NUMERIC(6,2) | NULL | Daily protein target in grams | `150.00` |
| `target_carbs_g` | NUMERIC(6,2) | NULL | Daily carbs target in grams | `250.00` |
| `target_fat_g` | NUMERIC(6,2) | NULL | Daily fat target in grams | `70.00` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Profile creation timestamp | `2025-01-15 10:30:00+00` |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp | `2025-01-20 14:45:00+00` |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users(id)` ON DELETE CASCADE
- Unique: `user_id` (one profile per user)
- Check: `goal IN ('cut', 'bulk', 'maintain')`
- Check: `sex IN ('male', 'female', 'other')`
- Check: `activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')`

**Indexes:**
- `idx_user_profiles_user_id` on `user_id` (for fast user lookup)

---

### 3. `user_preferences`

Stores dietary restrictions, preferences, and food-related choices.

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Preference record identifier | `660e8400-e29b-41d4-a716-446655440001` |
| `user_id` | UUID | NOT NULL, UNIQUE, FK | Reference to auth.users | `550e8400-e29b-41d4-a716-446655440000` |
| `is_vegetarian` | BOOLEAN | DEFAULT FALSE | Vegetarian diet preference | `true` |
| `is_vegan` | BOOLEAN | DEFAULT FALSE | Vegan diet preference | `false` |
| `is_pescatarian` | BOOLEAN | DEFAULT FALSE | Pescatarian diet preference | `false` |
| `is_gluten_free` | BOOLEAN | DEFAULT FALSE | Gluten-free requirement | `false` |
| `is_dairy_free` | BOOLEAN | DEFAULT FALSE | Dairy-free requirement | `false` |
| `allergies` | TEXT[] | DEFAULT '{}' | List of allergies | `{peanuts, shellfish, soy}` |
| `dislikes` | TEXT[] | DEFAULT '{}' | List of disliked foods | `{mushrooms, olives}` |
| `preferences` | TEXT[] | DEFAULT '{}' | List of preferred foods | `{chicken, rice, broccoli}` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Preference creation timestamp | `2025-01-15 10:30:00+00` |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp | `2025-01-20 14:45:00+00` |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users(id)` ON DELETE CASCADE
- Unique: `user_id` (one preference record per user)

**Indexes:**
- `idx_user_preferences_user_id` on `user_id`

**Notes:**
- Arrays allow flexible storage of multiple items
- Consider using JSONB if more structured data is needed
- Frontend should normalize allergy/dislike strings (lowercase, singular form)

---

### 4. `dining_halls`

Reference table for UC Davis dining locations.

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Dining hall identifier | `770e8400-e29b-41d4-a716-446655440002` |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Official dining hall name | `Segundo Dining Commons` |
| `short_name` | VARCHAR(50) | NOT NULL, UNIQUE | Abbreviated name | `Segundo` |
| `location` | VARCHAR(200) | NULL | Physical location/address | `Segundo Area, UC Davis` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether hall is currently operating | `true` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp | `2025-01-01 00:00:00+00` |

**Constraints:**
- Primary Key: `id`
- Unique: `name`
- Unique: `short_name`

**Example Records:**
```
| id                                   | name                    | short_name | is_active |
|--------------------------------------|-------------------------|------------|-----------|
| 770e8400-e29b-41d4-a716-446655440002 | Segundo Dining Commons  | Segundo    | true      |
| 770e8400-e29b-41d4-a716-446655440003 | Tercero Dining Commons  | Tercero    | true      |
| 770e8400-e29b-41d4-a716-446655440004 | Cuarto Dining Commons   | Cuarto     | true       |
```

**Notes:**
- This is a relatively static table
- `is_active` allows for temporary closures without deletion

---

### 5. `menu_days`

Represents a specific meal period (breakfast/lunch/dinner) at a dining hall on a specific date. This is the grouping entity for menu items.

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Menu day identifier | `880e8400-e29b-41d4-a716-446655440005` |
| `dining_hall_id` | UUID | NOT NULL, FK | Reference to dining hall | `770e8400-e29b-41d4-a716-446655440002` |
| `date` | DATE | NOT NULL | Date of menu | `2025-01-26` |
| `meal_type` | VARCHAR(20) | NOT NULL | Type of meal | `breakfast`, `lunch`, `dinner` |
| `start_time` | TIME | NULL | Meal service start time | `11:00:00` |
| `end_time` | TIME | NULL | Meal service end time | `14:00:00` |
| `is_available` | BOOLEAN | DEFAULT TRUE | Whether menu is currently available | `true` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp | `2025-01-26 06:00:00+00` |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp | `2025-01-26 06:00:00+00` |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `dining_hall_id` → `dining_halls(id)` ON DELETE CASCADE
- Unique: `(dining_hall_id, date, meal_type)` (composite unique constraint)
- Check: `meal_type IN ('breakfast', 'lunch', 'dinner', 'brunch', 'late_night')`

**Indexes:**
- `idx_menu_days_dining_hall_date` on `(dining_hall_id, date)` (for date range queries)
- `idx_menu_days_date_meal_type` on `(date, meal_type)` (for "what's available now" queries)

**Example Records:**
```
| id       | dining_hall_id | date       | meal_type | start_time | end_time |
|----------|----------------|------------|-----------|------------|----------|
| 880e...5 | 770e...2       | 2025-01-26 | breakfast | 07:00:00   | 10:30:00 |
| 880e...6 | 770e...2       | 2025-01-26 | lunch     | 11:00:00   | 14:00:00 |
| 880e...7 | 770e...2       | 2025-01-26 | dinner    | 17:00:00   | 20:00:00 |
```

**Notes:**
- Composite unique key prevents duplicate menus for same hall/date/meal
- `start_time` and `end_time` help with "Hungry Now" feature
- This table acts as a container for menu items

---

### 6. `menu_items`

Individual dishes/foods served at a specific meal period.

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Menu item identifier | `990e8400-e29b-41d4-a716-446655440008` |
| `menu_day_id` | UUID | NOT NULL, FK | Reference to menu day | `880e8400-e29b-41d4-a716-446655440005` |
| `name` | VARCHAR(200) | NOT NULL | Dish name | `Grilled Chicken Breast` |
| `description` | TEXT | NULL | Additional details | `Herb-marinated grilled chicken` |
| `category` | VARCHAR(50) | NULL | Food category | `entree`, `side`, `dessert`, `beverage` |
| `station` | VARCHAR(100) | NULL | Serving station in dining hall | `Grill Station`, `Salad Bar` |
| `is_vegetarian` | BOOLEAN | DEFAULT FALSE | Vegetarian-friendly | `false` |
| `is_vegan` | BOOLEAN | DEFAULT FALSE | Vegan-friendly | `false` |
| `contains_gluten` | BOOLEAN | DEFAULT FALSE | Contains gluten | `false` |
| `contains_dairy` | BOOLEAN | DEFAULT FALSE | Contains dairy | `false` |
| `contains_nuts` | BOOLEAN | DEFAULT FALSE | Contains nuts | `false` |
| `allergen_info` | TEXT[] | DEFAULT '{}' | List of allergens | `{soy, wheat}` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp | `2025-01-26 06:00:00+00` |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `menu_day_id` → `menu_days(id)` ON DELETE CASCADE
- Check: `category IN ('entree', 'side', 'salad', 'soup', 'dessert', 'beverage', 'condiment', 'other')`

**Indexes:**
- `idx_menu_items_menu_day_id` on `menu_day_id` (for fetching all items in a menu)
- `idx_menu_items_name` on `name` (for search functionality)
- `idx_menu_items_category` on `category` (for filtering by type)

**Example Records:**
```
| id       | menu_day_id | name                    | category | is_vegetarian | is_vegan |
|----------|-------------|-------------------------|----------|---------------|----------|
| 990e...8 | 880e...6    | Grilled Chicken Breast  | entree   | false         | false    |
| 990e...9 | 880e...6    | Steamed Broccoli        | side     | true          | true     |
| 990e..10 | 880e...6    | Chocolate Chip Cookie   | dessert  | true          | false    |
```

**Notes:**
- Multiple menu items can belong to one menu_day
- Allergen flags help with filtering for user preferences
- `station` helps users navigate physical dining hall

---

### 7. `nutrition_facts`

Nutritional information for each menu item (one-to-one relationship).

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Nutrition fact identifier | `aa0e8400-e29b-41d4-a716-446655440011` |
| `menu_item_id` | UUID | NOT NULL, UNIQUE, FK | Reference to menu item | `990e8400-e29b-41d4-a716-446655440008` |
| `serving_size` | VARCHAR(50) | NULL | Serving size description | `4 oz`, `1 cup`, `1 piece` |
| `serving_size_g` | NUMERIC(7,2) | NULL | Serving size in grams | `113.00` |
| `calories` | NUMERIC(7,2) | NULL | Calories per serving | `165.00` |
| `protein_g` | NUMERIC(6,2) | NULL | Protein in grams | `31.00` |
| `carbs_g` | NUMERIC(6,2) | NULL | Carbohydrates in grams | `0.00` |
| `fat_g` | NUMERIC(6,2) | NULL | Total fat in grams | `3.60` |
| `saturated_fat_g` | NUMERIC(6,2) | NULL | Saturated fat in grams | `1.00` |
| `trans_fat_g` | NUMERIC(6,2) | NULL | Trans fat in grams | `0.00` |
| `fiber_g` | NUMERIC(6,2) | NULL | Dietary fiber in grams | `0.00` |
| `sugar_g` | NUMERIC(6,2) | NULL | Sugar in grams | `0.00` |
| `sodium_mg` | NUMERIC(7,2) | NULL | Sodium in milligrams | `74.00` |
| `cholesterol_mg` | NUMERIC(6,2) | NULL | Cholesterol in milligrams | `85.00` |
| `calcium_mg` | NUMERIC(6,2) | NULL | Calcium in milligrams | `15.00` |
| `iron_mg` | NUMERIC(6,2) | NULL | Iron in milligrams | `0.90` |
| `vitamin_a_mcg` | NUMERIC(6,2) | NULL | Vitamin A in micrograms | `10.00` |
| `vitamin_c_mg` | NUMERIC(6,2) | NULL | Vitamin C in milligrams | `0.00` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp | `2025-01-26 06:00:00+00` |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp | `2025-01-26 06:00:00+00` |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `menu_item_id` → `menu_items(id)` ON DELETE CASCADE
- Unique: `menu_item_id` (one-to-one relationship)

**Indexes:**
- `idx_nutrition_facts_menu_item_id` on `menu_item_id` (for fast joins)

**Example Record:**
```
Grilled Chicken Breast (4 oz):
- calories: 165
- protein: 31g
- carbs: 0g
- fat: 3.6g
- sodium: 74mg
```

**Notes:**
- One-to-one relationship with `menu_items`
- NULL values allowed since not all nutritional data may be available
- All nutrient values are per serving
- Grams/milligrams/micrograms chosen for precision

---

### 8. `meal_logs`

Records what users actually ate, including when and how much.

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Meal log identifier | `bb0e8400-e29b-41d4-a716-446655440012` |
| `user_id` | UUID | NOT NULL, FK | Reference to user | `550e8400-e29b-41d4-a716-446655440000` |
| `menu_item_id` | UUID | NOT NULL, FK | Reference to menu item eaten | `990e8400-e29b-41d4-a716-446655440008` |
| `logged_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the meal was logged | `2025-01-26 12:30:00+00` |
| `eaten_at` | TIMESTAMPTZ | NULL | When the meal was actually eaten | `2025-01-26 12:15:00+00` |
| `servings` | NUMERIC(4,2) | NOT NULL, DEFAULT 1.0, CHECK (servings > 0) | Number of servings | `1.5` |
| `notes` | TEXT | NULL | Optional user notes | `Extra sauce on the side` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp | `2025-01-26 12:30:00+00` |

**Constraints:**
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users(id)` ON DELETE CASCADE
- Foreign Key: `menu_item_id` → `menu_items(id)` ON DELETE CASCADE
- Check: `servings > 0`

**Indexes:**
- `idx_meal_logs_user_id_logged_at` on `(user_id, logged_at DESC)` (for user history)
- `idx_meal_logs_user_id_date` on `(user_id, DATE(logged_at))` (for daily summaries)
- `idx_meal_logs_logged_at` on `logged_at` (for time-based queries)

**Example Records:**
```
| id       | user_id  | menu_item_id | logged_at           | servings | notes           |
|----------|----------|--------------|---------------------|----------|-----------------|
| bb0e..12 | 550e...0 | 990e...8     | 2025-01-26 12:30:00 | 1.0      | Perfect portion |
| bb0e..13 | 550e...0 | 990e...9     | 2025-01-26 12:31:00 | 1.5      | Extra veggies   |
| bb0e..14 | 550e...0 | 990e..10     | 2025-01-26 12:32:00 | 1.0      | NULL            |
```

**Notes:**
- Allows partial servings (0.5, 1.5, etc.)
- `logged_at` vs `eaten_at` distinction allows retroactive logging
- User can log same item multiple times
- Deleting a user cascades to delete their meal logs

---

## Relationships Summary

### Entity Relationship Diagram (Text)

```
auth.users (Supabase Auth)
    ├──1:1──> user_profiles (user_id)
    ├──1:1──> user_preferences (user_id)
    └──1:N──> meal_logs (user_id)

dining_halls
    └──1:N──> menu_days (dining_hall_id)

menu_days
    └──1:N──> menu_items (menu_day_id)

menu_items
    ├──1:1──> nutrition_facts (menu_item_id)
    └──1:N──> meal_logs (menu_item_id)
```

### Key Relationships

1. **User → User Profile** (1:1)
   - One user has one profile
   - `user_profiles.user_id` → `auth.users.id`

2. **User → User Preferences** (1:1)
   - One user has one preference record
   - `user_preferences.user_id` → `auth.users.id`

3. **User → Meal Logs** (1:N)
   - One user has many meal logs
   - `meal_logs.user_id` → `auth.users.id`

4. **Dining Hall → Menu Days** (1:N)
   - One dining hall has many menu days
   - `menu_days.dining_hall_id` → `dining_halls.id`

5. **Menu Day → Menu Items** (1:N)
   - One menu day has many menu items
   - `menu_items.menu_day_id` → `menu_days.id`

6. **Menu Item → Nutrition Facts** (1:1)
   - One menu item has one nutrition fact record
   - `nutrition_facts.menu_item_id` → `menu_items.id`

7. **Menu Item → Meal Logs** (1:N)
   - One menu item can be logged by many users
   - `meal_logs.menu_item_id` → `menu_items.id`

---

## Composite Keys & Unique Constraints

### `menu_days` Composite Unique Constraint
```
UNIQUE (dining_hall_id, date, meal_type)
```
**Reasoning:** Prevents duplicate menus for the same dining hall, date, and meal period.

**Example:**
- ✅ Segundo, 2025-01-26, lunch
- ✅ Segundo, 2025-01-26, dinner
- ✅ Tercero, 2025-01-26, lunch
- ❌ Segundo, 2025-01-26, lunch (duplicate)

---

## Indexes Strategy

### High-Priority Indexes (Performance Critical)

1. **User Lookups**
   ```
   idx_user_profiles_user_id ON user_profiles(user_id)
   idx_user_preferences_user_id ON user_preferences(user_id)
   ```

2. **Menu Queries ("What's Available Now")**
   ```
   idx_menu_days_date_meal_type ON menu_days(date, meal_type)
   idx_menu_items_menu_day_id ON menu_items(menu_day_id)
   ```

3. **Meal History Queries**
   ```
   idx_meal_logs_user_id_logged_at ON meal_logs(user_id, logged_at DESC)
   idx_meal_logs_user_id_date ON meal_logs(user_id, DATE(logged_at))
   ```

4. **Nutrition Joins**
   ```
   idx_nutrition_facts_menu_item_id ON nutrition_facts(menu_item_id)
   ```

### Nice-to-Have Indexes

5. **Search & Filtering**
   ```
   idx_menu_items_name ON menu_items(name) -- for search autocomplete
   idx_menu_items_category ON menu_items(category) -- for filtering
   idx_dining_halls_short_name ON dining_halls(short_name) -- for lookups
   ```

---

## Example Data Flow

### Scenario: User logs lunch at Segundo on Jan 26, 2025

1. **Menu Day Lookup**
   ```
   SELECT * FROM menu_days 
   WHERE dining_hall_id = 'segundo_uuid' 
     AND date = '2025-01-26' 
     AND meal_type = 'lunch'
   ```

2. **Menu Items Query**
   ```
   SELECT mi.*, nf.* 
   FROM menu_items mi
   LEFT JOIN nutrition_facts nf ON mi.id = nf.menu_item_id
   WHERE mi.menu_day_id = 'lunch_menu_uuid'
   ```

3. **User Logs a Meal**
   ```
   INSERT INTO meal_logs (user_id, menu_item_id, servings, logged_at)
   VALUES ('user_uuid', 'chicken_item_uuid', 1.5, NOW())
   ```

4. **Calculate Daily Macros**
   ```
   SELECT 
     SUM(nf.calories * ml.servings) as total_calories,
     SUM(nf.protein_g * ml.servings) as total_protein,
     SUM(nf.carbs_g * ml.servings) as total_carbs,
     SUM(nf.fat_g * ml.servings) as total_fat
   FROM meal_logs ml
   JOIN nutrition_facts nf ON ml.menu_item_id = nf.menu_item_id
   WHERE ml.user_id = 'user_uuid'
     AND DATE(ml.logged_at) = '2025-01-26'
   ```

---

## Common Queries

### 1. Get Current Menu for a Dining Hall
```sql
-- Get lunch items at Segundo for today
SELECT mi.*, nf.*
FROM menu_items mi
LEFT JOIN nutrition_facts nf ON mi.id = nf.menu_item_id
WHERE mi.menu_day_id IN (
  SELECT id FROM menu_days
  WHERE dining_hall_id = 'segundo_uuid'
    AND date = CURRENT_DATE
    AND meal_type = 'lunch'
)
ORDER BY mi.category, mi.name;
```

### 2. Get User's Daily Nutrition Summary
```sql
SELECT 
  DATE(ml.logged_at) as date,
  COUNT(*) as items_logged,
  SUM(nf.calories * ml.servings) as total_calories,
  SUM(nf.protein_g * ml.servings) as total_protein,
  SUM(nf.carbs_g * ml.servings) as total_carbs,
  SUM(nf.fat_g * ml.servings) as total_fat
FROM meal_logs ml
JOIN nutrition_facts nf ON ml.menu_item_id = nf.menu_item_id
WHERE ml.user_id = 'user_uuid'
  AND ml.logged_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(ml.logged_at)
ORDER BY date DESC;
```

### 3. "Hungry Now" Recommendations
```sql
-- Get high-protein items available right now that match user preferences
SELECT mi.*, nf.*, dh.name as dining_hall_name
FROM menu_items mi
JOIN nutrition_facts nf ON mi.id = nf.menu_item_id
JOIN menu_days md ON mi.menu_day_id = md.id
JOIN dining_halls dh ON md.dining_hall_id = dh.id
WHERE md.date = CURRENT_DATE
  AND md.is_available = true
  AND CURRENT_TIME BETWEEN md.start_time AND md.end_time
  AND mi.is_vegetarian = (SELECT is_vegetarian FROM user_preferences WHERE user_id = 'user_uuid')
  AND nf.protein_g > 20
ORDER BY nf.protein_g DESC
LIMIT 10;
```

### 4. Track User Progress Towards Goals
```sql
SELECT 
  up.target_calories,
  up.target_protein_g,
  COALESCE(SUM(nf.calories * ml.servings), 0) as consumed_calories,
  COALESCE(SUM(nf.protein_g * ml.servings), 0) as consumed_protein,
  up.target_calories - COALESCE(SUM(nf.calories * ml.servings), 0) as calories_remaining,
  up.target_protein_g - COALESCE(SUM(nf.protein_g * ml.servings), 0) as protein_remaining
FROM user_profiles up
LEFT JOIN meal_logs ml ON up.user_id = ml.user_id 
  AND DATE(ml.logged_at) = CURRENT_DATE
LEFT JOIN nutrition_facts nf ON ml.menu_item_id = nf.menu_item_id
WHERE up.user_id = 'user_uuid'
GROUP BY up.id;
```

---

## Data Validation Rules

### User Profile Constraints
- `height_cm`: 50-300 (reasonable human height range)
- `weight_kg`: 20-300 (reasonable human weight range)
- `age`: 1-150 (validated via CHECK constraint)
- `goal`: Must be 'cut', 'bulk', or 'maintain'
- `activity_level`: Must be valid enum value

### Menu & Nutrition Constraints
- `menu_days.date`: Cannot be in distant past (application logic)
- `nutrition_facts.*_g`: Should be >= 0 (non-negative)
- `meal_logs.servings`: Must be > 0

### Array Fields Normalization
- Allergy names: lowercase, singular (e.g., "peanut" not "Peanuts")
- Dislike names: lowercase, singular
- Consistent naming helps with matching and filtering

---

## Row-Level Security (RLS) Considerations

Since this uses Supabase, Row-Level Security policies should be implemented:

### `user_profiles`
- Users can read/update their own profile
- Admin can read all profiles

### `user_preferences`
- Users can read/update their own preferences
- Admin can read all preferences

### `meal_logs`
- Users can create/read/update/delete their own logs
- Admin can read all logs

### Public Tables (Read-Only for Users)
- `dining_halls`: Public read access
- `menu_days`: Public read access
- `menu_items`: Public read access
- `nutrition_facts`: Public read access

---

## Future Considerations

### Potential Enhancements

1. **Favorites System**
   - Add `user_favorites` table linking users to menu items
   - Track frequently logged items

2. **Meal Plans**
   - Add `meal_plans` table for pre-planned meals
   - Help users plan their day in advance

3. **Social Features**
   - Add `user_friends` table
   - Share meal logs or recommendations

4. **Recipe Combinations**
   - Track which items users commonly eat together
   - Suggest complementary items

5. **Historical Analytics**
   - Archive old menu data
   - Track menu item popularity
   - Identify seasonal patterns

6. **Custom Foods**
   - Allow users to log non-dining-hall foods
   - `custom_foods` and `custom_nutrition` tables

7. **Water Tracking**
   - Add `water_logs` table
   - Track hydration alongside meals

8. **Photo Logging**
   - Add `meal_photos` table
   - Store references to uploaded meal photos

---

## Migration Strategy

When creating actual SQL migrations:

1. **Phase 1: Core Tables**
   - `dining_halls`
   - `user_profiles`
   - `user_preferences`

2. **Phase 2: Menu System**
   - `menu_days`
   - `menu_items`
   - `nutrition_facts`

3. **Phase 3: User Activity**
   - `meal_logs`

4. **Phase 4: Indexes & Constraints**
   - Add all indexes
   - Add check constraints
   - Set up foreign keys

5. **Phase 5: RLS Policies**
   - Enable RLS on user tables
   - Create security policies
   - Test access controls

---

## Summary

This data model supports:
- ✅ User authentication and profiles
- ✅ Personalized dietary preferences and goals
- ✅ Complete dining hall menu management
- ✅ Detailed nutritional tracking
- ✅ Meal logging with flexible servings
- ✅ Daily macro calculations
- ✅ Real-time "Hungry Now" recommendations
- ✅ Historical meal tracking and analytics
- ✅ Scalable architecture for future features

The schema is normalized, uses appropriate data types, includes proper constraints, and has strategic indexes for performance. It's ready to be implemented as Supabase/PostgreSQL migrations.

---

**Next Steps:**
1. Review this data model with stakeholders
2. Create SQL migration files in sequential order
3. Set up Supabase Row-Level Security policies
4. Implement database seed data for dining halls
5. Build API endpoints using this schema
6. Create TypeScript types matching this schema

