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
      
      result = {
        success: true,
        menuItems: items,
        scrapedAt: new Date().toISOString()
      };
      
      console.log(`\n✓ Scraped ${items.length} menu items`);
    } else {
      console.log(`Scraping all dining halls for ${date.toDateString()}...\n`);
      result = await scraper.fetchAllMenus(date);
      
      console.log(`\n✓ Total items scraped: ${result.menuItems.length}`);
      if (result.errors && result.errors.length > 0) {
        console.log(`⚠️  Errors encountered: ${result.errors.length}`);
        result.errors.forEach(err => console.log(`  - ${err}`));
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
    if (result.menuItems.length > 0) {
      console.log('\n📊 Summary:');
      const byHall = result.menuItems.reduce((acc, item) => {
        acc[item.hall] = (acc[item.hall] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(byHall).forEach(([hall, count]) => {
        console.log(`  ${hall}: ${count} items`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { UCDavisMenuScraper };
export * from './types';

