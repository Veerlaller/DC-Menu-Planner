# ✅ Google Sign-In Setup Checklist

Print this out or keep it open while configuring!

---

## ⚠️ IMPORTANT: About Redirect URIs

When setting up Google OAuth, you will ONLY add **ONE** redirect URI:

```
https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
```

**DO NOT try to add:**
- ❌ `dcmenuplanner://auth/callback` (Google will reject this - it's not a valid HTTPS URL)
- ❌ `http://localhost:19006`
- ❌ `exp://localhost:8081`

The custom scheme (`dcmenuplanner://`) is automatically handled by Expo/React Native. Google only needs the Supabase callback URL!

---

## 📋 Pre-Setup

- [ ] Code fixes applied (already done! ✅)
- [ ] Have a Google account
- [ ] Have 5-10 minutes
- [ ] Have access to Supabase account
- [ ] Have access to Google Cloud Console

---

## 🔧 Setup Steps

### 1. Supabase Project

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project (or use existing)
- [ ] Wait for provisioning (~2 min)
- [ ] Navigate to: **Settings** → **API**
- [ ] Copy **Project URL**: `_______________________`
- [ ] Copy **anon public key**: `_______________________`

### 2. Google Cloud Console

- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com/)
- [ ] Create new project (or select existing)
- [ ] Navigate to: **APIs & Services** → **Credentials**
- [ ] Click: **Create Credentials** → **OAuth client ID**
- [ ] Configure consent screen if prompted
  - [ ] User Type: External
  - [ ] App name: DC Menu Planner
  - [ ] Add your email
  - [ ] Save and continue through all screens
- [ ] Back to **Credentials** → Create OAuth client:
  - [ ] Type: **Web application**
  - [ ] Name: DC Menu Planner
  - [ ] **Authorized redirect URIs** - Add ONLY this:
    ```
    https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
    ```
    ⚠️ **Replace `[YOUR-PROJECT-ID]` with your actual Supabase project ID**
    
    Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
    
    ⚠️ **DO NOT add** `dcmenuplanner://auth/callback` here - that's handled by the app!
- [ ] Click **Create**
- [ ] Copy **Client ID**: `_______________________`
- [ ] Copy **Client Secret**: `_______________________`

### 3. Enable Google in Supabase

- [ ] In Supabase Dashboard: **Authentication** → **Providers**
- [ ] Find **Google** in the list
- [ ] Toggle **Enable** to ON (green)
- [ ] Paste **Client ID** from step 2
- [ ] Paste **Client Secret** from step 2
- [ ] Click **Save**

### 4. Setup Database (Backend)

- [ ] Make sure you have the database schema created
- [ ] In Supabase Dashboard: **SQL Editor**
- [ ] Run the schema from `server/db/schema.sql`
- [ ] Verify tables exist:
  - [ ] `user_profiles`
  - [ ] `user_preferences`
  - [ ] `dining_halls`
  - [ ] `menu_days`
  - [ ] `menu_items`
  - [ ] `nutrition_facts`
  - [ ] `meal_logs`

### 5. Configure Backend (.env)

- [ ] Open terminal/command prompt
- [ ] Navigate to server folder:
  ```bash
  cd server
  ```
- [ ] Create `.env` file (if not exists)
- [ ] Add these values:
  ```env
  PORT=4000
  NODE_ENV=development
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  SUPABASE_JWT_SECRET=your-jwt-secret
  ```
- [ ] Get Service Role Key from Supabase: **Settings** → **API**
- [ ] Get JWT Secret from Supabase: **Settings** → **API** → **JWT Settings**

### 6. Configure Mobile App

- [ ] Open terminal/command prompt
- [ ] Navigate to mobile folder:
  ```bash
  cd mobile
  ```
- [ ] Create .env file:
  ```bash
  # Windows
  copy env.example.txt .env
  
  # Mac/Linux
  cp env.example.txt .env
  ```
