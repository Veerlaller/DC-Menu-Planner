# 📚 DC Menu Planner Documentation

Complete documentation for the UC Davis Diet Tracker application.

---

## 🗂️ Documentation Structure

### 📖 Setup Guides (`setup/`)
Complete guides for getting the app running:

- **[INTEGRATION_COMPLETE.md](setup/INTEGRATION_COMPLETE.md)** - Frontend-backend integration overview
- **[FRONTEND_COMPLETE.md](setup/FRONTEND_COMPLETE.md)** - Complete mobile app features
- **[IMPERIAL_UNITS_UPDATE.md](setup/IMPERIAL_UNITS_UPDATE.md)** - Imperial units conversion guide
- **[TEST_CONNECTION.md](setup/TEST_CONNECTION.md)** - Testing the API connection

### 🔧 Troubleshooting (`troubleshooting/`)
Solutions for common issues:

- **[FIX_DATABASE.md](troubleshooting/FIX_DATABASE.md)** - Database schema errors
- **[UUID_FIX.md](troubleshooting/UUID_FIX.md)** - UUID format issues

### 📘 Usage Guides (`guides/`)
How to use the application:

- **[CONNECTION_GUIDE.md](guides/CONNECTION_GUIDE.md)** - Complete API reference & connection guide

---

## 🚀 Quick Links

### Getting Started
1. **First Time Setup**: Start with [../README.md](../README.md)
2. **Database Setup**: [troubleshooting/FIX_DATABASE.md](troubleshooting/FIX_DATABASE.md)
3. **Test Connection**: [setup/TEST_CONNECTION.md](setup/TEST_CONNECTION.md)

### Understanding the Project
- **Database Schema**: [../data_model.md](../data_model.md)
- **Project Status**: [../PROJECT_STATUS.md](../PROJECT_STATUS.md)
- **Roadmap**: [../ROADMAP.md](../ROADMAP.md)

### Component-Specific Docs
- **Mobile App**: [../mobile/README.md](../mobile/README.md)
- **Backend API**: [../server/README.md](../server/README.md)
- **Menu Scraper**: Check `src/scraper/`

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Column not found errors** | [FIX_DATABASE.md](troubleshooting/FIX_DATABASE.md) |
| **Invalid UUID format** | [UUID_FIX.md](troubleshooting/UUID_FIX.md) |
| **Foreign key constraints** | [FIX_DATABASE.md](troubleshooting/FIX_DATABASE.md) |
| **Connection refused** | Check backend is running on port 4000 |
| **Module not found** | Run `npm install` in respective directory |

---

## 📊 Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Integration Complete | ✅ Current | Nov 26, 2025 |
| Frontend Complete | ✅ Current | Nov 26, 2025 |
| Imperial Units | ✅ Current | Nov 26, 2025 |
| Database Fix | ✅ Current | Nov 26, 2025 |
| UUID Fix | ✅ Current | Nov 26, 2025 |
| Connection Guide | ✅ Current | Nov 26, 2025 |

---

## 🔍 Finding What You Need

### "How do I...?"

- **Setup the project** → Start with [../README.md](../README.md)
- **Fix database errors** → [troubleshooting/FIX_DATABASE.md](troubleshooting/FIX_DATABASE.md)
- **Understand the architecture** → [setup/INTEGRATION_COMPLETE.md](setup/INTEGRATION_COMPLETE.md)
- **Use the API** → [guides/CONNECTION_GUIDE.md](guides/CONNECTION_GUIDE.md)
- **Change from metric to imperial** → [setup/IMPERIAL_UNITS_UPDATE.md](setup/IMPERIAL_UNITS_UPDATE.md)

### "Something broke!"

1. Check **error message** in terminal
2. Look in [troubleshooting/](troubleshooting/) folder
3. Check component-specific README:
   - Mobile: [../mobile/README.md](../mobile/README.md)
   - Backend: [../server/README.md](../server/README.md)

---

## 📝 Contributing to Docs

When adding new documentation:

- **Setup guides** → `setup/` folder
- **Bug fixes** → `troubleshooting/` folder  
- **Usage instructions** → `guides/` folder
- **Component-specific** → Component's own README

---

**Need more help?** Check the main [README](../README.md) or component-specific documentation.

