# 🔌 Frontend-Backend Connection Guide

**Status**: ✅ **CONNECTED!**

The mobile frontend is now fully connected to the backend API!

---

## 🎉 What's Connected

### ✅ Onboarding Flow
- **Mobile**: `CompleteScreen.tsx` → **Backend**: `POST /api/onboarding`
- Saves user profile and preferences to database
- Auto-calculates macro targets on mobile, stores in backend

### ✅ Today Screen
- **Mobile**: `TodayScreen.tsx` → **Backend**: `GET /api/today`
- Fetches daily macro tracking data
- Calculates consumed vs target macros
- Falls back to mock data if API fails

---

## 🚀 How It Works

### Architecture
```
Mobile App (React Native)
    ↓
API Client (Axios)
    ↓
Backend Server (Express on port 4000)
    ↓
Supabase Database (PostgreSQL)
```

### Authentication
- **Simple header-based auth** (for testing)
- Mobile app generates a temporary user ID
- Stored in AsyncStorage: `tempUserId`
- Sent with every request: `x-user-id` header

### API Endpoints

#### 1. POST /api/onboarding
**Purpose**: Save user profile and preferences

**Request**:
```json
{
  "height_cm": 175,
  "weight_kg": 70,
  "age": 20,
  "sex": "male",
  "goal": "cut",
  "activity_level": "moderate",
  "target_calories": 2104,
  "target_protein_g": 140,
  "target_carbs_g": 255,
  "target_fat_g": 58,
  "is_vegetarian": false,
  "is_vegan": false,
  "allergies": ["peanuts"],
  "dislikes": []
}
```

**Response**:
```json
{
  "success": true,
  "profile": { /* user profile object */ },
  "preferences": { /* user preferences object */ }
}
```

#### 2. GET /api/onboarding
**Purpose**: Retrieve user profile and preferences

**Response**:
```json
{
  "profile": {
    "id": "uuid",
    "user_id": "user-123",
    "height_cm": 175,
    "weight_kg": 70,
    "age": 20,
    "sex": "male",
    "goal": "cut",
    "activity_level": "moderate",
    "target_calories": 2104,
    "target_protein_g": 140,
    "target_carbs_g": 255,
    "target_fat_g": 58
  },
  "preferences": {
    "id": "uuid",
    "user_id": "user-123",
    "is_vegetarian": false,
    "is_vegan": false,
    "allergies": ["peanuts"],
    "dislikes": []
  }
}
```

#### 3. GET /api/today
**Purpose**: Get today's macro tracking data

**Response**:
```json
{
  "date": "2025-11-26",
  "targets": {
    "calories": 2104,
    "protein_g": 140,
    "carbs_g": 255,
    "fat_g": 58
  },
  "consumed": {
    "calories": 650,
    "protein_g": 45,
    "carbs_g": 80,
    "fat_g": 18
  },
  "remaining": {
    "calories": 1454,
    "protein_g": 95,
    "carbs_g": 175,
    "fat_g": 40
  }
}
```

---

## 🔧 Technical Details

### Mobile API Client
**File**: `mobile/src/api/client.ts`

```typescript
// API Base URL
const API_BASE_URL = 'http://localhost:4000/api'

// Auto-adds user ID to every request
apiClient.interceptors.request.use(async (config) => {
  const userId = await getUserId(); // Gets from AsyncStorage
  config.headers['x-user-id'] = userId;
  return config;
});
```

### Backend Authentication Middleware
**File**: `server/src/middleware/auth.ts`

```typescript
export function requireUserId(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Missing user id' });
  }
  req.userId = userId;
  next();
}
```

### User ID Generation
The mobile app generates a temporary user ID on first launch:

```typescript
const getUserId = async (): Promise<string> => {
  let userId = await AsyncStorage.getItem('tempUserId');
  if (!userId) {
    userId = 'user-' + Date.now(); // e.g., "user-1732656000000"
    await AsyncStorage.setItem('tempUserId', userId);
  }
  return userId;
};
```

---

## 🧪 Testing the Connection

