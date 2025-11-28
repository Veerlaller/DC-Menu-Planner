# 🍽️ Ories.ai

A comprehensive nutrition tracking app for UC Davis students using dining hall menus.

**Status**: ✅ **Frontend-Backend Integration Complete**

---

## 📁 Project Structure

```
DC-Menu-Planner/
├── 📱 mobile/              # React Native mobile app (Expo)
├── 🔧 server/              # Express.js backend API
├── 🕷️ scraper/             # UC Davis menu scraper
├── 📊 data/                # Scraped menu data (JSON)
├── 📚 docs/                # Documentation
│   ├── setup/              # Setup & integration guides
│   ├── troubleshooting/    # Fix common issues
│   └── guides/             # Usage guides
├── data_model.md           # Database schema specification
├── ROADMAP.md              # Long-term development plan
└── PROJECT_STATUS.md       # Current status & progress
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Mobile app
cd mobile && npm install

# Backend server
cd server && npm install

# Menu scraper
cd scraper && npm install
```

### 2. Start Services

**Backend**:
```bash
cd server
npm run dev
# Runs on http://localhost:4000
```

**Mobile App**:
```bash
cd mobile
npm start
# Opens on http://localhost:19006
```

**Menu Scraper**:
```bash
cd scraper
npm run scrape -- --hall=cuarto --date=2025-11-24
```

---

## 🎯 Features

### ✅ Completed
- **Menu Scraper**: Extracts nutrition data from UC Davis dining halls
- **Mobile App**: Complete onboarding + daily tracking UI
- **Backend API**: User profiles, preferences, daily tracking
- **Frontend-Backend Integration**: Real-time data sync
- **Imperial Units**: Height (inches/feet), weight (lbs)

### ⏳ In Progress
- Meal logging functionality
- Menu browsing from database
- Hungry Now recommendations

---

## 📱 Mobile App

**Tech Stack**:
- React Native (Expo)
- TypeScript
- React Navigation
- Zustand (state management)
- Axios (API client)

**Screens**:
- Onboarding flow (5 screens)
- Today (macro tracking)
- Menus (browse dining halls)
- Hungry Now (recommendations)
- Profile (settings)

**Location**: `/mobile`  
**Docs**: `/mobile/README.md`

---

## 🔧 Backend Server

**Tech Stack**:
- Node.js + Express
- TypeScript
- Supabase (PostgreSQL)
- Simple header-based auth

**API Endpoints**:
- `POST /api/onboarding` - Save user profile
- `GET /api/onboarding` - Get user data
- `GET /api/today` - Daily tracking data
- `GET /health` - Server health check

**Location**: `/server`  
**Docs**: `/server/README.md`

---

## 🕷️ Menu Scraper

**Tech Stack**:
- Node.js + TypeScript
- Playwright (browser automation)
- Cheerio (HTML parsing)

**Features**:
- Scrapes all 4 UC Davis dining halls
- Extracts complete nutrition facts
- Identifies dietary flags & allergens
- Organizes by hall → meal → zone
- Outputs structured JSON

**Usage**:
```bash
cd scraper
npm run scrape -- --hall=cuarto --date=2025-11-24
```

**Output**: `../data/menu.json`

**Location**: `/scraper`  
**Docs**: `/scraper/README.md`

---

## 📚 Documentation

### Setup Guides
- [Frontend-Backend Integration](docs/setup/INTEGRATION_COMPLETE.md)
- [Frontend Complete Guide](docs/setup/FRONTEND_COMPLETE.md)
- [Imperial Units Setup](docs/setup/IMPERIAL_UNITS_UPDATE.md)
- [Connection Testing](docs/setup/TEST_CONNECTION.md)

### Troubleshooting
- [Database Schema Issues](docs/troubleshooting/FIX_DATABASE.md)
- [UUID Format Fix](docs/troubleshooting/UUID_FIX.md)

### Usage Guides
- [API Connection Guide](docs/guides/CONNECTION_GUIDE.md)

### Reference
- [Database Model](data_model.md) - Complete schema specification
- [Project Status](PROJECT_STATUS.md) - Current progress
- [Roadmap](ROADMAP.md) - Future plans

---

## 🗄️ Database

**Platform**: Supabase (PostgreSQL)

**Tables**:
- `user_profiles` - User metrics & targets
- `user_preferences` - Dietary restrictions
- `dining_halls` - UC Davis dining locations
- `menu_days` - Daily menus
- `menu_items` - Individual dishes
- `nutrition_facts` - Nutrition per item
- `meal_logs` - User meal tracking

**Schema**: See `data_model.md` for complete specification

---

## 🧪 Testing

### Test Backend
```bash
curl http://localhost:4000/health
```

### Test Mobile App
1. Open http://localhost:19006
2. Complete onboarding
3. View Today screen with real data

### Test Scraper
```bash
cd scraper
npm run scrape -- --hall=cuarto --date=2025-11-24
cat ../data/menu.json
```

---

## 📊 Current Status

**Overall Progress**: ~75% Complete

- ✅ **Scraper**: 100% (fully functional)
- ✅ **Mobile UI**: 100% (all screens built)
- ✅ **Backend API**: 60% (core endpoints done)
- ✅ **Integration**: 100% (frontend ↔ backend connected)
- ⏳ **Features**: 40% (meal logging, menus, recommendations pending)

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for details.

---

## 🛠️ Tech Stack Summary

| Component | Technologies |
|-----------|-------------|
| **Mobile** | React Native, Expo, TypeScript, Zustand |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Scraper** | Playwright, Cheerio, TypeScript |
| **API** | REST, Axios |
| **Auth** | Header-based (temp), Supabase Auth (future) |

---

## 🔐 Environment Setup

### Backend `.env`
```env
PORT=4000
NODE_ENV=development
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### Mobile
No `.env` needed for local development.  
API URL configured in `mobile/src/api/client.ts`

---

## 🐛 Common Issues

### "Column not found" errors
→ Run database migration: `docs/troubleshooting/FIX_DATABASE.md`

### "Invalid UUID" errors
→ Clear browser storage: `docs/troubleshooting/UUID_FIX.md`

### "Foreign key constraint" errors
→ Remove auth.users constraints for testing (see docs)

---

## 🚀 Next Steps

1. **Implement meal logging** - Allow users to log meals
2. **Import menu data** - Load scraped menus into database
3. **Build menu endpoints** - Serve menus via API
4. **Recommendation algorithm** - Hungry Now feature
5. **Deploy** - Backend to cloud, mobile to app stores

---

## 📄 License

Educational project for UC Davis students.

---

## 🙏 Credits

Built for UC Davis students to track nutrition using dining hall menus.

Data source: housing.ucdavis.edu

---

## 📞 Support

Check the `/docs` folder for detailed guides and troubleshooting.

- Setup issues → `docs/setup/`
- Runtime errors → `docs/troubleshooting/`
- Usage questions → `docs/guides/`

---

**Happy tracking! 🎉**
