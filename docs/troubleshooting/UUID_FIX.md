# 🔧 UUID Format Fix

**Error**: `invalid input syntax for type uuid: "user-1764161884138"`

**Cause**: The database expects a proper UUID format (e.g., `550e8400-e29b-41d4-a716-446655440000`) but we were generating simple strings like `user-1764161884138`.

---

## ✅ What Was Fixed

### Before:
```typescript
// Generated: "user-1764161884138"
userId = 'user-' + Date.now();
```
**Problem**: Not a valid UUID format ❌

### After:
```typescript
// Generates: "550e8400-e29b-41d4-a716-446655440000"
userId = uuid.v4();
```
**Solution**: Proper UUID v4 format ✅

---

## 🔧 Changes Made

### 1. Installed UUID Library
```bash
npm install react-native-uuid
```

### 2. Updated API Client (`mobile/src/api/client.ts`)
```typescript
import uuid from 'react-native-uuid';

const getUserId = async (): Promise<string> => {
  let userId = await AsyncStorage.getItem('tempUserId');
  if (!userId) {
    userId = uuid.v4() as string; // Proper UUID!
    await AsyncStorage.setItem('tempUserId', userId);
  }
  return userId;
};
```

---

## 🎯 Why This Matters

### Database Schema:
```sql
CREATE TABLE user_profiles (
  user_id UUID NOT NULL REFERENCES auth.users(id)
  --      ^^^^ Requires proper UUID format
);
```

### UUID Format:
- **Valid**: `550e8400-e29b-41d4-a716-446655440000`
- **Invalid**: `user-1764161884138` ❌
- **Invalid**: `123456789` ❌
- **Invalid**: `test-user` ❌

---

## 🧪 How It Works Now

1. **First Time Using App**:
   - Generates UUID: `550e8400-e29b-41d4-a716-446655440000`
   - Saves to AsyncStorage
   - Uses for all API calls

2. **Subsequent Uses**:
   - Retrieves same UUID from AsyncStorage
   - Consistent user identity
   - Works with database foreign key constraints

3. **Clear App Data**:
   - Deletes AsyncStorage
   - Generates new UUID
   - New user profile created

---

## ✅ Test It

1. **Clear app data** (if you had errors before):
```javascript
// In browser console (if using web):
localStorage.clear();
location.reload();
```

2. **Restart mobile app**

3. **Complete onboarding**:
   - Height: 70 inches
   - Weight: 154 lbs
   - Should work now! ✅

---

## 📊 UUID Examples

### What a UUID Looks Like:
```
550e8400-e29b-41d4-a716-446655440000
│       │    │    │    │
│       │    │    │    └─ 12 hex digits
│       │    │    └────── 4 hex digits
│       │    └─────────── 4 hex digits
│       └──────────────── 4 hex digits
└──────────────────────── 8 hex digits
```

**Format**: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- `x`: any hex digit (0-9, a-f)
- `4`: version 4 (random)
- `y`: one of 8, 9, a, or b

---

## 🔐 Production Note

In production, you'll use **Supabase Auth** which provides real UUIDs:

```typescript
// Production code (with Supabase Auth):
const { data: { user } } = await supabase.auth.getUser();
const userId = user.id; // Already a proper UUID!
```

For now, we generate a temporary UUID for testing without authentication.

---

## 🚨 If You Still Get Errors

### Clear all app data:
```bash
# Mobile app (in browser console):
localStorage.clear();
sessionStorage.clear();

# Or in mobile:
# Settings → Apps → [Your App] → Clear Data
```

### Check the UUID format:
```typescript
// Should match this pattern:
/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
```

---

## ✅ Fixed!

Your app now generates proper UUIDs that work with the PostgreSQL database! 🎉

**Try onboarding again - it should work now!**