### 1. From Terminal (Backend Health Check)
```bash
# Test health endpoint
curl http://localhost:4000/health

# Test onboarding (with user ID)
curl -X POST http://localhost:4000/api/onboarding \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{
    "height_cm": 175,
    "weight_kg": 70,
    "age": 20,
    "sex": "male",
    "goal": "cut",
    "activity_level": "moderate",
    "target_calories": 2104,
    "target_protein_g": 140,
    "target_carbs_g": 255,
    "target_fat_g": 58
  }'

# Get today's data
curl -H "x-user-id: test-user-123" http://localhost:4000/api/today
```

### 2. From Mobile App
1. **Start backend**: `cd server && npm run dev`
2. **Start mobile**: `cd mobile && npm start`
3. **Complete onboarding** on the app
4. **Check console logs** for API calls
5. **View Today screen** to see real data

---

## 📊 Data Flow Example

### Onboarding Flow:
1. User completes onboarding forms
2. Mobile app calculates macro targets
3. `CompleteScreen` calls `completeOnboarding(data)`
4. API client adds `x-user-id` header
5. Backend saves to `user_profiles` and `user_preferences` tables
6. Backend returns saved data
7. Mobile stores in Zustand + AsyncStorage

### Today Screen Flow:
1. `TodayScreen` mounts
2. Calls `getDailySummary()`
3. API client adds `x-user-id` header
4. Backend fetches user's profile (targets) and meal logs (consumed)
5. Backend calculates totals and remaining macros
6. Returns formatted response
7. Mobile displays progress bars

---

## 🎯 Current Status

### ✅ Working
- Onboarding saves to backend
- Today screen fetches from backend
- User ID authentication
- Error handling & fallback to mock data
- Auto-retry logic

### ⏳ Not Yet Implemented
- Meal logging endpoints
- Menu browsing from database
- Hungry Now recommendations
- Real authentication (Supabase Auth)
- Meal history
- Weekly statistics

---

## 🔄 Making Updates

### To Add a New Endpoint:

1. **Create route in backend**:
```typescript
// server/src/routes/meals.ts
router.post('/meals/log', requireUserId, async (req, res) => {
  const userId = getUserId(req);
  // ... save meal log
});
```

2. **Add to server index**:
```typescript
import mealsRoutes from './routes/meals.js';
app.use('/api', mealsRoutes);
```

3. **Add API method in mobile**:
```typescript
// mobile/src/api/index.ts
export const logMeal = async (data) => {
  const response = await apiClient.post('/meals/log', data);
  return response.data;
};
```

4. **Use in components**:
```typescript
import { logMeal } from '../../api';
await logMeal({ menu_item_id, servings });
```

---

## 🐛 Troubleshooting

### Mobile can't connect to backend

**Problem**: `Network Error` or `Connection refused`

**Solutions**:
1. Check backend is running: `curl http://localhost:4000/health`
2. Check mobile API URL in `mobile/src/api/client.ts`
3. For iOS simulator: Use `localhost`
4. For Android emulator: Use `10.0.2.2` instead of `localhost`
5. For physical device: Use your computer's IP address

### Backend returns 401 Unauthorized

**Problem**: Missing or invalid user ID

**Solutions**:
1. Check `x-user-id` header is being sent
2. Clear AsyncStorage: `AsyncStorage.clear()`
3. Restart mobile app to generate new user ID

### Database errors

**Problem**: Tables don't exist or constraints fail

**Solutions**:
1. Run database migrations: Copy `server/db/schema.sql` to Supabase SQL Editor
2. Check Supabase connection: `curl http://localhost:4000/db-health`
3. Verify environment variables in `.env`

---

## 🚀 Next Steps

1. **Implement meal logging endpoints**
2. **Import scraped menu data to database**
3. **Build menu browsing endpoints**
4. **Create recommendation algorithm**
5. **Add real authentication with Supabase Auth**
6. **Deploy backend to production**
7. **Update mobile to use production URL**

---

## 📝 Environment Setup

### Backend `.env` file:
```env
PORT=4000
NODE_ENV=development
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### Mobile doesn't need `.env` for local development!

---

**The connection is live! Start using your app!** 🎉

