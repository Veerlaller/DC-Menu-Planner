/**
 * Supabase storage module for menu scraper
 * Handles storing scraped menu data into the database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MenuItemWithNutrition, DiningHall, MealPeriod } from './types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class SupabaseStorage {
  private supabase: SupabaseClient;
  private diningHallCache: Map<string, string> = new Map();

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Test database connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('dining_halls').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get or create dining hall ID from name
   */
  private async getDiningHallId(hallName: string): Promise<string> {
    // Check cache first
    if (this.diningHallCache.has(hallName)) {
      return this.diningHallCache.get(hallName)!;
    }

    // Map scraper hall names to database names
    const hallMapping: Record<string, string> = {
      'Latitude': 'Latitude Dining Commons',
      'Cuarto': 'Cuarto Dining Commons',
      'Segundo': 'Segundo Dining Commons',
      'Tercero': 'Tercero Dining Commons',
    };

    const dbHallName = hallMapping[hallName] || hallName;

    // Try to find existing hall
    const { data: existingHall, error: selectError } = await this.supabase
      .from('dining_halls')
      .select('id')
      .eq('name', dbHallName)
      .single();

    if (existingHall) {
      this.diningHallCache.set(hallName, existingHall.id);
      return existingHall.id;
    }

    // If not found, create it
    const shortName = hallName;
    const { data: newHall, error: insertError } = await this.supabase
      .from('dining_halls')
      .insert({
        name: dbHallName,
        short_name: shortName,
        is_active: true,
      })
      .select('id')
      .single();

    if (insertError || !newHall) {
      throw new Error(`Failed to get/create dining hall: ${insertError?.message}`);
    }

    this.diningHallCache.set(hallName, newHall.id);
    return newHall.id;
  }

  /**
   * Get or create menu_day record
   */
  private async getOrCreateMenuDay(
    diningHallId: string,
    date: Date,
    mealType: string
  ): Promise<string> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Normalize meal type to match database enum
    const normalizedMealType = mealType.toLowerCase().replace(/\s+/g, '_');

    // Try to find existing menu day
    const { data: existingMenuDay, error: selectError } = await this.supabase
      .from('menu_days')
      .select('id')
      .eq('dining_hall_id', diningHallId)
      .eq('date', dateStr)
      .eq('meal_type', normalizedMealType)
      .single();

    if (existingMenuDay) {
      return existingMenuDay.id;
    }

    // Create new menu day
    const { data: newMenuDay, error: insertError } = await this.supabase
      .from('menu_days')
      .insert({
        dining_hall_id: diningHallId,
        date: dateStr,
        meal_type: normalizedMealType,
        is_available: true,
      })
      .select('id')
      .single();

    if (insertError || !newMenuDay) {
      throw new Error(`Failed to create menu_day: ${insertError?.message}`);
    }

    return newMenuDay.id;
  }

  /**
   * Determine category from station name
   */
  private categorizeItem(station: string, name: string): string {
    const stationLower = station.toLowerCase();
    const nameLower = name.toLowerCase();

    if (stationLower.includes('grill') || stationLower.includes('entree')) {
      return 'entree';
    }
    if (stationLower.includes('salad')) {
      return 'salad';
    }
    if (stationLower.includes('soup')) {
      return 'soup';
    }
    if (stationLower.includes('dessert') || nameLower.includes('cake') || nameLower.includes('cookie')) {
      return 'dessert';
    }
    if (stationLower.includes('beverage') || stationLower.includes('drink')) {
      return 'beverage';
    }
    if (stationLower.includes('side')) {
      return 'side';
    }
    if (stationLower.includes('condiment')) {
      return 'condiment';
    }
    
    return 'other';
  }

  /**
   * Store a single menu item with its nutrition info
   */
  private async storeMenuItem(
    item: MenuItemWithNutrition,
    menuDayId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Prepare menu item data
      const menuItemData = {
        menu_day_id: menuDayId,
        name: item.name,
        description: item.description || null,
        category: this.categorizeItem(item.station, item.name),
        station: item.station,
        is_vegetarian: item.dietaryFlags.some(flag => 
          flag.toLowerCase().includes('vegetarian')
        ),
        is_vegan: item.dietaryFlags.some(flag => 
          flag.toLowerCase().includes('vegan')
        ),
        contains_gluten: item.allergens.some(allergen =>
          allergen.toLowerCase().includes('gluten') || allergen.toLowerCase().includes('wheat')
        ),
        contains_dairy: item.allergens.some(allergen =>
          allergen.toLowerCase().includes('milk') || allergen.toLowerCase().includes('dairy')
        ),
        contains_nuts: item.allergens.some(allergen =>
          allergen.toLowerCase().includes('nut') || allergen.toLowerCase().includes('peanut')
        ),
        allergen_info: item.allergens,
      };

      // Insert menu item
      const { data: menuItem, error: menuItemError } = await this.supabase
        .from('menu_items')
        .insert(menuItemData)
        .select('id')
        .single();

      if (menuItemError || !menuItem) {
        return { success: false, error: `Failed to insert menu item: ${menuItemError?.message}` };
      }

      // Insert nutrition facts if available
      if (item.nutrition) {
        const nutritionData = {
          menu_item_id: menuItem.id,
          serving_size: item.nutrition.servingSize || null,
          calories: item.nutrition.calories || null,
          protein_g: item.nutrition.protein || null,
          carbs_g: item.nutrition.carbs || null,
          fat_g: item.nutrition.fat || null,
          fiber_g: item.nutrition.fiber || null,
          sugar_g: item.nutrition.sugar || null,
          sodium_mg: item.nutrition.sodium || null,
          cholesterol_mg: item.nutrition.cholesterol || null,
        };

        const { error: nutritionError } = await this.supabase
          .from('nutrition_facts')
          .insert(nutritionData);

        if (nutritionError) {
          console.warn(`Failed to insert nutrition for ${item.name}: ${nutritionError.message}`);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Store multiple menu items for a specific date
   */
  async storeMenuItems(
    items: MenuItemWithNutrition[],
    date?: Date
  ): Promise<{ success: boolean; stored: number; failed: number; errors: string[] }> {
    const targetDate = date || new Date();
    const errors: string[] = [];
    let stored = 0;
    let failed = 0;

    console.log(`\n📊 Storing ${items.length} menu items to Supabase...`);

    // Group items by hall and meal
    const grouped = new Map<string, MenuItemWithNutrition[]>();
    for (const item of items) {
      const key = `${item.hall}|${item.meal}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }

    // Process each group
    for (const [key, groupItems] of grouped.entries()) {
      const [hall, meal] = key.split('|');
      
      try {
        // Get dining hall ID
        const diningHallId = await this.getDiningHallId(hall);
        
        // Get or create menu day
        const menuDayId = await this.getOrCreateMenuDay(diningHallId, targetDate, meal);
        
        console.log(`  Processing ${hall} - ${meal}: ${groupItems.length} items`);
        
        // Store each item
        for (const item of groupItems) {
          const result = await this.storeMenuItem(item, menuDayId);
          if (result.success) {
            stored++;
          } else {
            failed++;
            errors.push(`${item.name}: ${result.error}`);
          }
        }
      } catch (error: any) {
        const errorMsg = `Failed to process ${hall} ${meal}: ${error.message}`;
        errors.push(errorMsg);
        failed += groupItems.length;
        console.error(`  ❌ ${errorMsg}`);
      }
    }

    console.log(`\n✓ Storage complete: ${stored} stored, ${failed} failed`);
    
    return {
      success: failed === 0,
      stored,
      failed,
      errors,
    };
  }

  /**
   * Clear menu data for a specific date (useful for re-scraping)
   */
  async clearMenuForDate(date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    
    console.log(`\n🗑️  Clearing existing menu data for ${dateStr}...`);
    
    // Get menu_days for this date
    const { data: menuDays, error: selectError } = await this.supabase
      .from('menu_days')
      .select('id')
      .eq('date', dateStr);

    if (selectError) {
      throw new Error(`Failed to query menu_days: ${selectError.message}`);
    }

    if (!menuDays || menuDays.length === 0) {
      console.log('  No existing data to clear');
      return;
    }

    const menuDayIds = menuDays.map(md => md.id);

    // Delete menu_items (nutrition_facts will cascade)
    const { error: deleteItemsError } = await this.supabase
      .from('menu_items')
      .delete()
      .in('menu_day_id', menuDayIds);

    if (deleteItemsError) {
      throw new Error(`Failed to delete menu_items: ${deleteItemsError.message}`);
    }

    // Delete menu_days
    const { error: deleteDaysError } = await this.supabase
      .from('menu_days')
      .delete()
      .eq('date', dateStr);

    if (deleteDaysError) {
      throw new Error(`Failed to delete menu_days: ${deleteDaysError.message}`);
    }

    console.log(`  ✓ Cleared ${menuDays.length} menu day(s)`);
  }
}

