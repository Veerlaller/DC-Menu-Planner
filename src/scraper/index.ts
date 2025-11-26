/**
 * Main entry point for menu scraper
 */

import { UCDavisMenuScraper } from './ucdavis-menu-scraper';
import { DiningHall } from './types';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🍽️  UC Davis Menu Scraper\n');
  
  const scraper = new UCDavisMenuScraper();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dateArg = args.find(arg => arg.startsWith('--date='));
  const hallArg = args.find(arg => arg.startsWith('--hall='));
  const outputArg = args.find(arg => arg.startsWith('--output='));
  
  const date = dateArg ? new Date(dateArg.split('=')[1]) : new Date();
  const outputPath = outputArg ? outputArg.split('=')[1] : './data/menu.json';
  
  try {
    let result;
    
    if (hallArg) {
      const hallName = hallArg.split('=')[1];
      const hall = Object.values(DiningHall).find(
        h => h.toLowerCase() === hallName.toLowerCase()
      );
      
      if (!hall) {
        console.error(`Invalid hall: ${hallName}`);
        console.log(`Available halls: ${Object.values(DiningHall).join(', ')}`);
        process.exit(1);
      }
      
      console.log(`Scraping ${hall} for ${date.toDateString()}...\n`);
      const items = await scraper.fetchMenu(hall, date);
      
      // Organize by hall and meal
      const organized = organizeMenuByHallAndMeal(items);
      
      result = {
        success: true,
        scrapedAt: new Date().toISOString(),
        ...organized
      };
      
      console.log(`\n✓ Scraped ${items.length} menu items`);
    } else {
      console.log(`Scraping all dining halls for ${date.toDateString()}...\n`);
      const scraperResult = await scraper.fetchAllMenus(date);
      
      // Organize by hall and meal
      const organized = organizeMenuByHallAndMeal(scraperResult.menuItems);
      
      result = {
        success: scraperResult.success,
        scrapedAt: scraperResult.scrapedAt,
        ...organized,
        errors: scraperResult.errors
      };
      
      console.log(`\n✓ Total items scraped: ${scraperResult.menuItems.length}`);
      if (scraperResult.errors && scraperResult.errors.length > 0) {
        console.log(`⚠️  Errors encountered: ${scraperResult.errors.length}`);
        scraperResult.errors.forEach(err => console.log(`  - ${err}`));
      }
    }
    
    // Save results
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n📁 Results saved to: ${outputPath}`);
    
    // Print summary
    console.log('\n📊 Summary:');
    const halls = ['latitude', 'cuarto', 'segundo', 'tercero'];
    halls.forEach(hall => {
      if (result[hall]) {
        const zones = ['red', 'yellow', 'blue', 'green', 'purple', 'pink'];
        
        let breakfastTotal = 0;
        let lunchTotal = 0;
        let dinnerTotal = 0;
        
        zones.forEach(zone => {
          breakfastTotal += result[hall].breakfast[zone]?.length || 0;
          lunchTotal += result[hall].lunch[zone]?.length || 0;
          dinnerTotal += result[hall].dinner[zone]?.length || 0;
        });
        
        const totalItems = breakfastTotal + lunchTotal + dinnerTotal;
        
        if (totalItems > 0) {
          console.log(`  ${hall.charAt(0).toUpperCase() + hall.slice(1)}: ${totalItems} items`);
          console.log(`    Breakfast: ${breakfastTotal}, Lunch: ${lunchTotal}, Dinner: ${dinnerTotal}`);
        }
      }
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

/**
 * Organize menu items by hall, meal type, and zone
 */
function organizeMenuByHallAndMeal(items: any[]) {
    const organized: any = {
      latitude: { 
        breakfast: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        lunch: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        dinner: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }
      },
      cuarto: { 
        breakfast: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        lunch: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        dinner: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }
      },
      segundo: { 
        breakfast: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        lunch: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        dinner: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }
      },
      tercero: { 
        breakfast: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        lunch: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }, 
        dinner: { red: [], yellow: [], blue: [], green: [], purple: [], pink: [] }
      }
    };

    items.forEach(item => {
      const hallKey = item.hall.toLowerCase();
      const mealKey = item.meal.toLowerCase().replace(/\s+/g, '');
      
      // Map meal period to key
      const mealMap: Record<string, string> = {
        'breakfast': 'breakfast',
        'lunch': 'lunch',
        'dinner': 'dinner'
      };
      
      const targetMeal = mealMap[mealKey];
      
      // Skip late night items or items that don't match our meal types
      if (!targetMeal) {
        return;
      }
      
      // Extract zone color from station name (e.g., "Red Zone" -> "red")
      const station = item.station.toLowerCase();
      let zoneKey = 'red'; // default
      
      if (station.includes('red')) zoneKey = 'red';
      else if (station.includes('yellow')) zoneKey = 'yellow';
      else if (station.includes('blue')) zoneKey = 'blue';
      else if (station.includes('green')) zoneKey = 'green';
      else if (station.includes('purple')) zoneKey = 'purple';
      else if (station.includes('pink')) zoneKey = 'pink';
      
      if (organized[hallKey] && organized[hallKey][targetMeal]) {
        organized[hallKey][targetMeal][zoneKey].push(item);
      }
    });

    return organized;
}

// Run if called directly
if (require.main === module) {
  main();
}

export { UCDavisMenuScraper };
export * from './types';

