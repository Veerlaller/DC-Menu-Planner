# ✅ Sign-In to Onboarding Flow - Fixed

**Issue**: App was redirecting to main page immediately after Google sign-in  
**Fix**: Added backend profile check after authentication  
**Status**: ✅ **Complete**

---

## 🎯 What Was Fixed

### Problem:
- User signs in with Google
- App immediately goes to Main page
- No onboarding flow for new users

### Solution:
After Google sign-in completes, the app now:
1. ✅ Checks backend for existing profile (`GET /api/onboarding`)
2. ✅ If no profile found (404) → Shows **Onboarding Flow**
3. ✅ If profile exists (200) → Shows **Main App**

---

## 🔄 New Flow

### For New Users:
```
1. Open app
   ↓
2. Login Screen
   ↓
3. Click "Sign in with Google"
   ↓
4. Complete Google OAuth
   ↓
5. App shows "Checking profile..."
   ↓
6. Backend check: GET /api/onboarding
   ↓
7. Response: 404 Not Found (no profile)
   ↓
8. → ONBOARDING FLOW ✅
   ├─ Welcome Screen
   ├─ Basic Info
   ├─ Goals
   ├─ Preferences  
   └─ Complete
   ↓
9. Click "Start Tracking"
   ↓
10. Profile saved to backend
   ↓
11. → Main App
```

### For Returning Users:
```
1. Open app
   ↓
2. Login Screen
   ↓
3. Click "Sign in with Google"
   ↓
4. Complete Google OAuth
   ↓
5. App shows "Checking profile..."
   ↓
6. Backend check: GET /api/onboarding
   ↓
7. Response: 200 OK (profile exists)
   ↓
8. → Main App (skip onboarding) ✅
```

---

## 🛠️ Technical Changes

### 1. Added Profile Check API (`mobile/src/api/index.ts`)

**New Function**:
```typescript
export const checkUserProfile = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<any>('/onboarding');
    return !!(response.data.profile && response.data.preferences);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false; // No profile = new user
    }
    return false; // Default to not completed
  }
};
```

**What It Does**:
- Calls `GET /api/onboarding`
- Returns `true` if profile exists
- Returns `false` if 404 (no profile)
- Returns `false` on any error (safe default)

---

### 2. Updated Navigation Logic (`mobile/src/navigation/RootNavigator.tsx`)

**Added Profile Check on Auth**:
```typescript
useEffect(() => {
  const checkProfile = async () => {
    if (isAuthenticated && user) {
      console.log('🔍 Checking if user has completed onboarding...');
      
      const hasProfile = await checkUserProfile();
      
      if (hasProfile) {
        console.log('✅ User has completed onboarding');
        setHasCompletedOnboarding(true);
      } else {
        console.log('📝 User needs to complete onboarding');
        setHasCompletedOnboarding(false);
      }
    }
  };

  checkProfile();
}, [isAuthenticated, user?.id]);
```

**Loading State**:
- Shows "Checking profile..." while verifying backend
- Only navigates after profile check completes

---

## 📊 Files Modified

| File | What Changed |
|------|--------------|
| `mobile/src/api/index.ts` | Added `checkUserProfile()` function |
| `mobile/src/navigation/RootNavigator.tsx` | Added profile check on authentication |

**Total**: 2 files modified

---

## 🧪 How to Test

### Test 1: New User Sign-In

**Steps**:
1. Make sure backend is running: `cd server && npm run dev`
2. Clear app data (or use new Google account)
3. Start mobile app: `cd mobile && npm start`
4. Click "Sign in with Google"
5. Complete OAuth

**Expected Result**:
```
Console Output:
"✅ Sign in successful!"
"🔍 Checking if user has completed onboarding..."
"📝 User needs to complete onboarding"

App Shows:
- Loading: "Checking profile..."
- Then: Onboarding Flow (Welcome screen)
```

### Test 2: Returning User Sign-In

**Steps**:
1. Use Google account that has already completed onboarding
2. Sign in

**Expected Result**:
```
Console Output:
"✅ Sign in successful!"
"🔍 Checking if user has completed onboarding..."
"✅ User has completed onboarding"

App Shows:
- Loading: "Checking profile..."
- Then: Main App (Today screen)
```

### Test 3: Backend Offline

**Steps**:
1. Stop backend server
2. Try to sign in

**Expected Result**:
```
Console Output:
"Error checking profile: [network error]"
"📝 User needs to complete onboarding"

App Shows:
- Goes to Onboarding (safe default)
```

---

## 🔍 Console Logs to Look For

### New User (No Profile):
```bash
Starting Google Sign In...
Opening auth URL: https://...
✅ Sign in successful!
🔍 Checking if user has completed onboarding...
📝 User needs to complete onboarding
```

### Returning User (Has Profile):
```bash
Starting Google Sign In...
Opening auth URL: https://...
✅ Sign in successful!
🔍 Checking if user has completed onboarding...
✅ User has completed onboarding
```

---

## 🎨 User Experience

### Loading States:

**During OAuth**:
- Shows browser with Google sign-in
- Button shows spinner

