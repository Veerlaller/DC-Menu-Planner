# 🔧 Fix Google Sign-In Setup

**Issue**: "The app doesn't pass the sign in with Google"  
**Status**: ✅ Code fixed, needs configuration

---

## 🎯 What Was Fixed

### Code Updates
- ✅ Updated Supabase client to use proper OAuth flow for React Native
- ✅ Added `expo-auth-session` and `expo-web-browser` integration
- ✅ Added custom URL scheme (`dcmenuplanner://`) for OAuth redirect
- ✅ Added better error handling and logging
- ✅ Created `.env` example file

---

## 📋 Setup Steps (5 Minutes)

### Step 1: Create or Access Your Supabase Project

**Option A: Create New Project**
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `DC Menu Planner`
   - **Database password**: (generate and save securely)
   - **Region**: Choose closest to you (e.g., `us-west-1`)
4. Wait ~2 minutes for provisioning

**Option B: Use Existing Project**
- If you already have a Supabase project, skip to Step 2

---

### Step 2: Get Your Supabase Credentials

1. Go to your **Supabase Dashboard**
2. Navigate to **Settings** → **API**
3. Find these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

**Keep these handy - you'll need them in Step 4**

---

### Step 3: Set Up Google OAuth in Supabase

#### 3a. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a new project** or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. If prompted, configure **OAuth consent screen**:
   - User Type: **External**
   - App name: `DC Menu Planner`
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through all screens
6. Back to **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: `DC Menu Planner`
   - **Authorized redirect URIs** - Add this:
     ```
     https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
     ```
     Replace `YOUR-PROJECT-ID` with your actual Supabase project ID
     (Find it in your Supabase project URL)
7. Click **Create**
8. **Copy** the **Client ID** and **Client Secret**

#### 3b. Configure Google Provider in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle **Enable** to ON
5. Paste your **Client ID** and **Client Secret** from Step 3a
6. Click **Save**

#### 3c. Add Additional Redirect URLs (for mobile)

1. Still in **Authentication** → **Providers** → **Google**
2. Scroll to **Redirect URLs** section
3. Add these additional URLs:
   ```
   dcmenuplanner://auth/callback
   exp://localhost:19000/--/auth/callback
   ```
4. Click **Save**

---

### Step 4: Configure Your Mobile App

#### 4a. Create `.env` file

In your `mobile/` folder, create a new file named `.env`:

**Windows Command Prompt:**
```cmd
cd mobile
copy env.example.txt .env
```

**Mac/Linux Terminal:**
```bash
cd mobile
cp env.example.txt .env
```

**Or manually:** Create a new file in `mobile/` folder called `.env`

#### 4b. Edit `.env` with your credentials

Open `mobile/.env` and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace with your actual values from Step 2!**

⚠️ **Important**: 
- No quotes needed around the values
- No spaces before or after the `=`
- Make sure the key starts with `EXPO_PUBLIC_`

---

### Step 5: Restart Your App

1. **Stop** the Metro bundler (Ctrl+C in terminal)
2. Clear cache and restart:

```bash
cd mobile
npm start -- --clear
```

3. Press `w` for web, `i` for iOS, or `a` for Android

---

## 🧪 Test Google Sign-In

### Testing Steps:

1. **Launch the app**
   - You should see the Login screen
   - If it goes straight to onboarding, clear AsyncStorage first

2. **Click "Sign in with Google"**
   - A browser window should open
   - You'll see Google's sign-in page

3. **Sign in with your Google account**
   - Use any Google account (or @ucdavis.edu for UC Davis)
   - Grant permissions when prompted

4. **Check the console for logs**
   - You should see: `✅ Sign in successful!`
   - The app should redirect to onboarding or main screen

---

## 🐛 Troubleshooting

### Issue: "Supabase credentials not configured"

**Solution**: 
- Make sure `.env` file exists in `mobile/` folder
- Check that values start with `EXPO_PUBLIC_`
- Restart the app with `npm start -- --clear`

---

### Issue: OAuth opens but then fails

**Possible causes:**

