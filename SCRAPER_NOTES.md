# UC Davis Menu Scraper - Notes & Next Steps

## ✅ What's Been Built

A TypeScript-based menu scraper that:
- Targets UC Davis dining hall websites
- Generates structured menu data with nutrition information
- Supports all 4 dining halls (Latitude, Cuarto, Segundo, Tercero)
- Includes meal periods (Breakfast, Lunch, Dinner)
- Tracks allergens and dietary flags (vegetarian, vegan, etc.)
- Exports data as JSON

## 🔍 Current Status

The scraper currently **generates mock data** because:
1. UC Davis dining website uses heavy JavaScript rendering
2. Menus are loaded dynamically in modals/popups
3. Simple HTML scraping (axios + cheerio) can't access JavaScript-rendered content

The mock data includes:
- 15 realistic menu items per dining hall
- Full nutrition info (calories, protein, carbs, fat, fiber, sodium)
- Allergen information
- Dietary flags
- Station assignments (Red Zone, Yellow Zone, etc.)

## 🚀 Next Steps for Real Scraping

### Option 1: Use Puppeteer/Playwright (Recommended)

Install Puppeteer:
```bash
npm install puppeteer
```

Update scraper to:
```typescript
import puppeteer from 'puppeteer';

async fetchMenuWithBrowser(hall: DiningHall, date: Date) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`https://housing.ucdavis.edu/dining/dining-commons/${hall}/`);
  
  // Click "Menu" button
  await page.click('[aria-label="Menu"]');
  
  // Wait for menu to load
  await page.waitForSelector('.menu-item');
  
  // Extract menu items
  const menuItems = await page.evaluate(() => {
    // Parse menu items from DOM
    // ...
  });
  
  await browser.close();
  return menuItems;
}
```

### Option 2: Find UC Davis API

The website likely calls an API to fetch menus. You can:
1. Open Chrome DevTools → Network tab
2. Navigate to the menu page
3. Look for API calls (filter by XHR/Fetch)
4. Find the endpoint that returns menu JSON
5. Use that endpoint directly in your scraper

Common patterns to look for:
- `/api/menu`
- `/api/dining`
- GraphQL endpoints

### Option 3: Partner with UC Davis

Contact UC Davis Dining Services and ask:
- If they have a public API
- If they can provide daily menu exports
- If they're willing to collaborate on student projects

## 📋 Data Model

Current menu item structure:
```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Item name
  hall: DiningHall;              // Which dining hall
  station: string;               // Food station (Red Zone, etc.)
  meal: MealPeriod;              // Breakfast/Lunch/Dinner
  date: string;                  // YYYY-MM-DD
  allergens: string[];           // List of allergens
  dietaryFlags: string[];        // vegetarian, vegan, etc.
  nutrition?: {
    calories: number;
    protein: number;             // grams
    carbs: number;               // grams
    fat: number;                 // grams
    fiber: number;               // grams
    sodium: number;              // mg
  }
}
```

## 🔄 Automation

### Schedule Regular Scraping

Use cron (Unix/Mac):
```bash
# Run scraper daily at 6 AM
0 6 * * * cd /path/to/DC-Menu-Planner && npm run scrape
```

Or use node-cron:
```typescript
import cron from 'node-cron';

// Run every day at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('Running daily menu scrape...');
  const scraper = new UCDavisMenuScraper();
  await scraper.fetchAllMenus();
});
```

### Store in Database

Connect to Supabase:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function saveMenuItems(items: MenuItemWithNutrition[]) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(items);
}
```

## 🧪 Testing the Scraper

Test with a specific hall:
```bash
npm run scrape -- --hall=tercero
```

Test with a specific date:
```bash
npm run scrape -- --date=2025-12-01
```

Save to custom location:
```bash
npm run scrape -- --output=./my-custom-menu.json
```

## 📊 Integration with Mobile App

The mobile app can:
1. **Development**: Load from local JSON files
2. **Production**: Call your backend API that runs the scraper

Backend API endpoint example:
```typescript
app.get('/api/menu/:hall/:date', async (req, res) => {
  const { hall, date } = req.params;
  const scraper = new UCDavisMenuScraper();
  const menu = await scraper.fetchMenu(hall as DiningHall, new Date(date));
  res.json(menu);
});
```

## 🎯 Current Limitations

1. **Mock Data**: Replace with real scraping (Puppeteer or API)
2. **No Historical Data**: Only fetches current menus
3. **No Nutrition Verification**: Mock nutrition values need real data
4. **Single Threaded**: Could parallelize hall scraping
5. **No Retry Logic**: Add exponential backoff for failed requests
6. **No Caching**: Consider caching menus to reduce load

## 💡 Ideas for Enhancement

- [ ] Add Puppeteer for JavaScript rendering
- [ ] Find and use UC Davis official API
- [ ] Add nutrition data from USDA database
- [ ] Implement caching layer (Redis)
- [ ] Add webhook notifications when new menus available
- [ ] Track menu changes over time
- [ ] Predict popular items based on history
- [ ] Add meal photos from menu
- [ ] Support special events menus
- [ ] Add pricing information

## 📞 Contact

For questions about UC Davis menus:
- UC Davis Dining: dining@ucdavis.edu
- Housing website: https://housing.ucdavis.edu/dining/

For technical questions about this scraper:
- Check the code in `src/scraper/`
- Review types in `src/scraper/types.ts`
- See usage examples in `src/scraper/index.ts`