- [ ] Open `mobile/.env` in text editor
- [ ] Paste Supabase URL from step 1
- [ ] Paste Supabase anon key from step 1
- [ ] Save file
- [ ] Verify it looks like:
  ```env
  EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
  ```
  
  ⚠️ **Important**:
  - No quotes around values
  - No spaces before or after `=`
  - Keys must start with `EXPO_PUBLIC_`

### 7. Start Backend Server

- [ ] Open new terminal window
- [ ] Navigate to server folder:
  ```bash
  cd server
  ```
- [ ] Install dependencies (if not done):
  ```bash
  npm install
  ```
- [ ] Start the backend:
  ```bash
  npm run dev
  ```
- [ ] Should see: `Server listening on port 4000`
- [ ] Test health endpoint:
  ```bash
  curl http://localhost:4000/health
  ```
- [ ] Should return: `{"status":"ok"}`

**⚠️ KEEP THIS TERMINAL OPEN - Backend must run for sign-in to work!**

### 8. Restart Mobile App

- [ ] Stop current dev server (Ctrl+C)
- [ ] Clear cache and restart:
  ```bash
  npm start -- --clear
  ```
- [ ] Wait for bundling to complete
- [ ] Press `w` for web (or `i`/`a` for iOS/Android)

---

## 🧪 Testing

### Phase 1: Sign-In Test

- [ ] Backend is running (see Step 7)
- [ ] App loads and shows Login screen
- [ ] Open browser console (F12) if using web
- [ ] Click "Sign in with Google" button
- [ ] Loading spinner appears on button
- [ ] Browser window/tab opens
- [ ] See Google sign-in page
- [ ] Sign in with Google account
- [ ] Grant permissions to app
- [ ] Browser closes/redirects automatically
- [ ] See "Checking profile..." loading screen
- [ ] Console shows: `✅ Sign in successful!`
- [ ] Console shows: `🔍 Checking if user has completed onboarding...`

### Phase 2: New User Flow (First Time)

**For a NEW Google account (never used this app before):**

- [ ] After "Checking profile...", see **Onboarding Flow**
- [ ] Welcome screen appears
- [ ] Console shows: `📝 User needs to complete onboarding`
- [ ] Can navigate through onboarding screens:
  - [ ] Welcome Screen (introduction)
  - [ ] Basic Info (height, weight, age, sex)
  - [ ] Goals (fitness goal, activity level)
  - [ ] Preferences (dietary restrictions)
  - [ ] Complete (shows calculated macros)
- [ ] Click "Start Tracking"
- [ ] Profile saves to backend
- [ ] Redirects to Main App (Today screen)
- [ ] Can see empty Today screen with targets

### Phase 3: Returning User Flow

**For a RETURNING user (has completed onboarding before):**

- [ ] Sign out from Profile tab
- [ ] Sign in again with same Google account
- [ ] After "Checking profile...", see **Main App** (skip onboarding)
- [ ] Console shows: `✅ User has completed onboarding`
- [ ] Lands on Today screen
- [ ] Can see previous data/settings

---

## ✅ Success Indicators

### Console Logs (New User):
```
Starting Google Sign In...
Redirect URL: dcmenuplanner://auth/callback
Opening auth URL: https://...
✅ Sign in successful!
🔐 Auth state changed: { isAuthenticated: true, ... }
🔍 Checking if user has completed onboarding...
   User ID: abc-123-def-456
   User Email: user@gmail.com
🌐 API Request: GET /api/onboarding
🔑 Added auth headers - User ID: abc-123-def-456
📡 API: 404 - User has not completed onboarding
📊 Profile check result: false
📝 User needs to complete onboarding - showing Onboarding Flow
🧭 Navigation decision: { decision: 'Onboarding' }
```

### Console Logs (Returning User):
```
✅ Sign in successful!
🔍 Checking if user has completed onboarding...
📡 API: Response received: { status: 200, hasProfile: true }
✅ User has completed onboarding - going to Main App
🧭 Navigation decision: { decision: 'Main App' }
```

### App Behavior:

