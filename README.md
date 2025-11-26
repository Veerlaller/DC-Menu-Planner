# DC-Menu-Planner

A meal planning and macro tracking app for UC Davis students using dining hall menus.

## ✅ Project Status

### Completed
- ✅ **Menu Scraper Foundation** - TypeScript-based scraper with full type safety
- ✅ **Data Model** - Structured menu items with nutrition information
- ✅ **Mock Data Generator** - Realistic sample data for development/testing
- ✅ **CLI Interface** - Command-line tool for scraping menus
- ✅ **JSON Export** - Structured data output for API integration

### Next Steps
- 🔲 Implement real scraping with Puppeteer (UC Davis uses JavaScript-rendered menus)
- 🔲 Set up backend API (Express/Supabase)
- 🔲 Build mobile app (Expo + React Native)
- 🔲 Implement user onboarding flow
- 🔲 Add meal logging and macro tracking

## 🚀 Quick Start

### Scraper

The menu scraper currently generates mock data for UC Davis dining halls.

#### Installation

```bash
npm install
```

#### Usage

Scrape all dining halls for today:
```bash
npm run scrape
```

Scrape a specific hall:
```bash
npm run scrape -- --hall=latitude
```

Scrape for a specific date:
```bash
npm run scrape -- --date=2025-11-27
```

Custom output location:
```bash
npm run scrape -- --output=./my-menu.json
```

Available dining halls:
- `latitude` - Latitude Dining Commons
- `cuarto` - Cuarto Dining Commons
- `segundo` - Segundo Dining Commons
- `tercero` - Tercero Dining Commons

## 📁 Project Structure

```
DC-Menu-Planner/
├── src/
│   └── scraper/
│       ├── index.ts                 # Main entry point
│       ├── ucdavis-menu-scraper.ts  # Scraper implementation
│       └── types.ts                 # TypeScript types
├── data/                            # Scraped data output (JSON)
├── dist/                            # Compiled JavaScript
├── SCRAPER_NOTES.md                 # Technical notes and next steps
└── package.json
```

## 🛠️ Development

Build the project:
```bash
npm run build
```

Run in development mode:
```bash
npm run dev
```

Run scraper without building:
```bash
npm run scrape:dev
```

## 📊 Data Format

The scraper outputs JSON with the following structure:

```json
{
  "success": true,
  "scrapedAt": "2025-11-26T12:00:00.000Z",
  "menuItems": [
    {
      "id": "latitude-2025-11-26-red-zone-chicken-teriyaki",
      "name": "Chicken Teriyaki",
      "hall": "Latitude",
      "station": "Red Zone",
      "meal": "Lunch",
      "date": "2025-11-26",
      "allergens": ["soy"],
      "dietaryFlags": [],
      "nutrition": {
        "menuItemName": "Chicken Teriyaki",
        "calories": 450,
        "protein": 35,
        "carbs": 42,
        "fat": 15,
        "fiber": 4,
        "sodium": 576
      }
    }
  ]
}
```

### Menu Item Fields

- **id**: Unique identifier (hall-date-station-name)
- **name**: Food item name
- **hall**: Dining hall location
- **station**: Food station (Red Zone, Yellow Zone, etc.)
- **meal**: Breakfast, Lunch, Dinner, or Late Night
- **date**: ISO date string (YYYY-MM-DD)
- **allergens**: Array of common allergens (eggs, milk, wheat, etc.)
- **dietaryFlags**: Tags like vegetarian, vegan, gluten-free, halal
- **nutrition**: Complete macro and micronutrient information

## 📝 Important Notes

### Current Scraper Behavior

✅ **The scraper is working and targets the `dc-menu-modal` class** from UC Davis dining pages!

**How it works:**
- Fetches the dining hall page with axios
- Finds the `.dc-menu-modal` element containing all menu data
- Parses zones (Red, Yellow, Blue, Green, Purple, Pink)
- Extracts dish names, allergens, and dietary flags
- Generates structured JSON output

**⚠️ Important: Dining Hall Closures**
- **Thanksgiving**: Nov 26-30, 2025 (CLOSED NOW - halls reopen Dec 1)
- **Winter Break**: Dec 12, 2025 - Jan 4, 2026
- **Spring Break**: Mar 20-29, 2026

When halls are closed, the scraper correctly returns 0 items. This is expected behavior!

**Mock Data for Development:**
Use mock data during closures or for testing:
```bash
# Generates 15 realistic items per hall
npm run scrape -- --hall=latitude
# Currently returns mock data as fallback when real scraping fails
```

### Rate Limiting

- 1-second delay between dining hall requests
- Respects server resources
- Suitable for scheduled daily scraping

## 🎯 Use Cases

### For Development
Use mock data to:
- Build and test mobile app UI
- Develop meal recommendation algorithms
- Test macro calculation logic
- Create user flows

### For Production
After implementing real scraping:
- Schedule daily menu updates
- Store menus in Supabase database
- Serve via REST API to mobile app
- Track menu changes over time

## 🔧 Technical Details

- **Language**: TypeScript
- **HTTP Client**: Axios
- **HTML Parsing**: Cheerio
- **Target**: UC Davis Student Housing dining website
- **Output Format**: JSON
- **Type Safety**: Full TypeScript definitions

## 📚 Documentation

- `README.md` - This file (quick start & overview)
- `SCRAPER_NOTES.md` - Technical details, next steps, enhancement ideas
- `src/scraper/types.ts` - Complete TypeScript type definitions

## 🤝 Contributing

This is a student project for UC Davis students. Potential improvements:
- Implement Puppeteer for real scraping
- Add nutrition data from USDA database
- Build the mobile app (Expo + React Native)
- Add meal recommendations based on macros
- Implement social features (share meals, favorite items)

## 👥 Authors

Veer Laller, Kartik Yedumbaka

## 📄 License

ISC
