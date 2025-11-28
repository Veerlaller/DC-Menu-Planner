# 🚀 Google Sign-In Quick Start

**Issue Fixed**: Google Sign-In now properly configured for React Native/Expo  
**Time**: ~5 minutes to configure

---

## ⚡ Quick Setup (3 Steps)

### 1️⃣ Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) → Your project
2. **Settings** → **API**
3. Copy:
   - Project URL
   - anon public key

### 2️⃣ Enable Google OAuth

1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth Client ID (Web application)
   - Add redirect: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
2. In Supabase: **Authentication** → **Providers** → **Google**
   - Enable and paste Client ID + Secret

### 3️⃣ Configure Mobile App

Create `mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

Restart app:
```bash
cd mobile
npm start -- --clear
```

---

## ✅ Test It

1. Click "Sign in with Google"
2. Browser opens → Sign in
3. App redirects to onboarding
4. ✅ Done!

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| "Credentials not configured" | Check `.env` file exists and has correct values |
| OAuth opens but fails | Add redirect URL in Google Cloud Console |
| "Invalid client" | Re-check Client ID/Secret in Supabase |
| Browser shows 404 | Enable Google provider in Supabase |

---

## 📚 Full Details

See: [`docs/setup/FIX_GOOGLE_SIGNIN.md`](docs/setup/FIX_GOOGLE_SIGNIN.md)

---

## 🎯 What Changed

### Files Updated:
- ✅ `mobile/src/lib/supabase.ts` - Added proper OAuth handling
- ✅ `mobile/src/screens/auth/LoginScreen.tsx` - Fixed sign-in flow
- ✅ `mobile/app.json` - Added custom URL scheme
- ✅ `mobile/env.example.txt` - Created .env template

### What It Does Now:
- ✅ Uses `expo-web-browser` for OAuth (works on mobile)
- ✅ Custom URL scheme: `dcmenuplanner://`
- ✅ Proper token extraction from callback
- ✅ Better error messages
- ✅ Console logging for debugging

---

## 🔧 Commands Reference

```bash
# Create .env file (Windows)
cd mobile
copy env.example.txt .env

# Create .env file (Mac/Linux)
cd mobile
cp env.example.txt .env

# Restart app with cleared cache
cd mobile
npm start -- --clear

# Run on different platforms
npm start          # Choose platform
npm run web        # Web browser
npm run ios        # iOS simulator
npm run android    # Android emulator
```

---

## 🎊 Success Looks Like

Console output:
```
Starting Google Sign In...
Redirect URL: dcmenuplanner://auth/callback
Opening auth URL: https://...
✅ Sign in successful!
```

App behavior:
1. Login screen → Click "Sign in with Google"
2. Browser opens → Google sign-in page
3. Complete sign-in
4. Browser closes
5. App shows onboarding (first time) or main app (returning user)

---

**Need help?** See detailed guide: [`docs/setup/FIX_GOOGLE_SIGNIN.md`](docs/setup/FIX_GOOGLE_SIGNIN.md)

