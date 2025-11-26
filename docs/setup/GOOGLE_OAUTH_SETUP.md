# 🔐 Google OAuth Setup Guide

**Status**: ✅ Code implemented, needs configuration

---

## 🎯 What We've Implemented

### ✅ Mobile App
- Google Sign-In button
- Supabase Auth integration
- JWT token handling
- Session management
- Sign out functionality

### ✅ Backend
- JWT token verification
- Supabase Auth middleware
- User ID extraction from tokens
- Backwards compatible with simple auth

---

## 📋 Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project name**: DC Menu Planner
   - **Database password**: (generate strong password)
   - **Region**: Choose closest to you
4. Click **"Create Project"**
5. Wait for project to provision (~2 minutes)

---

### 2. Set Up Google OAuth Provider in Supabase

1. **Go to your Supabase Dashboard**
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Click to expand Google settings

#### Get Google OAuth Credentials:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing
3. **Enable Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**
4. **Create OAuth Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - Application type: **Web application**
   - Name: "DC Menu Planner"
   - **Authorized redirect URIs**: Add these:
     ```
     https://your-project.supabase.co/auth/v1/callback
     exp://localhost:8081
     ```
     (Replace `your-project` with your Supabase project reference)
5. **Copy the credentials**:
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-...`

#### Configure in Supabase:

6. Back in **Supabase** → **Authentication** → **Providers** → **Google**
7. **Enable** the Google provider
8. Paste your **Client ID** and **Client Secret**
9. Click **Save**

---

### 3. Configure Mobile App

#### Create `.env` file:

```bash
cd mobile
cp .env.example .env
```

#### Edit `mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get these from**:
- Supabase Dashboard → **Settings** → **API**
- **Project URL**: Your Supabase URL
- **anon public**: Your anonymous key

---

### 4. Configure Backend

#### Create `.env` file:

```bash
cd server
cp .env.example .env
```

#### Edit `server/.env`:

```env
PORT=4000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters
```

**Get these from**:
- Supabase Dashboard → **Settings** → **API**
- **JWT Secret**: Settings → **API** → **JWT Settings** → **JWT Secret**

---

### 5. Run Database Schema

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy contents** of `server/db/schema.sql`
3. **Paste and Run**
4. **Verify tables created**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

#### Remove Foreign Key Constraints (for testing):

```sql
-- Allow testing without auth.users records
ALTER TABLE user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_preferences 
  DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE meal_logs 
  DROP CONSTRAINT IF EXISTS meal_logs_user_id_fkey;
```

---

### 6. Test Google Sign-In

#### Start Both Servers:

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```

**Terminal 2 - Mobile**:
```bash
cd mobile
npm start
# Press 'w' for web
```

#### Sign In:

1. Open http://localhost:19006
2. Click **"Sign in with Google"**
3. Choose your Google account
4. Complete onboarding
5. Should save to database with real user ID! ✅

---

## 🔒 How It Works

### Authentication Flow:

```
User clicks "Sign in with Google"
    ↓
Mobile app → Supabase Auth → Google OAuth
    ↓
Google authenticates user
    ↓
Supabase creates user record in auth.users
    ↓
Returns JWT token + session to mobile
    ↓
Mobile stores session in AsyncStorage
    ↓
All API requests include: Authorization: Bearer <token>
    ↓
Backend verifies JWT token
    ↓
Extracts user_id from token payload
    ↓
Uses for database queries
```

### JWT Token Structure:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@ucdavis.edu",
  "role": "authenticated",
  "iat": 1732656000,
  "exp": 1732659600
}
```

- **sub**: User ID (UUID)
- **email**: User's email
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp

---

## 🔐 Security Features

### ✅ Implemented:
- JWT token verification
- Token expiration handling
- Secure session storage
- Auto token refresh
- Sign out functionality

### 🔒 Production Considerations:
- Use HTTPS for all requests
- Store JWT secret securely
- Implement rate limiting
- Add CORS restrictions
- Use environment variables

---

## 🧪 Testing

### Test Backend Auth:

```bash
# Get a token from mobile app (check browser console)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test with token
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:4000/api/today

# Should return 200 OK
```

### Test Sign Out:

1. Go to Profile tab
2. Click **"Sign Out"**
3. Should redirect to login screen
4. Session should be cleared

---

## 📊 What Changed

### Mobile App

**New Files**:
- `src/lib/supabase.ts` - Supabase client
- `src/hooks/useAuth.ts` - Auth hook
- `src/screens/auth/LoginScreen.tsx` - Google sign-in

**Updated Files**:
- `src/navigation/RootNavigator.tsx` - Auth flow
- `src/api/client.ts` - JWT tokens
- `src/screens/main/ProfileScreen.tsx` - Sign out

### Backend

**Updated Files**:
- `src/middleware/auth.ts` - JWT verification
- `.env.example` - Configuration template

---

## 🎯 Benefits

### Before (Temporary Auth):
- ❌ No real authentication
- ❌ Fake user IDs
- ❌ Not secure
- ❌ No user management

### After (Google OAuth):
- ✅ Real authentication via Google
- ✅ Secure JWT tokens
- ✅ Real user IDs from Supabase
- ✅ User management built-in
- ✅ Email verification
- ✅ Session management

---

## 🚨 Important Notes

### For UC Davis Students:
Use your **@ucdavis.edu** email for sign-in. You can optionally restrict to UC Davis domains only in Supabase:

**Supabase Dashboard** → **Authentication** → **URL Configuration**:
```
Allowed Email Domains: ucdavis.edu
```

### Development vs Production:

**Development**:
- Redirect to `exp://localhost:8081`
- Test with any Google account

**Production**:
- Update redirect URIs in Google Cloud Console
- Add production URLs
- Use real domain

---

## ✅ Checklist

Before going live, ensure:

- [ ] Google OAuth credentials created
- [ ] Supabase project configured
- [ ] Database schema created
- [ ] Foreign key constraints removed (for testing)
- [ ] `.env` files configured (mobile & server)
- [ ] Both servers running
- [ ] Test sign in works
- [ ] Test onboarding saves with real user ID
- [ ] Test sign out works

---

## 🎉 Result

Your app now has **real Google OAuth authentication**!

Users can:
- ✅ Sign in with Google
- ✅ Get a unique user ID
- ✅ Have secure sessions
- ✅ Sign out properly
- ✅ Have data tied to their account

---

## 📝 Next Steps

1. **Configure Supabase** with your credentials
2. **Set up Google OAuth** in Google Cloud Console
3. **Create `.env` files** with your keys
4. **Test sign-in flow**
5. **Complete onboarding** with real user ID
6. **Verify data saves** to database

---

**See [FIX_DATABASE.md](../troubleshooting/FIX_DATABASE.md) if you encounter database issues.**

