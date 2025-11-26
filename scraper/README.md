# 🕷️ DC Menu Scraper

Scrapes UC Davis dining hall menus with complete nutrition information.

---

## 📋 Features

- ✅ Scrapes all 4 UC Davis dining halls (Latitude, Cuarto, Segundo, Tercero)
- ✅ Extracts complete nutrition facts (calories, protein, carbs, fat, fiber, sodium, sugar)
- ✅ Identifies dietary flags (vegan, vegetarian, halal, kosher, gluten-free)
- ✅ Detects 8 major allergens (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy)
- ✅ Organizes by dining hall → meal type → zone
- ✅ Outputs structured JSON
- ✅ CLI interface with date and hall parameters

---

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Run Scraper
```bash
# Scrape specific hall and date
npm run scrape -- --hall=cuarto --date=2025-11-24

# From project root
cd ..
npm run scrape -- --hall=latitude --date=2025-11-24
```

---

## 📊 Usage

### Command Line Arguments

**`--hall`** (required): Dining hall to scrape
- `latitude` - Latitude Dining Commons
- `cuarto` - Cuarto Dining Commons  
- `segundo` - Segundo Dining Commons
- `tercero` - Tercero Dining Commons

**`--date`** (optional): Date to scrape (YYYY-MM-DD format)
- Defaults to today
- Example: `2025-11-24`

### Examples

```bash
# Scrape Cuarto for today
npm run scrape -- --hall=cuarto

# Scrape Latitude for specific date
npm run scrape -- --hall=latitude --date=2025-11-24

# Scrape Segundo for yesterday
npm run scrape -- --hall=segundo --date=2025-11-23
```

---

## 📁 Output

### Output File
`../data/menu.json`

### Output Structure
```json
{
  "cuarto": {
    "breakfast": {
      "red": [
        {
          "id": "cuarto-2025-11-24-red-zone-scrambled-eggs",
          "name": "Scrambled Eggs",
          "hall": "Cuarto",
          "station": "Red Zone",
          "meal": "Breakfast",
          "date": "2025-11-24",
          "allergens": ["eggs"],
          "dietaryFlags": ["vegetarian", "halal"],
          "nutrition": {
            "calories": 138.75,
            "protein": 10.86,
            "carbs": 1.82,
            "fat": 9.54,
            "sugar": 0,
            "servingSize": "3.05 oz"
          }
        }
      ],
      "yellow": [...],
      "blue": [...],
      "green": [...],
      "purple": [...],
      "pink": [...]
    },
    "lunch": {...},
    "dinner": {...}
  },
  "latitude": {...},
  "segundo": {...},
  "tercero": {...}
}
```

---

## 🏗️ Project Structure

```
scraper/
├── index.ts                    # CLI entry point
├── ucdavis-menu-scraper.ts     # Main scraper class
├── types.ts                    # TypeScript types
├── supabase-storage.ts         # Database storage (future)
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🔧 Technical Details

### Technologies
- **TypeScript** - Type-safe code
- **Playwright** - Browser automation (handles JavaScript-rendered content)
- **Cheerio** - HTML parsing
- **Axios** - HTTP requests

### How It Works

1. **Navigate** to UC Davis housing website
2. **Click** the menu button for specific date
3. **Parse** HTML to extract menu items
4. **Extract** nutrition facts from description text
5. **Identify** dietary flags from CSS classes
6. **Detect** allergens from ingredient lists
7. **Organize** by hall → meal → zone
8. **Output** structured JSON

### Data Extracted Per Item
- ✅ Name
- ✅ Dining hall
- ✅ Station/zone
- ✅ Meal type (breakfast/lunch/dinner)
- ✅ Date
- ✅ Calories
- ✅ Protein (g)
- ✅ Carbohydrates (g)
- ✅ Fat (g)
- ✅ Sugar (g)
- ✅ Fiber (g) - if available
- ✅ Sodium (mg) - if available
- ✅ Serving size
- ✅ Allergens array
- ✅ Dietary flags array

---

## 📝 Example Output

```bash
$ npm run scrape -- --hall=cuarto --date=2025-11-24

🍽️  UC Davis Menu Scraper

Scraping Cuarto for Mon Nov 24 2025...

Fetching menu from: https://housing.ucdavis.edu/dining/dining-commons/cuarto/
   ✓ Found dc-menu-modal, parsing menu...
   🗓️  Date: 2025-11-24 is a Monday
   📅 Looking for Monday's menu...
   ✓ Found Monday section
   🍽️  Processing breakfast section...
   🍽️  Processing lunch section...
   🍽️  Processing dinner section...

✓ Scraped 63 menu items

📁 Results saved to: ../data/menu.json

📊 Summary:
  Cuarto: 63 items
    Breakfast: 24, Lunch: 20, Dinner: 19
```

---

## 🚨 Common Issues

### Dining Halls Closed
If scraping fails with 0 items, the dining hall might be closed:
- Check UC Davis housing website
- Try a different date
- Dining halls are closed during breaks (Thanksgiving, Winter, Spring, Summer)

### Playwright Installation
First run may require Playwright browsers:
```bash
npx playwright install
```

### Date Format
Date must be in `YYYY-MM-DD` format:
- ✅ `2025-11-24`
- ❌ `11/24/2025`
- ❌ `Nov 24 2025`

---

## 🔮 Future Enhancements

- [ ] Scrape all halls in one command
- [ ] Save to database instead of JSON
- [ ] Schedule daily scraping (cron job)
- [ ] Add nutrition facts verification
- [ ] Image URLs for menu items
- [ ] Price information (if available)
- [ ] Historical menu tracking

---

## 📊 Statistics

**Tested with**:
- ✅ Cuarto - 63 items scraped (Nov 24, 2025)
- ✅ All major allergens detected
- ✅ All dietary flags captured
- ✅ 100% nutrition data extracted

---

## 🤝 Contributing

To improve the scraper:

1. Update selectors in `ucdavis-menu-scraper.ts`
2. Add new nutrition fields to `types.ts`
3. Test with multiple dates and halls
4. Update this README

---

## 📄 License

Educational project for UC Davis students.

