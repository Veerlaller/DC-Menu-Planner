# Next Steps - Real Scraping Implementation

## ✅ Current Status

The scraper is correctly configured to fetch UC Davis dining pages:
- ✅ Latitude Restaurant: https://housing.ucdavis.edu/dining/latitude/
- ✅ Cuarto DC: https://housing.ucdavis.edu/dining/dining-commons/cuarto/
- ✅ Segundo DC: https://housing.ucdavis.edu/dining/dining-commons/segundo/
- ✅ Tercero DC: https://housing.ucdavis.edu/dining/dining-commons/tercero/

**Issue:** UC Davis menu pages use JavaScript to load menu data dynamically. Simple HTTP requests return HTML without menu items.

## 🎯 Solution: Implement Puppeteer

### Step 1: Install Puppeteer

```bash
npm install puppeteer
npm install --save-dev @types/puppeteer
```

### Step 2: Update Scraper Implementation

Create a new file `src/scraper/puppeteer-scraper.ts`:

```typescript
import puppeteer from 'puppeteer';
import { DiningHall, MealPeriod, MenuItemWithNutrition } from './types';

export class PuppeteerScraper {
  async fetchMenuWithBrowser(
    hall: DiningHall,
    date: Date = new Date()
  ): Promise<MenuItemWithNutrition[]> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      const url = this.getHallUrl(hall);
      
      console.log(`Loading ${url} in browser...`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for menu content to load
      await page.waitForSelector('.menu-item, [class*="dish"], [class*="zone"]', { 
        timeout: 10000 
      });
      
      // Extract menu items from the page
      const menuItems = await page.evaluate((hallName, dateStr) => {
        const items: any[] = [];
        
        // Find all zone sections (Red Zone, Yellow Zone, etc.)
        const zones = document.querySelectorAll('[class*="zone"]');
        
        zones.forEach(zone => {
          const zoneName = zone.querySelector('h4, h3, h2')?.textContent?.trim() || 'Main';
          
          // Find dishes in this zone
          const dishes = zone.querySelectorAll('[class*="dish"], .menu-item');
          
          dishes.forEach(dish => {
            const name = dish.querySelector('[class*="name"]')?.textContent?.trim();
            if (!name) return;
            
            // Extract nutrition if available
            const calories = dish.querySelector('[class*="calorie"]')?.textContent;
            const protein = dish.querySelector('[class*="protein"]')?.textContent;
            
            items.push({
              name,
              station: zoneName,
              hall: hallName,
              date: dateStr,
              // Add more extraction logic here
            });
          });
        });
        
        return items;
      }, hall, this.formatDate(date));
      
      await browser.close();
      return menuItems;
      
    } catch (error) {
      console.error('Browser scraping failed:', error);
      await browser.close();
      throw error;
    }
  }
  
  private getHallUrl(hall: DiningHall): string {
    const baseUrl = 'https://housing.ucdavis.edu';
    const urlMap: Record<DiningHall, string> = {
      [DiningHall.LATITUDE]: `${baseUrl}/dining/latitude/`,
      [DiningHall.CUARTO]: `${baseUrl}/dining/dining-commons/cuarto/`,
      [DiningHall.SEGUNDO]: `${baseUrl}/dining/dining-commons/segundo/`,
      [DiningHall.TERCERO]: `${baseUrl}/dining/dining-commons/tercero/`
    };
    return urlMap[hall];
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

### Step 3: Inspect Actual Page Structure

To get the correct CSS selectors, you need to:

1. Open Chrome DevTools (F12) on https://housing.ucdavis.edu/dining/latitude/
2. Click on the "Latitude Restaurant Menu" button
3. Inspect the menu structure to find the actual CSS classes
4. Look for:
   - Menu item containers
   - Dish names
   - Zone/station headers
   - Nutrition information
   - Allergen badges

### Step 4: Update selectors based on findings

From the [Latitude page](https://housing.ucdavis.edu/dining/latitude/), the menu structure appears to be:

```html
<!-- Menu organized by days and meal periods -->
<div class="menu-section">
  <div class="zone">
    <h4>Red Zone</h4>
    <div class="dish">
      <div class="dish-name">Scrambled Eggs</div>
      <div class="nutrition">...</div>
      <div class="ingredients">...</div>
    </div>
  </div>