**New User Flow:**
```
Login → Google OAuth → "Checking profile..." → Onboarding (5 screens) → Main App
```

**Returning User Flow:**
```
Login → Google OAuth → "Checking profile..." → Main App (direct)
```

---

## 🐛 Troubleshooting

### Issue: "Supabase credentials not configured"

**Symptoms:**
- Warning in console about credentials
- Sign in button does nothing

**Checklist:**
- [ ] `.env` file exists in `mobile/` folder (not `env.example.txt`)
- [ ] Values don't have quotes around them
- [ ] Keys start with `EXPO_PUBLIC_`
- [ ] No spaces before or after `=`
- [ ] Restarted app with `npm start -- --clear`
- [ ] Cleared browser cache (if using web)

---

### Issue: "Invalid OAuth client" or "Access Denied"

**Symptoms:**
- Google OAuth page shows error
- "Invalid client" message

**Checklist:**
- [ ] Client ID is correct in Supabase (no extra spaces)
- [ ] Client Secret is correct in Supabase (no extra spaces)
- [ ] Google provider is **Enabled** in Supabase (green toggle)
- [ ] Clicked "Save" in Supabase after entering credentials
- [ ] Used correct OAuth type: **Web application** (not iOS/Android)

---

### Issue: "Redirect URI mismatch"

**Symptoms:**
- Error: "redirect_uri_mismatch"
- Can't complete OAuth

**Checklist:**
- [ ] Added callback URL in Google Cloud Console → Credentials
- [ ] URL format is EXACTLY: `https://YOUR-ID.supabase.co/auth/v1/callback`
- [ ] Used your ACTUAL Supabase project ID (check Supabase URL)
- [ ] No trailing slash at the end
- [ ] Clicked "Save" in Google Console
- [ ] **Did NOT add** `dcmenuplanner://` - that's automatic!

**How to find your project ID:**
- Look at your Supabase URL: `https://[THIS-PART].supabase.co`
- Example: If URL is `https://abcxyz123.supabase.co`, use `abcxyz123`

---

### Issue: Browser shows 404 or blank page

**Symptoms:**
- Browser opens but shows Supabase 404 error
- Or blank page

**Checklist:**
- [ ] Google provider **Enabled** in Supabase
- [ ] Client ID and Secret saved in Supabase
- [ ] Correct Supabase URL in mobile `.env`
- [ ] URL in `.env` includes `https://` prefix

---

### Issue: OAuth completes but doesn't redirect to onboarding

**Symptoms:**
- Sign in works
- Browser closes
- But app stays on login screen or goes to wrong screen

**Checklist:**
- [ ] Backend is running on port 4000
- [ ] Check terminal for backend errors
- [ ] Console shows: `✅ Sign in successful!`
- [ ] Console shows: `🔍 Checking if user has completed onboarding...`
- [ ] Console shows API call: `🌐 API Request: GET /api/onboarding`
- [ ] Backend responds (check backend terminal for logs)

**Debug:**
```bash
# Test backend is running:
curl http://localhost:4000/health

# Should return: {"status":"ok"}
```

---

### Issue: Goes to Main App instead of Onboarding

**Symptoms:**
- Sign in works
- But shows Main App instead of onboarding for new user

**This means:** User already has a profile in the database!

**Options:**
1. **Use a different Google account** (recommended for testing)
2. **Delete the profile from database:**
   - Go to Supabase Dashboard
   - SQL Editor
   - Run:
     ```sql
     DELETE FROM user_profiles WHERE user_id = 'your-user-id';
     DELETE FROM user_preferences WHERE user_id = 'your-user-id';
     ```
   - Sign in again

---

### Issue: Network error / Can't reach backend

**Symptoms:**
- Console shows: `❌ Network Error`
- "No response received from server"

**Checklist:**
- [ ] Backend terminal is open and running
- [ ] Backend shows: "Server listening on port 4000"
- [ ] No errors in backend terminal
- [ ] Test with: `curl http://localhost:4000/health`
- [ ] Firewall not blocking port 4000
- [ ] Using `localhost` not `127.0.0.1` or other IP