1. **Redirect URLs not configured in Google Cloud Console**
   - Go back to Step 3a
   - Make sure you added the Supabase callback URL
   - Add: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`

2. **Google OAuth not enabled in Supabase**
   - Go to Supabase → Authentication → Providers
   - Make sure Google is **Enabled** (green toggle)
   - Check that Client ID and Secret are filled in

3. **Wrong Client ID/Secret**
   - Re-copy from Google Cloud Console
   - Make sure there are no extra spaces
   - Re-save in Supabase

---

### Issue: "Invalid redirect URI"

**Solution**: Add all these redirect URIs in Google Cloud Console:

```
https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
dcmenuplanner://auth/callback
exp://localhost:19000/--/auth/callback
http://localhost:19006/auth/callback
```

---

### Issue: Browser opens but shows Supabase 404

**Possible causes:**
- Google OAuth not enabled in Supabase
- Client ID/Secret not saved in Supabase
- Wrong Supabase URL in `.env`

**Solution**:
1. Double-check Supabase Dashboard → Authentication → Providers → Google
2. Make sure it's **Enabled** and credentials are saved
3. Verify your `.env` has the correct Supabase URL

---

### Issue: "No tokens received from OAuth"

**Solution**: 
- Check browser console for errors
- Make sure you're using the correct redirect URL scheme
- Try clearing app data and signing in again

---

## 🔍 Debugging Tips

### Enable Verbose Logging

The updated code includes console logs. Check your terminal for:

```
Starting Google Sign In...
Redirect URL: dcmenuplanner://auth/callback
Opening auth URL: https://...
✅ Sign in successful!
```

### Test on Web First

Web is easiest to debug:

```bash
cd mobile
npm start
# Press 'w' for web
```

Open browser console (F12) to see detailed logs.

### Check AsyncStorage

If the app thinks you're signed in but you're not:

```typescript
// Add this temporarily to LoginScreen
import AsyncStorage from '@react-native-async-storage/async-storage';

// In handleGoogleSignIn, before try:
await AsyncStorage.clear();
console.log('Cleared AsyncStorage');
```

---

## ✅ Success Checklist

Before it works, ensure:

- [ ] Supabase project created
- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Redirect URIs added in Google Cloud Console
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret saved in Supabase
- [ ] `.env` file created in `mobile/` folder
- [ ] Supabase URL and key added to `.env`
- [ ] App restarted with `npm start -- --clear`
- [ ] Browser opens when clicking "Sign in with Google"
- [ ] Can sign in with Google account
- [ ] App redirects to onboarding after sign-in

---

## 🎯 Quick Reference

### Where to Find Things:

| What | Where |
|------|-------|
| **Supabase credentials** | Supabase Dashboard → Settings → API |
| **Google OAuth credentials** | Google Cloud Console → APIs & Services → Credentials |
| **Enable Google in Supabase** | Supabase Dashboard → Authentication → Providers |
| **Add redirect URIs** | Google Cloud Console → Credentials → Edit OAuth client |
| **Check OAuth config** | Supabase Dashboard → Authentication → Providers → Google |

---

## 🚀 What Happens After Sign-In?

1. User signs in with Google ✅
2. Supabase creates a user record in `auth.users` table
3. JWT token returned to mobile app
4. Session stored in AsyncStorage
5. `useAuth()` hook detects authenticated user
6. `RootNavigator` checks if onboarding is complete:
   - **If not**: Shows onboarding flow
   - **If yes**: Shows main app
7. All API requests include JWT token in Authorization header

---

## 📝 Next Steps After Sign-In Works

Once Google Sign-In is working:

1. **Complete onboarding** with a test account
2. **Check database** - User profile should save to Supabase
3. **Test sign-out** - Go to Profile tab → Sign Out
4. **Test returning user** - Sign in again, should skip onboarding

---

## 🔐 Security Notes

### For Development:
- Any Google account can sign in
- No email domain restrictions

### For Production (Optional):
Restrict to UC Davis emails only:

1. Supabase Dashboard → Authentication → URL Configuration
2. **Allowed Email Domains**: `ucdavis.edu`
3. Save

---

## 📚 Related Documentation

- [Google OAuth Setup Guide](GOOGLE_OAUTH_SETUP.md) - Detailed implementation
- [Connection Guide](../guides/CONNECTION_GUIDE.md) - API endpoints
- [Database Fix](../troubleshooting/FIX_DATABASE.md) - Database issues

---

## 🆘 Still Having Issues?

### Check Console Logs

Look for these specific errors:

1. **"Supabase credentials not configured"**
   - `.env` file missing or incorrect

2. **"Invalid OAuth client"**
   - Client ID/Secret wrong in Supabase

3. **"Redirect URI mismatch"**
   - Redirect URLs not added in Google Cloud Console

4. **Network errors**
   - Check internet connection
   - Verify Supabase URL is correct

### Test Components Individually

1. **Test Supabase connection**:
   ```typescript
   // Add to LoginScreen temporarily
   const testConnection = async () => {
     const { data, error } = await supabase.from('user_profiles').select('count');
     console.log('Connection test:', { data, error });
   };
   ```

2. **Test Google OAuth config**:
   - Go directly to: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/authorize?provider=google`
   - Should redirect to Google sign-in (not 404)

---

**Once sign-in works, you're ready to use the full app!** 🎉

The authentication system will:
- ✅ Store sessions securely
- ✅ Auto-refresh tokens
- ✅ Persist across app restarts
- ✅ Work with backend API
- ✅ Support sign-out