</div>
```

You'll need to identify the exact class names by inspecting the live page.

## 🔍 Alternative: Find the API

UC Davis likely has an API that their website calls to fetch menu data.

### How to find it:

1. Open https://housing.ucdavis.edu/dining/latitude/
2. Open Chrome DevTools → Network tab
3. Filter by: `Fetch/XHR`
4. Click "Latitude Restaurant Menu" button
5. Look for API calls that return JSON

Common patterns:
- `/api/menu`
- `/api/dining/v1/menu`
- GraphQL endpoint
- Third-party menu service (e.g., CBORD, Sodexo API)

If you find the API:
```typescript
// Much simpler!
async fetchMenuFromAPI(hall: DiningHall, date: Date) {
  const response = await axios.get(
    `https://api.ucdavis.edu/dining/menu`, // example
    {
      params: { location: hall, date: date.toISOString() }
    }
  );
  return response.data;
}
```

## 📊 Menu Structure (from Latitude page)

Based on the [Latitude dining page](https://housing.ucdavis.edu/dining/latitude/):

**Organization:**
- Days of the week (Monday - Sunday)
- Meal periods: Breakfast, Lunch, Dinner
- Zones: Red, Yellow, Blue, Green, Purple, Pink
- Individual dishes with:
  - Name
  - Ingredients list
  - Allergen information
  - Dietary flags (shown as icons)

**Hours:**
- Breakfast: 8:30 AM–10:30 AM
- Lunch: 10:30 AM–3 PM  
- Dinner: 4:30–8 PM
- Closed: Saturdays, Sundays, Holidays

**Pricing:**
- Breakfast: $15.00 + tax
- Lunch: $16.00 + tax
- Dinner: $16.00 + tax

## 🚀 Quick Implementation Guide

### Option A: Puppeteer (Recommended if no API)

**Pros:**
- Can scrape any JavaScript-rendered site
- Full browser environment
- Can handle authentication if needed

**Cons:**
- Slower (launches browser)
- Higher resource usage
- More complex

**Time to implement:** 2-3 hours

### Option B: Find API (Ideal)

**Pros:**
- Fast and efficient
- Reliable data structure
- Low resource usage

**Cons:**
- May not exist or be public
- Could require authentication
- May change without notice

**Time to find:** 15-30 minutes

### Option C: Contact UC Davis

Email: dining@ucdavis.edu

Ask if they:
- Have a public API for menu data
- Can provide daily menu exports
- Are willing to collaborate on student projects

**Time to hear back:** 1-5 business days

## 📝 Recommended Approach

1. **Spend 30 minutes looking for API** (quickest if successful)
2. **If no API found, implement Puppeteer** (most reliable)
3. **Email UC Davis in parallel** (for long-term solution)

## 🔧 Testing Commands

Once Puppeteer is implemented:

```bash
# Test single hall
npm run scrape -- --hall=latitude

# Test all halls
npm run scrape

# Test specific date
npm run scrape -- --date=2025-12-01

# Verbose mode (see browser actions)
PUPPETEER_HEADLESS=false npm run scrape
```

## 📚 Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Web Scraping with Puppeteer](https://developers.google.com/web/tools/puppeteer)
- [Chrome DevTools Network Tab](https://developer.chrome.com/docs/devtools/network/)
- [UC Davis Dining Contact](https://housing.ucdavis.edu/dining/)

## 💡 Pro Tips

1. **Start with one hall** - Get Latitude working, then copy to others
2. **Take screenshots** - Use `page.screenshot()` to debug
3. **Add delays** - Use `page.waitForTimeout(1000)` if content loads slowly
4. **Handle errors gracefully** - Fallback to mock data if scraping fails
5. **Respect rate limits** - Add delays between requests
6. **Cache results** - Don't scrape same day multiple times

---

**Current Status:** Infrastructure complete, ready for Puppeteer implementation ✅  
**Next Action:** Install Puppeteer and inspect page structure 🚀  
**Estimated Time:** 2-3 hours for full implementation