---

---

## 🔍 Quick Reference

### Where to Find Your Supabase Project ID

1. Go to your Supabase Dashboard
2. Look at the browser URL: `https://supabase.com/dashboard/project/[THIS-IS-YOUR-ID]`
3. Or check your Project URL: `https://[THIS-IS-YOUR-ID].supabase.co`

**Example:**
- URL: `https://abcdefg123456.supabase.co`
- Project ID: `abcdefg123456`

### The ONLY Redirect URI for Google Console

```
https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
```

**Replace `[YOUR-PROJECT-ID]`** with your actual ID!

**DO NOT ADD:**
- ❌ `dcmenuplanner://auth/callback`
- ❌ `http://localhost:19006`
- ❌ `exp://localhost:8081`

These are handled automatically by the app!

---

## 📞 Need Help?

**Documentation:**
- **Quick Start**: `GOOGLE_SIGNIN_QUICKSTART.md`
- **Detailed Guide**: `docs/setup/FIX_GOOGLE_SIGNIN.md`
- **Debug Guide**: `DEBUG_OAUTH_FLOW.md`
- **Summary**: `GOOGLE_SIGNIN_FIX_SUMMARY.md`

**Still Stuck?**
1. Check the console logs (F12 in browser)
2. Read `DEBUG_OAUTH_FLOW.md` for detailed debugging
3. Make sure backend is running (`cd server && npm run dev`)

---

## 🎉 After It Works

### Final Verification

- [ ] **Sign-in works**: Can sign in with Google
- [ ] **Onboarding shows**: New users see onboarding flow
- [ ] **Profile saves**: Can complete onboarding
- [ ] **Main app loads**: After onboarding, see Today screen
- [ ] **Sign-out works**: Profile tab → Sign Out → returns to login
- [ ] **Sign-in again**: Returning users skip to main app
- [ ] **Session persists**: Close and reopen app → still signed in
- [ ] **Backend active**: Check Supabase Dashboard → Authentication → Users

### Check Database

- [ ] Go to Supabase Dashboard → **Table Editor**
- [ ] Check `user_profiles` table has your data
- [ ] Check `user_preferences` table has your data
- [ ] Data matches what you entered in onboarding

### Test Complete Flow

**New User:**
```
1. Sign in → ✅
2. See onboarding → ✅
3. Enter info (height, weight, etc.) → ✅
4. See calculated macros → ✅
5. Click "Start Tracking" → ✅
6. Land on Today screen → ✅
7. Can browse Menus tab → ✅
8. Can use Hungry Now tab → ✅
9. Profile tab shows info → ✅
10. Sign out works → ✅
```

**Returning User:**
```
1. Sign in → ✅
2. Skip onboarding → ✅
3. Go straight to Today screen → ✅
4. Data preserved → ✅
```

---

## 📝 Completion Notes

**Date Completed**: _______________  
**Time Taken**: _______________  
**Google Account Used**: _______________  
**Supabase Project ID**: _______________

### Issues Encountered (if any):

```
[Write any issues you faced and how you resolved them]




```

### Configuration Values (for your records):

**Supabase:**
- Project URL: `_________________________________`
- Project ID: `_________________________________`

**Google Cloud Console:**
- Project Name: `_________________________________`
- OAuth Client ID: `_________________________________`

---

## ✅ Status

- [ ] Google OAuth configured
- [ ] Supabase configured
- [ ] Mobile app configured
- [ ] Backend configured and running
- [ ] Database schema created
- [ ] Sign-in tested and working
- [ ] Onboarding flow tested
- [ ] Main app accessible
- [ ] Sign-out tested
- [ ] Ready for development! 🎉

---

✨ **Congratulations! Your Google Sign-In and Onboarding Flow are working!** ✨

**Next Steps:**
1. Start building features in the main app
2. Test meal logging functionality
3. Add more dining hall menu data
4. Customize onboarding questions (optional)
5. Deploy to production when ready