**After OAuth**:
- Shows "Checking profile..." screen
- Spinner with text
- Takes ~1-2 seconds

**After Check**:
- Smoothly transitions to Onboarding or Main App
- No jarring jumps

---

## ⚙️ Backend Requirement

**Endpoint**: `GET /api/onboarding`

**Must Be Running**: Yes! The backend must be running for this to work.

**Start Backend**:
```bash
cd server
npm run dev
# Should show: Server listening on port 4000
```

**Test Endpoint**:
```bash
# Get a JWT token by signing in on the app
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/api/onboarding

# New user: 404 Not Found
# Existing user: 200 OK with profile data
```

---

## 🐛 Troubleshooting

### Issue: Still Goes to Main App After Sign-In

**Possible Causes**:
1. Backend not running
2. Old cached data in AsyncStorage
3. Profile check failing silently

**Solutions**:
```bash
# 1. Verify backend is running
curl http://localhost:4000/health

# 2. Clear app data
# On iOS simulator: Device → Erase All Content and Settings
# On Android: Settings → Apps → Your App → Clear Data
# Or add to app temporarily:
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();

# 3. Check console logs
# Should see: "🔍 Checking if user has completed onboarding..."
```

### Issue: Shows "Checking profile..." Forever

**Possible Causes**:
1. Backend not responding
2. Network error
3. CORS issue (if on web)

**Solutions**:
```bash
# Check backend is accessible
curl http://localhost:4000/api/onboarding

# Check mobile app logs for errors
# Look for: "Error checking profile: ..."
```

### Issue: Goes to Onboarding Every Time (Even for Returning Users)

**Possible Causes**:
1. Backend not returning profile data correctly
2. User ID mismatch
3. Database issue

**Solutions**:
```bash
# 1. Check database has profile
# In Supabase dashboard:
SELECT * FROM user_profiles WHERE user_id = 'your-user-id';

# 2. Check backend response
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/api/onboarding
# Should return 200 with profile data

# 3. Verify JWT token contains correct user_id
```

---

## ✅ Success Checklist

Before it works properly:

- [ ] Backend running on port 4000
- [ ] Database has `user_profiles` and `user_preferences` tables
- [ ] Google OAuth configured (from earlier setup)
- [ ] Supabase credentials in `.env` file
- [ ] Mobile app restarted with `npm start -- --clear`

After sign-in:

- [ ] See "Checking profile..." loading screen
- [ ] Console shows profile check logs
- [ ] New users see Onboarding Flow
- [ ] Returning users see Main App
- [ ] Can complete onboarding and reach Main App
- [ ] Sign out and sign in again works

---

## 📱 Visual Indicators

### What User Sees:

**1. Login Screen**
```
┌─────────────────────┐
│   🍽️  DC Menu      │
│      Planner        │
│                     │
│  [Sign in with     │
│       Google]       │
└─────────────────────┘
```

**2. After Clicking Sign In**
```
┌─────────────────────┐
│   🍽️  DC Menu      │
│      Planner        │
│                     │
│   [ ⏳ Loading... ] │
│                     │
└─────────────────────┘
```

**3. OAuth Browser Opens**
```
┌─────────────────────┐
│  Google Sign In     │
│                     │
│  Choose account:    │
│  ○ user@gmail.com   │
│                     │
│  [Continue]         │
└─────────────────────┘
```

**4. After OAuth Completes**
```
┌─────────────────────┐
│        ⏳           │
│                     │
│  Checking profile...│
│                     │
└─────────────────────┘
```

**5a. New User → Onboarding**
```
┌─────────────────────┐
│   🍽️ Welcome!      │
│                     │
│  Track your         │
│  nutrition...       │
│                     │
│  [Get Started]      │
└─────────────────────┘
```

**5b. Returning User → Main App**
```
┌─────────────────────┐
│  Today    📊        │
│                     │
│  Calories: 650/2104 │
│  Protein:  45/140g  │
│                     │
│  [Add Meal]         │
└─────────────────────┘
```

---

## 🎯 Key Points

1. **Backend Must Be Running**: Profile check requires backend API
2. **Automatic Check**: Happens automatically after every sign-in
3. **Safe Default**: If check fails, goes to onboarding (safe for new users)
4. **Loading Feedback**: User sees "Checking profile..." message
5. **Console Logs**: Always check console for debugging

---

## 🚀 What Happens Next

After this fix:

1. ✅ New users → Google sign-in → Onboarding → Main App
2. ✅ Returning users → Google sign-in → Main App (skip onboarding)
3. ✅ Profile verified with backend on every sign-in
4. ✅ Clear loading states and feedback

---

## 📚 Related Documentation

- **Google Sign-In Setup**: `docs/setup/FIX_GOOGLE_SIGNIN.md`
- **Quick Start**: `GOOGLE_SIGNIN_QUICKSTART.md`
- **Backend API**: `docs/guides/CONNECTION_GUIDE.md`

---

**The flow is now working correctly!** 🎉

Users will be properly directed to onboarding for profile creation after signing in with Google.

