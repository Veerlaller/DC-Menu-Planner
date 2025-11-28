/**
 * Main entry point for menu scraper
 */

import { UCDavisMenuScraper } from './ucdavis-menu-scraper';
import { SupabaseStorage } from './supabase-storage';
import { DiningHall } from './types';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🍽️  UC Davis Menu Scraper\n');
  
  // Show usage if help flag is present
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: npm run scrape:dev [options]

Options:
  --date=YYYY-MM-DD      Scrape menu for specific date (default: today)
  --day=DAY_NAME         Scrape menu for a specific day of the week (Monday, Tuesday, etc.)
                         Finds the next occurrence of that day
  --hall=HALL_NAME       Scrape only a specific hall (Latitude, Cuarto, Segundo, Tercero)
  --output=PATH          Path to save JSON output (default: ../data/menu.json)
  --no-db                Skip storing data in Supabase (only save to JSON)
  --clear                Clear existing menu data for the date before scraping
  --help, -h             Show this help message

Examples:
  npm run scrape:dev                                    # Scrape all halls for today, store in DB and JSON
  npm run scrape:dev -- --date=2025-12-01               # Scrape specific date
  npm run scrape:dev -- --day=Monday                    # Scrape next Monday's menu
  npm run scrape:dev -- --day=Friday --hall=Cuarto      # Scrape Cuarto for next Friday
  npm run scrape:dev -- --hall=Cuarto                   # Scrape only Cuarto
  npm run scrape:dev -- --no-db                         # Only save to JSON, skip database
  npm run scrape:dev -- --clear --date=2025-12-01       # Clear and re-scrape specific date

Environment Variables (required for database storage):
  SUPABASE_URL                Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY   Your Supabase service role key
`);
    process.exit(0);
  }
  
  const scraper = new UCDavisMenuScraper();
  
  // Parse command line arguments
  const dateArg = args.find(arg => arg.startsWith('--date='));
  const dayArg = args.find(arg => arg.startsWith('--day='));
  const hallArg = args.find(arg => arg.startsWith('--hall='));
  const outputArg = args.find(arg => arg.startsWith('--output='));
  const noDbArg = args.includes('--no-db');
  const clearArg = args.includes('--clear');
  
  // Determine the target date
  let date: Date;
  
  if (dateArg) {
    // Use specific date if provided
    date = new Date(dateArg.split('=')[1]);
  } else if (dayArg) {
    // Calculate date based on day of week
    const dayName = dayArg.split('=')[1];
    const calculatedDate = getNextDayOfWeek(dayName);
    if (!calculatedDate) {
      console.error(`❌ Invalid day name: ${dayName}`);
      console.log(`Valid day names: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday`);
      process.exit(1);
    }
    date = calculatedDate;
    console.log(`📅 Scraping ${dayName}'s menu (${date.toDateString()})\n`);
  } else {
    // Default to today
    date = new Date();
  }
  
  const outputPath = outputArg ? outputArg.split('=')[1] : '../data/menu.json';
  const useDatabase = !noDbArg;
  
  // Initialize Supabase storage if needed
  let storage: SupabaseStorage | null = null;
  if (useDatabase) {
    try {
      storage = new SupabaseStorage();
      const connected = await storage.testConnection();
      if (!connected) {
        console.error('❌ Failed to connect to Supabase. Use --no-db to skip database storage.');
        process.exit(1);
      }
      console.log('✓ Connected to Supabase\n');
      
      // Always clear all existing menu data before scraping
      await storage.clearAllMenuItems();
      
      // Clear existing data for specific date if requested (legacy support)
      if (clearArg) {
        await storage.clearMenuForDate(date);
      }
    } catch (error: any) {
      console.error('❌ Supabase initialization failed:', error.message);
      console.log('Use --no-db to skip database storage.\n');
      process.exit(1);
    }
  }
  
  try {
    let result;
    let allMenuItems: any[] = [];
    
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
      allMenuItems = items;
      
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
      allMenuItems = scraperResult.menuItems;
      
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
    
    // Store in Supabase if enabled
    if (storage) {
      const storageResult = await storage.storeMenuItems(allMenuItems, date);
      
      if (storageResult.errors.length > 0) {
        console.log('\n⚠️  Some items failed to store:');
        storageResult.errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
        if (storageResult.errors.length > 5) {
          console.log(`  ... and ${storageResult.errors.length - 5} more errors`);
        }
      }
    }
    
    // Save results to JSON file
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
 * Get the date for the next occurrence of a specific day of the week
 * @param dayName - Name of the day (Monday, Tuesday, etc.)
 * @returns Date object for the next occurrence of that day, or null if invalid day name
 */
function getNextDayOfWeek(dayName: string): Date | null {
  const dayMap: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  
  const normalizedDay = dayName.toLowerCase();
  const targetDay = dayMap[normalizedDay];
  
  if (targetDay === undefined) {
    return null;
  }
  
  const today = new Date();
  const currentDay = today.getDay();
  
  // Calculate days until target day
  let daysUntilTarget = targetDay - currentDay;
  
  // If target day is today or in the past this week, get next week's occurrence
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }
  
  // Create new date
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  
  return targetDate;
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

