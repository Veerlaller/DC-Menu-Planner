/**
 * UC Davis Dining Hall Menu Scraper
 * 
 * Scrapes menu data from UC Davis dining services website
 * Documentation: https://nutrition.ucdavis.edu/
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  MenuItem,
  NutritionInfo,
  MenuItemWithNutrition,
  DiningHall,
  MealPeriod,
  ScraperResult
} from './types';

export class UCDavisMenuScraper {
  private baseUrl = 'https://housing.ucdavis.edu';
  
  /**
   * Fetch menu for a specific dining hall and date
   * Note: UC Davis uses JavaScript-rendered menus, so this uses a simplified approach
   */
  async fetchMenu(
    hall: DiningHall,
    date: Date = new Date()
  ): Promise<MenuItemWithNutrition[]> {
    const dateStr = this.formatDate(date);
    
    try {
      const url = this.getHallUrl(hall);
      
      console.log(`Fetching menu from: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 15000,
        // Ignore SSL errors in development
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });
      
      const menuItems = this.parseMenu(response.data, hall, dateStr);
      
      // Report if no items found
      if (menuItems.length === 0) {
        console.log(`   ❌ No menu items found`);
        console.log(`   Possible reasons:`);
        console.log(`      - Dining hall is closed (check schedule)`);
        console.log(`      - Menu not yet posted for this date`);
        console.log(`      - Page structure changed (selectors need updating)`);
      }
      
      return menuItems;
    } catch (error: any) {
      console.error(`   ❌ Error fetching menu: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch menus from all dining halls for a given date
   */
  async fetchAllMenus(date: Date = new Date()): Promise<ScraperResult> {
    const errors: string[] = [];
    let allMenuItems: MenuItemWithNutrition[] = [];

    const halls = Object.values(DiningHall);
    
    for (const hall of halls) {
      try {
        const items = await this.fetchMenu(hall, date);
        allMenuItems = allMenuItems.concat(items);
        console.log(`✓ Scraped ${items.length} items from ${hall}`);
      } catch (error) {
        const errorMsg = `Failed to scrape ${hall}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      
      // Be nice to the server
      await this.sleep(1000);
    }

    return {
      success: errors.length === 0,
      menuItems: allMenuItems,
      scrapedAt: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Parse HTML response into menu items
   */
  private parseMenu(
    html: string,
    hall: DiningHall,
    date: string
  ): MenuItemWithNutrition[] {
    const $ = cheerio.load(html);
    const menuItems: MenuItemWithNutrition[] = [];

    // Look for the dc-menu-modal class that contains the menu
    const $menuModal = $('.dc-menu-modal');
    
    if ($menuModal.length === 0) {
      console.log(`   ⚠️  No dc-menu-modal found - hall may be closed or page structure changed`);
      return menuItems;
    }

    console.log(`   ✓ Found dc-menu-modal, parsing menu...`);

    // Determine day of week from the date string (format: YYYY-MM-DD)
    const targetDate = new Date(date + 'T12:00:00'); // Add time to avoid timezone issues
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = dayNames[targetDate.getDay()];
    
    console.log(`   🗓️  Date: ${date} is a ${targetDay}`);
    
    console.log(`   📅 Looking for ${targetDay}'s menu...`);

    // Find the section for the target day
    // Look for h1 or h2 headers that contain the day name
    let $daySection = $();
    
    $menuModal.find('h1, h2').each((i, header) => {
      const $header = $(header);
      const headerText = $header.text().trim();
      
      if (headerText === targetDay) {
        // Found the day header, get the parent section
        $daySection = $header.parent();
        console.log(`   ✓ Found ${targetDay} section`);
        return false; // Break loop
      }
    });

    // If no specific day section found, try to find by id attribute like "monday", "tuesday", etc.
    if ($daySection.length === 0) {
      const dayId = targetDay.toLowerCase();
      $daySection = $menuModal.find(`#${dayId}, [id*="${dayId}"]`).first();
      
      if ($daySection.length > 0) {
        console.log(`   ✓ Found ${targetDay} section by id`);
      }
    }

    // If still no section found, search all and filter later
    const $searchArea = $daySection.length > 0 ? $daySection : $menuModal;
    
    if ($daySection.length === 0) {
      console.log(`   ⚠️  Could not find specific ${targetDay} section, searching entire modal...`);
    }

    // Find zone containers (divs with class containing zone colors) within the day section
    $searchArea.find('div.red, div.yellow, div.blue, div.green, div.purple, div.pink').each((zoneIndex, zoneElement) => {
      try {
        const $zone = $(zoneElement);
        
        // Extract zone/station name from h3 heading
        const stationName = $zone.find('h3').first().text().trim();
        
        // Skip if this is just headers/hours info (no actual menu)
        if (!stationName || stationName.toLowerCase().includes('zone hours')) {
          return;
        }
        
        // Check if zone has no dishes
        const noDisheMsg = $zone.find('.no-dishes-message').text();
        if (noDisheMsg.toLowerCase().includes('no dishes')) {
          return; // Skip this zone
        }

        // Find all panel divs (actual food dishes)
        const $dishes = $zone.find('.panel');
        
        $dishes.each((itemIndex, itemElement) => {
          try {
            const $item = $(itemElement);
            
            // Extract dish name from panel-title inside the panel
            const name = $item.find('.panel-title, h4').first().text().trim();
            
            // Skip if no valid name
            if (!name || name.length < 3) {
              return;
            }
            
            // Skip zone hours info (contains colons for times)
            if (name.includes(':') && (name.includes('AM') || name.includes('PM'))) {
              return;
            }
            
            // Skip if it's just zone names or closed messages
            if (['Red', 'Yellow', 'Blue', 'Green', 'Purple', 'Pink', 'Closed'].includes(name)) {
              return;
            }

            // Get the full text content for ingredients/details
            const fullText = $item.text().trim();
            
            // Try to determine meal period from context
            const mealPeriod = this.extractMealPeriodFromContext($, $zone);

            // Extract ingredients text (everything after the dish name)
            const ingredientsText = fullText.replace(name, '').trim();

            // Extract dietary flags from CSS classes and images
            const dietaryFlags = this.extractDietaryFlagsFromPanel($item);

            const menuItem: MenuItemWithNutrition = {
              id: this.generateId(hall, date, stationName, name),
              name,
              hall,
              station: stationName,
              meal: mealPeriod,
              date,
              allergens: this.extractAllergensFromText(ingredientsText),
              dietaryFlags,
              description: ingredientsText.substring(0, 200) // First 200 chars as description
            };

            // Try to extract inline nutrition if available
            const nutrition = this.extractNutritionFromText(ingredientsText, name);
            if (nutrition) {
              menuItem.nutrition = nutrition;
            }

            menuItems.push(menuItem);
          } catch (error) {
            console.error('Error parsing menu item:', error);
          }
        });
      } catch (error) {
        console.error('Error parsing zone:', error);
      }
    });

    return menuItems;
  }

  /**
   * Extract nutrition information from element
   */
  private extractNutrition($element: cheerio.Cheerio<any>, itemName: string): NutritionInfo | null {
    try {
      const nutritionText = $element.find('.nutrition-info, .nutrition').text();
      
      if (!nutritionText) return null;

      const nutrition: NutritionInfo = {
        menuItemName: itemName
      };

      // Parse nutrition values (adjust regex based on actual format)
      const caloriesMatch = nutritionText.match(/(\d+)\s*cal/i);
      const proteinMatch = nutritionText.match(/(\d+\.?\d*)\s*g\s*protein/i);
      const carbsMatch = nutritionText.match(/(\d+\.?\d*)\s*g\s*carb/i);
      const fatMatch = nutritionText.match(/(\d+\.?\d*)\s*g\s*fat/i);

      if (caloriesMatch) nutrition.calories = parseInt(caloriesMatch[1]);
      if (proteinMatch) nutrition.protein = parseFloat(proteinMatch[1]);
      if (carbsMatch) nutrition.carbs = parseFloat(carbsMatch[1]);
      if (fatMatch) nutrition.fat = parseFloat(fatMatch[1]);

      return Object.keys(nutrition).length > 1 ? nutrition : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract nutrition information from text (ingredients)
   */
  private extractNutritionFromText(text: string, itemName: string): NutritionInfo | null {
    try {
      // UC Davis nutrition format: "per manufacturer, contains: ..."
      // Look for nutrition facts if present
      const nutrition: NutritionInfo = {
        menuItemName: itemName
      };

      // Parse nutrition values from text
      const caloriesMatch = text.match(/(\d+)\s*calor/i);
      const proteinMatch = text.match(/(\d+\.?\d*)\s*g\s*protein/i);
      const carbsMatch = text.match(/(\d+\.?\d*)\s*g\s*carb/i);
      const fatMatch = text.match(/(\d+\.?\d*)\s*g\s*fat/i);

      if (caloriesMatch) nutrition.calories = parseInt(caloriesMatch[1]);
      if (proteinMatch) nutrition.protein = parseFloat(proteinMatch[1]);
      if (carbsMatch) nutrition.carbs = parseFloat(carbsMatch[1]);
      if (fatMatch) nutrition.fat = parseFloat(fatMatch[1]);

      // Return null if no nutrition data found
      return Object.keys(nutrition).length > 1 ? nutrition : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract allergens from menu item
   */
  private extractAllergens($element: cheerio.Cheerio<any>): string[] {
    const allergens: string[] = [];
    const allergenText = $element.find('.allergens, .menu-item__allergens').text().toLowerCase();
    
    const commonAllergens = ['milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soy'];
    
    commonAllergens.forEach(allergen => {
      if (allergenText.includes(allergen)) {
        allergens.push(allergen);
      }
    });
    
    return allergens;
  }

  /**
   * Extract allergens from text (ingredients list)
   */
  private extractAllergensFromText(text: string): string[] {
    const allergens: string[] = [];
    const lowerText = text.toLowerCase();
    
    const allergenMap: Record<string, string[]> = {
      'milk': ['milk', 'dairy', 'cheese', 'cream', 'butter', 'whey'],
      'eggs': ['egg', 'eggs'],
      'fish': ['fish'],
      'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster'],
      'tree nuts': ['tree nuts', 'almonds', 'cashews', 'walnuts', 'pecans'],
      'peanuts': ['peanuts', 'peanut'],
      'wheat': ['wheat', 'flour'],
      'soy': ['soy', 'soybean']
    };
    
    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        allergens.push(allergen);
      }
    });
    
    return [...new Set(allergens)]; // Remove duplicates
  }

  /**
   * Extract dietary flags (vegetarian, vegan, etc.)
   */
  private extractDietaryFlags($element: cheerio.Cheerio<any>): string[] {
    const flags: string[] = [];
    const text = $element.text().toLowerCase();
    const classes = $element.attr('class') || '';
    
    const flagMap: Record<string, string[]> = {
      'vegetarian': ['vegetarian', 'veggie', 'veg'],
      'vegan': ['vegan'],
      'halal': ['halal'],
      'kosher': ['kosher'],
      'gluten-free': ['gluten-free', 'gluten free', 'gf']
    };

    Object.entries(flagMap).forEach(([flag, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword) || classes.includes(keyword))) {
        flags.push(flag);
      }
    });

    return flags;
  }

  /**
   * Extract dietary flags from text
   */
  private extractDietaryFlagsFromText(text: string): string[] {
    const flags: string[] = [];
    const lowerText = text.toLowerCase();
    
    const flagMap: Record<string, string[]> = {
      'vegetarian': ['vegetarian', 'veggie'],
      'vegan': ['vegan'],
      'halal': ['halal'],
      'kosher': ['kosher'],
      'gluten-free': ['gluten-free', 'gluten free', 'gf']
    };

    Object.entries(flagMap).forEach(([flag, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        flags.push(flag);
      }
    });

    return flags;
  }

  /**
   * Extract dietary flags from panel element (CSS classes and images)
   */
  private extractDietaryFlagsFromPanel($element: cheerio.Cheerio<any>): string[] {
    const flags: string[] = [];
    
    // Check CSS classes
    const classes = $element.attr('class') || '';
    
    if (classes.includes('isVegan')) {
      flags.push('vegan');
    }
    if (classes.includes('isVegetarian')) {
      flags.push('vegetarian');
    }
    if (classes.includes('isHalal')) {
      flags.push('halal');
    }
    
    // Also check for dietary flag images (alt text)
    $element.find('img').each((i, img) => {
      const alt = (cheerio.load(img)('img').attr('alt') || '').toLowerCase();
      const src = (cheerio.load(img)('img').attr('src') || '').toLowerCase();
      
      if (alt.includes('vegan') || src.includes('vegan')) {
        if (!flags.includes('vegan')) flags.push('vegan');
      }
      if (alt.includes('vegetarian') || src.includes('vegetarian')) {
        if (!flags.includes('vegetarian')) flags.push('vegetarian');
      }
      if (alt.includes('halal') || src.includes('halal')) {
        if (!flags.includes('halal')) flags.push('halal');
      }
      if (alt.includes('kosher') || src.includes('kosher')) {
        if (!flags.includes('kosher')) flags.push('kosher');
      }
      if (alt.includes('gluten') || src.includes('gluten')) {
        if (!flags.includes('gluten-free')) flags.push('gluten-free');
      }
    });
    
    return flags;
  }

  /**
   * Extract meal period from context
   */
  private extractMealPeriod($element: cheerio.Cheerio<any>): MealPeriod {
    const $parent = $element.closest('.meal-period, .menu-block');
    const periodText = $parent.find('.meal-period__name, h2, h3').text().toLowerCase();
    
    if (periodText.includes('breakfast')) return MealPeriod.BREAKFAST;
    if (periodText.includes('lunch')) return MealPeriod.LUNCH;
    if (periodText.includes('dinner')) return MealPeriod.DINNER;
    if (periodText.includes('late')) return MealPeriod.LATE_NIGHT;
    
    return MealPeriod.LUNCH; // default
  }

  /**
   * Extract meal period from context (for dc-menu-modal structure)
   */
  private extractMealPeriodFromContext($: cheerio.CheerioAPI, $element: cheerio.Cheerio<any>): MealPeriod {
    // Look for parent sections with meal period info
    const $section = $element.closest('[class*="section"], .tab-pane, [role="tabpanel"]');
    const sectionText = $section.text().toLowerCase();
    
    // Also check for active tab or visible section
    const $activeTab = $('.tab-pane.active, [role="tabpanel"][aria-hidden="false"]');
    const tabText = $activeTab.text().toLowerCase();
    
    const combinedText = (sectionText + ' ' + tabText).toLowerCase();
    
    if (combinedText.includes('breakfast')) return MealPeriod.BREAKFAST;
    if (combinedText.includes('lunch')) return MealPeriod.LUNCH;
    if (combinedText.includes('dinner')) return MealPeriod.DINNER;
    if (combinedText.includes('late')) return MealPeriod.LATE_NIGHT;
    
    // Guess based on current time
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return MealPeriod.BREAKFAST;
    if (hour >= 11 && hour < 16) return MealPeriod.LUNCH;
    if (hour >= 16 && hour < 22) return MealPeriod.DINNER;
    return MealPeriod.LATE_NIGHT;
  }

  /**
   * Get full URL for dining hall
   * Latitude is a restaurant, others are dining commons
   */
  private getHallUrl(hall: DiningHall): string {
    const urlMap: Record<DiningHall, string> = {
      [DiningHall.LATITUDE]: `${this.baseUrl}/dining/latitude/`,
      [DiningHall.CUARTO]: `${this.baseUrl}/dining/dining-commons/cuarto/`,
      [DiningHall.SEGUNDO]: `${this.baseUrl}/dining/dining-commons/segundo/`,
      [DiningHall.TERCERO]: `${this.baseUrl}/dining/dining-commons/tercero/`
    };
    return urlMap[hall];
  }

  /**
   * Generate mock menu items for testing/development
   * This is a fallback when real scraping fails
   */
  private generateMockMenuItems(hall: DiningHall, date: string): MenuItemWithNutrition[] {
    const mockItems: MenuItemWithNutrition[] = [];
    const stations = ['Red Zone', 'Yellow Zone', 'Blue Zone', 'Green Zone'];
    const meals = [MealPeriod.BREAKFAST, MealPeriod.LUNCH, MealPeriod.DINNER];
    
    type FoodItem = {
      name: string;
      protein: number;
      carbs: number;
      fat: number;
      calories: number;
    };

    const foodItems: Record<MealPeriod, FoodItem[]> = {
      [MealPeriod.BREAKFAST]: [
        { name: 'Scrambled Eggs', protein: 12, carbs: 2, fat: 8, calories: 140 },
        { name: 'Pancakes', protein: 4, carbs: 35, fat: 6, calories: 220 },
        { name: 'Bacon', protein: 6, carbs: 0, fat: 12, calories: 150 },
        { name: 'Fresh Fruit Bowl', protein: 1, carbs: 25, fat: 0, calories: 100 },
        { name: 'Oatmeal', protein: 5, carbs: 27, fat: 3, calories: 150 }
      ],
      [MealPeriod.LUNCH]: [
        { name: 'Chicken Teriyaki', protein: 35, carbs: 42, fat: 15, calories: 450 },
        { name: 'Caesar Salad', protein: 8, carbs: 12, fat: 18, calories: 250 },
        { name: 'Vegetable Stir Fry', protein: 8, carbs: 35, fat: 10, calories: 280 },
        { name: 'Pizza Margherita', protein: 12, carbs: 38, fat: 14, calories: 320 },
        { name: 'Grilled Fish', protein: 28, carbs: 5, fat: 8, calories: 210 }
      ],
      [MealPeriod.DINNER]: [
        { name: 'Beef Tacos', protein: 22, carbs: 28, fat: 16, calories: 360 },
        { name: 'Pasta Alfredo', protein: 18, carbs: 65, fat: 22, calories: 550 },
        { name: 'Roasted Chicken', protein: 32, carbs: 0, fat: 12, calories: 260 },
        { name: 'Quinoa Bowl', protein: 14, carbs: 45, fat: 8, calories: 320 },
        { name: 'Veggie Burger', protein: 15, carbs: 42, fat: 11, calories: 330 }
      ],
      [MealPeriod.LATE_NIGHT]: []
    };

    meals.forEach((meal: MealPeriod) => {
      const items = foodItems[meal] || [];
      items.forEach((item: FoodItem, index: number) => {
        const station = stations[index % stations.length];
        mockItems.push({
          id: this.generateId(hall, date, station, item.name),
          name: item.name,
          hall,
          station,
          meal,
          date,
          allergens: this.getMockAllergens(item.name),
          dietaryFlags: this.getMockDietaryFlags(item.name),
          nutrition: {
            menuItemName: item.name,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: Math.floor(item.carbs * 0.1),
            sodium: Math.floor(Math.random() * 500) + 200
          }
        });
      });
    });

    return mockItems;
  }

  private getMockAllergens(itemName: string): string[] {
    const allergens: string[] = [];
    const lower = itemName.toLowerCase();
    
    if (lower.includes('egg') || lower.includes('pancake')) allergens.push('eggs');
    if (lower.includes('pasta') || lower.includes('pizza')) allergens.push('wheat');
    if (lower.includes('cheese') || lower.includes('alfredo')) allergens.push('milk');
    if (lower.includes('fish')) allergens.push('fish');
    if (lower.includes('teriyaki')) allergens.push('soy');
    
    return allergens;
  }

  private getMockDietaryFlags(itemName: string): string[] {
    const flags: string[] = [];
    const lower = itemName.toLowerCase();
    
    if (lower.includes('veggie') || lower.includes('vegetable') || lower.includes('salad') || lower.includes('fruit') || lower.includes('quinoa')) {
      flags.push('vegetarian');
    }
    if (lower.includes('veggie burger') || lower.includes('fruit') || lower.includes('quinoa bowl')) {
      flags.push('vegan');
    }
    
    return flags;
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate unique ID for menu item
   */
  private generateId(hall: DiningHall, date: string, station: string, name: string): string {
    const normalized = `${hall}-${date}-${station}-${name}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    return normalized;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default UCDavisMenuScraper;

