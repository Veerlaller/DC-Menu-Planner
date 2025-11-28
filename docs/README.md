# 📚 DC Menu Planner Documentation

**Complete documentation for the DC Menu Planner project**

---

## 🚀 Getting Started

### Quick Start
- **[Quick Start - Google OAuth](setup/QUICK_START_OAUTH.md)** ⭐ Start here!
  - 20-minute setup guide for authentication

### Setup Guides
- **[Fix Google Sign-In](setup/FIX_GOOGLE_SIGNIN.md)** ⭐ NEW!
  - Quick fix for "sign in doesn't work" issue
  - Step-by-step configuration guide
  - React Native OAuth implementation
- **[Google OAuth Setup](setup/GOOGLE_OAUTH_SETUP.md)**
  - Complete guide to setting up Google authentication
  - Supabase configuration
  - Google Cloud Console setup
- **[Frontend Complete](setup/FRONTEND_COMPLETE.md)**
  - Mobile app setup and features
- **[Backend Integration](setup/INTEGRATION_COMPLETE.md)**
  - Backend-frontend connection guide
- **[Test Connection](setup/TEST_CONNECTION.md)**
  - Testing the full stack integration
- **[Imperial Units Update](setup/IMPERIAL_UNITS_UPDATE.md)**
  - Height/weight unit conversion guide

---

## 🔧 Troubleshooting

- **[Fix Database Issues](troubleshooting/FIX_DATABASE.md)**
  - Database schema issues
  - Foreign key constraints
  - Column name problems
- **[UUID Fix](troubleshooting/UUID_FIX.md)**
  - User ID format issues
  - Authentication problems

---

## 📖 Main Documentation

- **[README.md](../README.md)** - Project overview
- **[PROJECT_STATUS.md](../PROJECT_STATUS.md)** - Current status
- **[ROADMAP.md](../ROADMAP.md)** - Future plans
- **[Data Model](../data_model.md)** - Database schema

---

## 📊 Project Structure

```
DC-Menu-Planner/
├── mobile/              # React Native app (21 source files)
├── server/              # Express backend (8 source files)
├── scraper/             # Menu scraper
├── data/                # Scraped menus
└── docs/                # You are here!
    ├── setup/           # Setup guides (6 docs)
    ├── troubleshooting/ # Fix issues (2 docs)
    └── guides/          # Usage guides (1 doc)
```

---

## 🎯 What's Implemented

### ✅ Authentication
- Google OAuth with Supabase
- JWT token verification
- Session management
- Sign out functionality

### ✅ Mobile App
- Onboarding flow (5 screens)
- Main app (4 tabs)
- State management (Zustand)
- API client with auth
- Imperial units

### ✅ Backend
- REST API (Express)
- JWT verification
- Supabase integration
- Health checks
- Debug endpoints

### ✅ Scraper
- UC Davis menu scraping
- Nutrition data extraction
- Allergen detection
- Dietary flags
- JSON output

---

## 🔑 Key Features

### Authentication Flow
```
Login Screen → Google OAuth → Onboarding → Main App
```

### Data Flow
```
Scraper → JSON → Database → API → Mobile App
```

### Tech Stack
- **Mobile**: React Native + Expo + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **Scraper**: Playwright + Cheerio

---

## 📝 Documentation Index

### By Topic

#### 🔐 Authentication
- [Quick Start OAuth](setup/QUICK_START_OAUTH.md) - **Start here!**
- [Google OAuth Setup](setup/GOOGLE_OAUTH_SETUP.md) - Complete guide

#### 📱 Frontend
- [Frontend Complete](setup/FRONTEND_COMPLETE.md) - Mobile app guide
- [Test Connection](setup/TEST_CONNECTION.md) - Testing guide

#### 🔧 Backend
- [Integration Complete](setup/INTEGRATION_COMPLETE.md) - Backend setup
- [Fix Database](troubleshooting/FIX_DATABASE.md) - Database fixes

#### 🎨 Features
- [Imperial Units](setup/IMPERIAL_UNITS_UPDATE.md) - Unit conversion
- [UUID Fix](troubleshooting/UUID_FIX.md) - User ID fixes

---

## 🆘 Need Help?

### Common Issues

1. **Can't sign in with Google?** ⭐
   → See [Fix Google Sign-In](setup/FIX_GOOGLE_SIGNIN.md) - **NEW!**
   → Or [Google OAuth Setup](setup/GOOGLE_OAUTH_SETUP.md)

2. **Database errors?**
   → See [Fix Database](troubleshooting/FIX_DATABASE.md)

3. **Frontend won't connect to backend?**
   → See [Test Connection](setup/TEST_CONNECTION.md)

4. **UUID format errors?**
   → See [UUID Fix](troubleshooting/UUID_FIX.md)

---

## 🎓 Learning Path

**Recommended order**:

1. Read [Project README](../README.md)
2. Check [Project Status](../PROJECT_STATUS.md)
3. Follow [Quick Start OAuth](setup/QUICK_START_OAUTH.md)
4. Test with [Test Connection](setup/TEST_CONNECTION.md)
5. If issues, check [Troubleshooting](troubleshooting/)

---

## 📊 Documentation Stats

- **Total docs**: 14 files
- **Setup guides**: 6
- **Troubleshooting**: 2
- **Project docs**: 4
- **Other**: 2

---

## 🔄 Recent Updates

### Latest (Nov 26, 2025)
- ✅ Google OAuth implemented
- ✅ Quick start guide added
- ✅ JWT verification working
- ✅ Mobile app with auth screens

### Previous
- ✅ Codebase restructured
- ✅ Imperial units implemented
- ✅ Frontend-backend connected
- ✅ Menu scraper working

---

## 🚀 Next Steps

After setup:
1. Configure Google OAuth (20 min)
2. Test authentication (5 min)
3. Complete onboarding (2 min)
4. Start using the app! 🎉

---

**Ready to start?** → [Quick Start OAuth](setup/QUICK_START_OAUTH.md) ⭐
