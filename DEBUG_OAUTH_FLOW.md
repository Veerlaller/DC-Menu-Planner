# 🔍 Debug OAuth to Onboarding Flow

**Issue**: After OAuth completes, app doesn't go to onboarding  
**Status**: Added comprehensive logging to debug

---

## 🧪 **Testing Steps**

### **1. Make Sure Backend Is Running**

**Terminal 1 - Start Backend**:
```bash
cd server
npm run dev
```

**Expected Output**:
```
Server listening on port 4000
Connected to Supabase
```

**Test Backend**:
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok"}
```

---

### **2. Clear App Data & Restart**

**Stop the app** (Ctrl+C in terminal)

**Clear cache and restart**:
```bash
cd mobile
npm start -- --clear
```

Press `w` for web (easiest to debug)

---

### **3. Open Browser Console**

- Press **F12** to open Developer Tools
- Go to **Console** tab
- Clear any old logs (🚫 icon)

---

### **4. Sign In & Watch Console**

Click "Sign in with Google" and watch the console logs carefully.

---

## 📊 **Expected Console Output**

### **If Everything Works Correctly**:

```bash
# 1. Initial load
📂 Loading persisted data...
🔐 Auth state changed: { isAuthenticated: false, ... }

# 2. After clicking "Sign in with Google"
Starting Google Sign In...
Redirect URL: dcmenuplanner://auth/callback
Opening auth URL: https://...

# 3. After OAuth completes
✅ Sign in successful!
🔐 Auth state changed: { isAuthenticated: true, userId: "...", ... }
🔍 Checking if user has completed onboarding...
   User ID: abc-123-...
   User Email: user@example.com

# 4. API call
🌐 API Request: GET /api/onboarding
🔑 Added auth headers - User ID: abc-123-...

# 5. Backend response (NEW USER)
📡 API: Response received: { status: 404, ... }
📡 API: 404 - User has not completed onboarding
📊 Profile check result: false
📝 User needs to complete onboarding - showing Onboarding Flow
✓ Profile check complete
🧭 Navigation decision: { decision: 'Onboarding' }

# 6. Should now show Onboarding Flow
```

---

## 🐛 **Common Issues & What to Look For**

### **Issue 1: Backend Not Running**

**Console Output**:
```bash
❌ Network Error: [message]
   No response received from server
   Is the backend running on http://localhost:4000?
```

**Fix**:
```bash
cd server
npm run dev
```

---

### **Issue 2: No Auth Token**

**Console Output**:
```bash
🌐 API Request: GET /api/onboarding
⚠️ No session found - request will be unauthenticated
❌ API Error Response: { status: 401, ... }
```

**This means**: OAuth didn't complete properly

**Fix**: Check if Supabase is configured in `.env`:
```bash
# mobile/.env should have:
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

### **Issue 3: Auth State Not Updating**

**Console Output**:
```bash
# OAuth completes but you see:
🔐 Auth state changed: { isAuthenticated: false, ... }
```

**This means**: useAuth hook isn't detecting the session

**Possible causes**:
1. OAuth callback didn't complete
2. Tokens not extracted from callback URL
3. Session not set in Supabase

**Check LoginScreen.tsx** - Look for:
```bash
✅ Sign in successful!
```

If you don't see this, OAuth isn't completing.

---

### **Issue 4: Profile Check Not Running**

**Console Output**:
```bash
🔐 Auth state changed: { isAuthenticated: true, userId: "...", hasCheckedProfile: true }
# But no "🔍 Checking if user has completed onboarding..."
```

**This means**: The check was already done or skipped

**Fix**: Clear AsyncStorage and restart:
```typescript
// Add temporarily to LoginScreen
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

---

### **Issue 5: Goes to Main App Instead of Onboarding**

**Console Output**:
```bash
📡 API: Response received: { status: 200, hasProfile: true, ... }
📊 Profile check result: true
✅ User has completed onboarding - going to Main App
```

**This means**: User already has a profile in the database

**To test with a new user**:
1. Use a different Google account, OR
2. Delete the profile from database:
   ```sql
   -- In Supabase SQL Editor
   DELETE FROM user_profiles WHERE user_id = 'your-user-id';
   DELETE FROM user_preferences WHERE user_id = 'your-user-id';
   ```

---

### **Issue 6: hasCompletedOnboarding Still True**

**Console Output**:
```bash
🧭 Navigation decision: { hasCompletedOnboarding: true, decision: 'Main App' }
```

**But you expected it to be false**

**This means**: Old cached data in AsyncStorage

**Fix**:
```bash
# Clear browser storage (if using web):
# 1. Open DevTools (F12)
# 2. Application tab
# 3. Local Storage → Clear All
# 4. Refresh page

# Or clear in code:
AsyncStorage.clear();
```

---

## 🔧 **Quick Diagnostic Commands**

### **Check Backend Health**:
```bash
curl http://localhost:4000/health
```

### **Check Onboarding Endpoint (Unauthenticated)**:
```bash
curl http://localhost:4000/api/onboarding
# Should return: 401 Unauthorized (expected without token)
```

### **Check With Auth Token**:
```bash
# 1. Sign in on the app
# 2. Open console and run:
const session = await supabase.auth.getSession();
console.log('Token:', session.data.session?.access_token);

# 3. Copy the token and test:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:4000/api/onboarding

# New user: 404 with error message
# Existing user: 200 with profile data
```

---

## 📝 **Full Debug Checklist**

Run through this checklist and note where it fails:

- [ ] Backend running on port 4000
- [ ] Backend responds to `/health` endpoint
- [ ] Mobile app starts without errors
- [ ] Can see Login screen
- [ ] Click "Sign in with Google"
- [ ] Browser opens with Google OAuth
- [ ] Can sign in to Google
- [ ] Browser closes/redirects
- [ ] Console shows: `✅ Sign in successful!`
- [ ] Console shows: `🔍 Checking if user has completed onboarding...`
- [ ] Console shows: `🌐 API Request: GET /api/onboarding`
- [ ] Console shows: `🔑 Added auth headers`
- [ ] Console shows: API response (200 or 404)
- [ ] Console shows: Navigation decision
- [ ] App navigates to correct screen

**Where did it fail?** Note the last successful step and focus debugging there.

---

## 🎯 **What to Share for Help**

If still stuck, share:

1. **Full console output** from clicking "Sign in" to end
2. **Backend terminal output** (if any errors)
3. **Where the checklist failed** (last successful step)
4. **Environment details**:
   - Running on: Web / iOS / Android?
   - Backend running? Yes / No
   - Supabase configured? Yes / No
   - `.env` file exists? Yes / No

---

## 🚀 **Expected Behavior Summary**

**New User (No Profile)**:
```
Sign in → "Checking profile..." → 404 from backend → Onboarding Flow
```

**Returning User (Has Profile)**:
```
Sign in → "Checking profile..." → 200 from backend → Main App
```

**Backend Offline**:
```
Sign in → "Checking profile..." → Network error → Onboarding Flow (safe default)
```

---

## 💡 **Pro Tips**

1. **Use Web First**: Easier to debug with browser DevTools
2. **Clear Data Between Tests**: Prevent cached state issues
3. **Watch Console Continuously**: Don't miss any logs
4. **Test Backend Separately**: Verify it works before testing mobile
5. **One Thing at a Time**: Fix OAuth first, then profile check

---

**After following these steps, you should see exactly where the flow breaks! Share the console output and I can help fix the specific issue.** 🔍

