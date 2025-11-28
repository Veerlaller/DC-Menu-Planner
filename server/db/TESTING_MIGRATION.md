# Testing Database Migration: Remove Auth Constraints

This guide walks you through testing the `remove-auth-constraints.sql` migration to ensure onboarding still works.

## Prerequisites

1. ✅ Supabase project created and running
2. ✅ `server/.env` file configured with:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. ✅ Database schema created (`schema.sql` already run)

## Step 1: Run the Migration

### Option A: Supabase Dashboard (Recommended)
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Open `server/db/remove-auth-constraints.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click **Run**
7. You should see: "Success. No rows returned"

### Option B: Command Line (if Supabase CLI installed)
```bash
supabase db execute --file server/db/remove-auth-constraints.sql
```

## Step 2: Verify Constraints are Removed

Run this query in Supabase SQL Editor:

```sql
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
```

**Expected Result**: No rows returned (all FK constraints removed)

## Step 3: Start the Backend Server

```bash
cd server
npm run dev
```

**Expected Output**:
```
🚀 Server running on http://localhost:4000
✅ Supabase connected
```

If you see errors about missing environment variables, make sure your `.env` file is configured.

## Step 4: Test Onboarding API

### Test 1: POST Onboarding (Create New User)

```bash
curl -X POST http://localhost:4000/api/onboarding \
  -H "Content-Type: application/json" \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "height_inches": 70,
    "weight_lbs": 180,
    "age": 20,
    "sex": "male",
    "goal": "maintain",
    "activity_level": "moderate",
    "target_calories": 2500,
    "target_protein_g": 187.5,
    "target_carbs_g": 250,
    "target_fat_g": 83.3,
    "is_vegetarian": false,
    "is_vegan": false,
    "is_pescatarian": false,
    "is_gluten_free": false,
    "is_dairy_free": false,
    "allergies": [],
    "dislikes": [],
    "preferences": []
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "profile": {
    "id": "...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "height_inches": 70,
    "weight_lbs": 180,
    ...
  },
  "preferences": {
    "id": "...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    ...
  }
}
```

### Test 2: GET Onboarding (Retrieve User Data)

```bash
curl -X GET http://localhost:4000/api/onboarding \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440000"
```

**Expected Response**:
```json
{
  "profile": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "height_inches": 70,
    ...
  },
  "preferences": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    ...
  }
}
```

### Test 3: Different User ID (Should Create New Record)

```bash
curl -X POST http://localhost:4000/api/onboarding \
  -H "Content-Type: application/json" \
  -H "x-user-id: 660e8400-e29b-41d4-a716-446655440111" \
  -d '{
    "height_inches": 65,
    "weight_lbs": 140,
    "age": 19,
    "sex": "female",
    "goal": "cut",
    "activity_level": "active",
    "target_calories": 2000,
    "target_protein_g": 150,
    "target_carbs_g": 200,
    "target_fat_g": 66.7,
    "is_vegetarian": true,
    "is_vegan": false
  }'
```

**Expected**: Success with different `user_id`

## Step 5: Verify in Database

In Supabase Table Editor, check:

### user_profiles table
```sql
SELECT user_id, height_inches, weight_lbs, age, sex, goal
FROM user_profiles
ORDER BY created_at DESC;
```

Should see both test users with their respective UUIDs.

### user_preferences table
```sql
SELECT user_id, is_vegetarian, is_vegan, is_gluten_free
FROM user_preferences
ORDER BY created_at DESC;
```

Should see preferences for both test users.

## Step 6: Test Mobile App (Optional)

If you want to test the full flow:

1. Start mobile app:
   ```bash
   cd mobile
   npm start
   ```

2. Open in browser (press `w`)

3. Complete onboarding with test data

4. Check that data is saved in Supabase

## ✅ Success Criteria

All tests pass if:

- [ ] Migration runs without errors
- [ ] FK constraints are removed (verification query returns no rows)
- [ ] Server starts successfully
- [ ] POST /api/onboarding creates new user profile
- [ ] POST /api/onboarding creates new user preferences
- [ ] GET /api/onboarding retrieves saved data
- [ ] Multiple user IDs can be created (no FK violations)
- [ ] Data appears in Supabase Table Editor

## 🚨 Troubleshooting

### "constraint does not exist" when running migration
**Status**: ✅ This is OK!
- Migration uses `IF EXISTS` to be idempotent
- Constraints may have already been removed
- Check verification query to confirm

### "Missing Supabase environment variables"
**Fix**: Create `server/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_JWT_SECRET=your-jwt-secret
```

### "relation 'user_profiles' does not exist"
**Fix**: Run `schema.sql` first:
```bash
# In Supabase SQL Editor, run the contents of server/db/schema.sql
```

### Test user inserted but can't query
**Fix**: Check that you're using the same UUID in both POST and GET requests:
```bash
# Make sure x-user-id header matches in both requests
```

### "Failed to save profile" errors
**Possible causes**:
1. Database not connected - check `.env` file
2. Table doesn't exist - run `schema.sql`
3. Validation error - check request body format
4. Check server logs for specific error message

## 📊 Expected Database State After Tests

```
user_profiles table:
- 2 rows (one for each test user)
- No FK constraint on user_id column
- user_id values are valid UUIDs but don't reference auth.users

user_preferences table:
- 2 rows (one for each test user)
- No FK constraint on user_id column
- Matches user_profiles by user_id value only

meal_logs table:
- 0 rows (not tested yet)
- No FK constraint on user_id column
```

## 🎉 Next Steps After Testing

Once all tests pass:

1. ✅ Commit the migration file
2. ✅ Update documentation
3. ✅ Push to branch
4. ✅ Ready for merge!

---

**Last Updated**: November 28, 2025

