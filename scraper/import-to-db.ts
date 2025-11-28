/**
 * CLI script to import scraped menu data from JSON into Supabase
 * 
 * Usage:
 *   npm run import -- --file=path/to/menu.json
 *   npm run import -- --file=../data/menu.json --date=2025-11-28
 *   npm run import -- --file=../data/menu.json --clear
 */

import { SupabaseStorage } from './supabase-storage.js';
import { MenuItemWithNutrition } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface MenuJsonStructure {
  success?: boolean;
  scrapedAt?: string;
  latitude?: any;
  cuarto?: any;
  segundo?: any;
  tercero?: any;
  errors?: string[];
  // Alternative structure: array of items
  menuItems?: MenuItemWithNutrition[];
}

async function main() {
  console.log('📥 Menu Data Import Tool\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const fileArg = args.find(arg => arg.startsWith('--file='));
  const dateArg = args.find(arg => arg.startsWith('--date='));
  const clearArg = args.includes('--clear');

  // Determine input file path
  const filePath = fileArg 
    ? fileArg.split('=')[1] 
    : path.join(__dirname, '../data/menu.json');

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('\nPlease specify a valid file path with --file=path/to/menu.json');
    console.log('Or run the scraper first to generate data/menu.json');
    process.exit(1);
  }

  // Read and parse JSON file
  console.log(`📁 Reading menu data from: ${filePath}`);
  let menuData: MenuJsonStructure;
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    menuData = JSON.parse(fileContent);
  } catch (error: any) {
    console.error(`❌ Failed to read or parse JSON file: ${error.message}`);
    process.exit(1);
  }

  // Extract menu items from the structure
  const menuItems = extractMenuItems(menuData);
  
  if (menuItems.length === 0) {
    console.error('❌ No menu items found in the JSON file');
    console.log('\nExpected format:');
    console.log('  { "menuItems": [...] }');
    console.log('  or organized by hall/meal structure');
    process.exit(1);
  }

  console.log(`✓ Found ${menuItems.length} menu items\n`);

  // Determine target date
  let targetDate: Date;
  if (dateArg) {
    targetDate = new Date(dateArg.split('=')[1]);
    console.log(`📅 Importing for date: ${targetDate.toDateString()}`);
  } else if (menuData.scrapedAt) {
    targetDate = new Date(menuData.scrapedAt);
    console.log(`📅 Using scraped date: ${targetDate.toDateString()}`);
  } else {
    targetDate = new Date();
    console.log(`📅 Using today's date: ${targetDate.toDateString()}`);
  }

  // Initialize Supabase storage
  let storage: SupabaseStorage;
  
  try {
    storage = new SupabaseStorage();
    const connected = await storage.testConnection();
    
    if (!connected) {
      console.error('❌ Failed to connect to Supabase');
      console.log('\nMake sure the following environment variables are set:');
      console.log('  SUPABASE_URL');
      console.log('  SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }
    
    console.log('✓ Connected to Supabase\n');
  } catch (error: any) {
    console.error('❌ Supabase initialization failed:', error.message);
    process.exit(1);
  }

  // Clear existing data if requested
  if (clearArg) {
    try {
      await storage.clearMenuForDate(targetDate);
    } catch (error: any) {
      console.error(`❌ Failed to clear existing data: ${error.message}`);
      process.exit(1);
    }
  }

  // Import menu items to database
  try {
    const result = await storage.storeMenuItems(menuItems, targetDate);
    
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 Import Summary:');
    console.log(`${'='.repeat(50)}`);
    console.log(`✅ Successfully imported: ${result.stored} items`);
    console.log(`❌ Failed to import: ${result.failed} items`);
    
    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      result.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      
      if (result.errors.length > 10) {
        console.log(`  ... and ${result.errors.length - 10} more errors`);
      }
    }
    
    if (result.success) {
      console.log(`\n🎉 Import completed successfully!`);
      process.exit(0);
    } else {
      console.log(`\n⚠️  Import completed with errors`);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error(`\n❌ Import failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Extract menu items from various JSON structures
 */
function extractMenuItems(data: MenuJsonStructure): MenuItemWithNutrition[] {
  const items: MenuItemWithNutrition[] = [];

  // If data has menuItems array directly
  if (data.menuItems && Array.isArray(data.menuItems)) {
    return data.menuItems;
  }

  // If data is organized by hall/meal/zone structure
  const halls = ['latitude', 'cuarto', 'segundo', 'tercero'];
  const meals = ['breakfast', 'lunch', 'dinner'];
  const zones = ['red', 'yellow', 'blue', 'green', 'purple', 'pink'];

  halls.forEach(hall => {
    const hallData = (data as any)[hall];
    if (!hallData) return;

    meals.forEach(meal => {
      const mealData = hallData[meal];
      if (!mealData) return;

      zones.forEach(zone => {
        const zoneItems = mealData[zone];
        if (Array.isArray(zoneItems)) {
          items.push(...zoneItems);
        }
      });
    });
  });

  return items;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`Import scraped menu data into Supabase database

Usage:
  npm run import [options]

Options:
  --file=PATH            Path to menu JSON file (default: ../data/menu.json)
  --date=YYYY-MM-DD      Target date for imported items (default: today or scrapedAt date)
  --clear                Clear existing menu data for the target date before importing
  --help, -h             Show this help message

Examples:
  npm run import                                    # Import from default location
  npm run import -- --file=../data/menu.json        # Import from specific file
  npm run import -- --date=2025-11-28 --clear       # Clear and import for specific date

Environment Variables (required):
  SUPABASE_URL                Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY   Your Supabase service role key

Notes:
  - The JSON file should contain menu items in the format produced by the scraper
  - Duplicate items for the same date/hall/meal will be skipped
  - Nutrition data will be imported if available
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

