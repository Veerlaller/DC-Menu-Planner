# 🚀 Quick Start - Google OAuth

**Time to complete**: 20-30 minutes

---

## 🎯 What You'll Set Up

1. ✅ Supabase project (5 min)
2. ✅ Google OAuth credentials (10 min)
3. ✅ Environment configuration (5 min)
4. ✅ Test sign-in (5 min)

---

## Step 1: Create Supabase Project (5 min)

### 1.1 Sign Up / Log In
- Go to [supabase.com](https://supabase.com)
- Click **"Start your project"**
- Sign in with GitHub

### 1.2 Create Project
- Click **"New Project"**
- Organization: Select or create
- **Project name**: `dc-menu-planner`
- **Database password**: Generate strong password (save it!)
- **Region**: US West (closest to UC Davis)
- Click **"Create new project"**
- ⏳ Wait 2-3 minutes for provisioning

### 1.3 Get Your Credentials
Once ready, go to **Settings** → **API**:

Copy these values (you'll need them):
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public**: `eyJhbGciOiJIUzI1...` (public key)
- **service_role**: `eyJhbGciOiJIUzI1...` (secret key)

Also go to **Settings** → **API** → **JWT Settings**:
- **JWT Secret**: Long string starting with letters/numbers

---

## Step 2: Set Up Database (3 min)

### 2.1 Create Tables
1. In Supabase, go to **SQL Editor**
2. Open the file `server/db/schema.sql` in your project
3. Copy all contents
4. Paste into Supabase SQL Editor
5. Click **Run** (or Cmd+Enter)

### 2.2 Remove Foreign Keys (For Testing)
Run this SQL to allow testing without auth.users:

```sql
ALTER TABLE user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_preferences 
  DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE meal_logs 
  DROP CONSTRAINT IF EXISTS meal_logs_user_id_fkey;
```

---

## Step 3: Set Up Google OAuth (10 min)

### 3.1 Create Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click project dropdown → **"New Project"**
3. **Project name**: DC Menu Planner
4. Click **"Create"**
5. Select your new project

### 3.2 Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click it, then click **"Enable"**

### 3.3 Create OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. User Type: **External**
3. Click **"Create"**
4. Fill in:
   - **App name**: DC Menu Planner
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click **"Save and Continue"** through all screens

### 3.4 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **Web application**
4. Name: **DC Menu Planner Web**
5. **Authorized redirect URIs** - Add these two:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   exp://localhost:8081
   ```
   (Replace `xxxxx` with your Supabase project ID from Step 1.3)
6. Click **"Create"**
7. **Copy credentials**:
   - **Client ID**: `123456789-abc.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-...`

### 3.5 Configure in Supabase
1. Back in **Supabase Dashboard**
2. Go to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. **Enable Google provider** (toggle on)
5. Paste:
   - **Client ID**: From Step 3.4
   - **Client Secret**: From Step 3.4
6. Click **"Save"**

---

## Step 4: Configure Your App (5 min)

### 4.1 Mobile App Environment

Create `mobile/.env`:
```bash
cd /Users/veerlaller/Desktop/DC-Menu-Planner/mobile
touch .env
```

Add this content (replace with your values from Step 1.3):
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Backend Environment

Create `server/.env`:
```bash
cd /Users/veerlaller/Desktop/DC-Menu-Planner/server
touch .env
```

Add this content (replace with your values from Step 1.3):
```env
PORT=4000
NODE_ENV=development

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-settings
```

---

## Step 5: Start & Test! (5 min)

### 5.1 Start Backend
```bash
cd /Users/veerlaller/Desktop/DC-Menu-Planner/server
npm run dev
```

Should see:
```
🚀 Server running on http://localhost:4000
✅ Supabase connected
```

### 5.2 Start Mobile App
**New terminal**:
```bash
cd /Users/veerlaller/Desktop/DC-Menu-Planner/mobile
npm start
```

Press **`w`** for web

### 5.3 Test Sign In!
1. Browser should open to http://localhost:19006
2. You'll see **"Sign in with Google"** button
3. Click it
4. Choose your Google account (use @ucdavis.edu if you have one!)
5. Should redirect back to app
6. Complete onboarding
7. 🎉 Done!

### 5.4 Verify in Database
In Supabase:
1. Go to **Table Editor** → **user_profiles**
2. You should see your record with:
   - `user_id`: Real UUID from Google auth
   - `email`: Your email
   - `height_inches`, `weight_lbs`: Your data

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Foreign keys removed (for testing)
- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth credentials created
- [ ] Google provider enabled in Supabase
- [ ] `mobile/.env` configured
- [ ] `server/.env` configured
- [ ] Backend running on port 4000
- [ ] Mobile app running on port 19006
- [ ] Signed in with Google successfully
- [ ] Onboarding completed
- [ ] Data saved to database with real user ID

---

## 🚨 Common Issues

### "Invalid client: no registered origin"
**Fix**: Check redirect URIs in Google Cloud Console include:
- `https://xxxxx.supabase.co/auth/v1/callback`
- `exp://localhost:8081`

### "Could not find column 'height_inches'"
**Fix**: Run the database migration:
```bash
cd server
psql $DATABASE_URL < db/migrate-to-imperial.sql
```

Or in Supabase SQL Editor, paste contents of `server/db/migrate-to-imperial.sql`

### "Invalid JWT"
**Fix**: Make sure `SUPABASE_JWT_SECRET` in `server/.env` matches:
Supabase Dashboard → Settings → API → JWT Settings → JWT Secret

### Sign in button does nothing
**Fix**:
1. Check browser console for errors
2. Verify `mobile/.env` has correct Supabase URL and key
3. Try clearing browser cache and reloading

---

## 🎉 You're Done!

Your app now has **production-ready Google OAuth authentication**!

Users can:
- ✅ Sign in with Google
- ✅ Have their own account
- ✅ Save preferences
- ✅ Track nutrition
- ✅ Sign out securely

---

## 📚 More Documentation

- **Full setup guide**: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- **Troubleshooting**: [../troubleshooting/](../troubleshooting/)
- **Project status**: [../../PROJECT_STATUS.md](../../PROJECT_STATUS.md)

---

**Need help?** Check the full setup guide or troubleshooting docs!

