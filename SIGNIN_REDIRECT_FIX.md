# Sign In Redirect Fix

## Problem
After signing in with Google and pressing continue, the app was redirecting back to the landing page (Login screen) instead of the onboarding page.

## Root Cause
The issue was caused by stale persisted data interfering with the authentication flow:

1. The app was persisting `hasCompletedOnboarding` to AsyncStorage
2. When the app reloaded after sign-in, it would load the old persisted value
3. This stale data would override the fresh API check for the user's profile
4. This caused incorrect navigation decisions

## Solution

### 1. Stop Persisting `hasCompletedOnboarding`
**File:** `mobile/src/store/useStore.ts`

- Removed `hasCompletedOnboarding` from the list of persisted values
- This value should always be checked fresh from the API after authentication
- The API call to `/api/onboarding` is the source of truth for this state

### 2. Improved Navigation Logic
**File:** `mobile/src/navigation/RootNavigator.tsx`

- Added explicit reset of `hasCompletedOnboarding` when user is not authenticated
- Improved the profile check flow to ensure it runs properly after sign-in
- Enhanced logging to track the navigation decision process

### 3. Enhanced Authentication Logging
**Files:** 
- `mobile/src/hooks/useAuth.ts` - Added detailed logging for auth state changes
- `mobile/src/screens/auth/LoginScreen.tsx` - Added detailed logging for OAuth flow

These logging improvements help debug any future authentication issues.

## How It Works Now

### Sign-In Flow:
1. User clicks "Sign in with Google"
2. OAuth flow opens in browser
3. User authenticates with Google
4. Browser redirects back to app with tokens
5. App calls `supabase.auth.setSession()` with tokens
6. Auth state listener in `useAuth` hook detects the change
7. `RootNavigator` sees `isAuthenticated` is now true
8. `RootNavigator` calls API to check if user has profile (`checkUserProfile()`)
9. API returns `false` (no profile exists yet)
10. `RootNavigator` sets `hasCompletedOnboarding` to `false`
11. Navigation shows Onboarding screen ✅

### Subsequent App Launches:
1. App loads persisted session from AsyncStorage
2. `useAuth` initializes with existing session
3. `isAuthenticated` is `true`
4. `RootNavigator` calls API to check profile
5. If user completed onboarding previously, API returns `true`
6. Navigation shows Main app
7. If user didn't complete onboarding, API returns `false`
8. Navigation shows Onboarding screen

## Testing the Fix

1. Clear app data/storage (fresh start)
2. Sign in with Google
3. Verify you're redirected to the Welcome screen (onboarding)
4. Complete the onboarding flow
5. Close and reopen the app
6. Verify you're taken directly to the Main app (not onboarding)

## Debug Logs to Watch

When testing, look for these log messages in order:

```
🔐 useAuth: Initializing...
🔐 useAuth: Initial session: None
🔐 Auth state changed: SIGNED_IN
   User ID: xxx
   User Email: xxx@example.com
📡 API: Calling GET /api/onboarding...
📡 API: 404 - User has not completed onboarding
🧭 Navigation decision: Onboarding
```

If you see "Navigation decision: Login" after a successful sign-in, there's an issue with the auth state.

## Files Changed

1. `mobile/src/store/useStore.ts` - Stopped persisting `hasCompletedOnboarding`
2. `mobile/src/navigation/RootNavigator.tsx` - Improved navigation logic and auth state handling
3. `mobile/src/hooks/useAuth.ts` - Enhanced logging
4. `mobile/src/screens/auth/LoginScreen.tsx` - Enhanced logging

## Additional Notes

- The `hasCompletedOnboarding` state is now **ephemeral** - it exists only in memory during the app session
- The API endpoint `/api/onboarding` is the **single source of truth** for whether a user has completed onboarding
- This ensures that even if the app state gets out of sync, it will be corrected on the next app launch

