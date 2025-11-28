# Testing Sign In Redirect Fix

## Quick Test Steps

### Prerequisites
1. Make sure the backend server is running:
   ```bash
   cd server
   npm start
   ```

2. Make sure your mobile app has the latest changes:
   ```bash
   cd mobile
   npx expo start
   ```

### Test Case 1: First Time Sign In (New User)

**Expected Result:** After signing in with Google, user should be redirected to the Onboarding flow (Welcome screen)

1. **Clear app data** (important for a fresh start):
   - iOS Simulator: Delete the app and reinstall
   - Android: Settings → Apps → DC Menu Planner → Clear Data
   - Or in Expo: Press `Shift + M` in terminal → Clear data

2. **Launch the app**
   - You should see the Login screen

3. **Sign in with Google**
   - Tap "Sign in with Google"
   - Complete the Google OAuth flow
   - Grant permissions

4. **Verify redirect**
   - ✅ You should be redirected to the **Welcome screen** (onboarding)
   - ❌ You should NOT see the Login screen again

5. **Check console logs**
   You should see logs like:
   ```
   ✅ Session established successfully!
   🔐 useAuth: Auth state changed - SIGNED_IN
   📡 API: Calling GET /api/onboarding...
   📡 API: 404 - User has not completed onboarding
   🧭 Navigation decision: Onboarding
   ```

### Test Case 2: Returning User (Completed Onboarding)

**Expected Result:** After signing in, user should be redirected to the Main app

1. **Complete the onboarding flow** (if you haven't already):
   - Fill in basic info (height, weight, age, sex)
   - Select your goal (cut, bulk, maintain)
   - Set dietary preferences
   - Complete the flow

2. **Close the app completely** (force quit, don't just minimize)

3. **Relaunch the app**
   - The app should automatically restore your session
   - ✅ You should go directly to the **Today screen** (main app)
   - ❌ You should NOT see the Login or Onboarding screens

4. **Check console logs**
   You should see logs like:
   ```
   🔐 useAuth: Initial session: Found
   📡 API: Calling GET /api/onboarding...
   ✅ API Response: 200
   📊 Profile check result: true
   🧭 Navigation decision: Main App
   ```

### Test Case 3: Sign Out and Sign In Again

**Expected Result:** After signing out and back in, user should go to Main app (not onboarding)

1. **Sign out**:
   - Go to Profile tab
   - Tap "Sign Out"
   - You should be redirected to Login screen

2. **Sign in again**:
   - Tap "Sign in with Google"
   - Complete OAuth flow
   - ✅ You should go directly to **Today screen** (main app)
   - ❌ You should NOT go to onboarding (since you already completed it)

### Common Issues and Solutions

#### Issue: Still redirecting to Login after sign-in

**Solution:**
1. Check that the backend server is running on `http://localhost:4000`
2. Check console logs for any API errors
3. Verify Supabase credentials are correctly configured
4. Clear app data and try again

#### Issue: API call fails with network error

**Solution:**
1. Make sure backend is running: `cd server && npm start`
2. Check that API_BASE_URL in `mobile/src/api/client.ts` points to correct URL
3. For physical device testing, use your computer's IP address instead of localhost

#### Issue: Goes to Main app instead of Onboarding on first sign-in

**Possible causes:**
1. User profile already exists from previous test
2. Delete the user from Supabase database and try again:
   ```sql
   -- In Supabase SQL Editor
   DELETE FROM user_preferences WHERE user_id = 'your-user-id';
   DELETE FROM user_profiles WHERE user_id = 'your-user-id';
   ```

## Debug Checklist

If something isn't working, check these logs in order:

1. ✅ OAuth completes: `✅ OAuth completed successfully`
2. ✅ Tokens received: `🔑 Tokens received, setting session...`
3. ✅ Session set: `✅ Session established successfully!`
4. ✅ Auth state changes: `🔐 useAuth: Auth state changed - SIGNED_IN`
5. ✅ API call starts: `📡 API: Calling GET /api/onboarding...`
6. ✅ API response: Either `404 - User has not completed onboarding` or `200 - Profile found`
7. ✅ Navigation decision: `🧭 Navigation decision: Onboarding` or `Main App`

If any step fails, that's where the problem is!

## Next Steps After Testing

Once you've verified that:
- ✅ New users are redirected to Onboarding
- ✅ Returning users are redirected to Main app
- ✅ Sign out/sign in works correctly

You can commit the changes:
```bash
git add -A
git commit -m "Fix: Sign in redirect - properly navigate to onboarding after Google OAuth"
```

