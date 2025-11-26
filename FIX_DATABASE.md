# 🔧 Fix Database Schema Error

**Error**: `Could not find the 'height_inches' column of 'user_profiles' in the schema cache`

**Cause**: The database still has the old metric columns (`height_cm`, `weight_kg`) but the backend code is trying to use imperial columns (`height_inches`, `weight_lbs`).

---

## 🚀 Quick Fix (3 Options)

### Option 1: Run Migration Script (Recommended if you have data)

**Go to your Supabase project**:
1. Open Supabase dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `server/db/migrate-to-imperial.sql`
5. Click **Run**

This will:
- ✅ Add new imperial columns
- ✅ Convert any existing data
- ✅ Remove old metric columns
- ✅ Add proper constraints

---

### Option 2: Recreate Table (If no data or testing)

**Go to Supabase SQL Editor and run**:

```sql
-- Drop and recreate user_profiles table
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
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

-- Recreate index
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Recreate trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### Option 3: Manual Column Update (Quick & Simple)

**If you just want to test quickly**:

```sql
-- Just add the new columns and drop old ones
ALTER TABLE user_profiles 
  ADD COLUMN height_inches NUMERIC(5,2),
  ADD COLUMN weight_lbs NUMERIC(6,2);

ALTER TABLE user_profiles 
  DROP COLUMN height_cm,
  DROP COLUMN weight_kg;

-- Make them required
ALTER TABLE user_profiles 
  ALTER COLUMN height_inches SET NOT NULL,
  ALTER COLUMN weight_lbs SET NOT NULL;
```

---

## ✅ Verify It Worked

After running the migration, test it:

```sql
-- Check the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('height_inches', 'weight_lbs');

-- Should return:
-- height_inches | numeric
-- weight_lbs    | numeric
```

---

## 🧪 Test the App Again

1. **Refresh your mobile app**: http://localhost:19006
2. **Complete onboarding** with imperial units:
   - Height: 70 inches
   - Weight: 154 lbs
3. **Should work now!** ✅

---

## 📊 What Happens Behind the Scenes

### Before Migration:
```sql
user_profiles
  ├── height_cm (NUMERIC)    ← Backend trying to write to height_inches
  └── weight_kg (NUMERIC)    ← Backend trying to write to weight_lbs
```
**Result**: ❌ Column not found error

### After Migration:
```sql
user_profiles
  ├── height_inches (NUMERIC) ← ✅ Matches backend code
  └── weight_lbs (NUMERIC)    ← ✅ Matches backend code
```
**Result**: ✅ Works!

---

## 🚨 Important Notes

### If You Have Existing Data:
Use **Option 1** (migration script) - it will convert your data:
- 170 cm → 66.93 inches → displays as 5'7"
- 70 kg → 154.32 lbs

### If Database is Empty (Testing):
Use **Option 2** or **3** - faster, cleaner start

### After Migration:
- Old data is preserved and converted
- All new entries use imperial units
- No data loss

---

## 💡 Pro Tip

You can check if you have any existing data first:

```sql
SELECT COUNT(*) FROM user_profiles;
```

- If **0**: Use Option 2 (recreate)
- If **> 0**: Use Option 1 (migration)

---

## 🎯 Quick Copy-Paste

**For Supabase SQL Editor** (if no existing data):

```sql
ALTER TABLE user_profiles 
  ADD COLUMN height_inches NUMERIC(5,2),
  ADD COLUMN weight_lbs NUMERIC(6,2),
  DROP COLUMN height_cm,
  DROP COLUMN weight_kg;

ALTER TABLE user_profiles 
  ALTER COLUMN height_inches SET NOT NULL,
  ALTER COLUMN weight_lbs SET NOT NULL;
```

**Then refresh your app and try again!** 🚀

---

**After running the fix, your app will work with imperial units!**

