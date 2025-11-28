import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import type { ErrorResponse } from '../types/api.js';

const router = Router();

/**
 * GET /api/menus/available
 * Get all available menu items for a specific date
 * Query params:
 *   - date: YYYY-MM-DD format (optional, defaults to today)
 */
router.get('/menus/available', async (req: Request, res: Response) => {
  try {
    const dateParam = req.query.date as string;
    const date = dateParam || new Date().toISOString().split('T')[0];

    console.log(`📡 GET /api/menus/available - Fetching menus for ${date}`);

    // Fetch menu items with all related data
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        menu_day_id,
        name,
        description,
        category,
        station,
        is_vegetarian,
        is_vegan,
        contains_gluten,
        contains_dairy,
        contains_nuts,
        allergen_info,
        menu_days!inner (
          id,
          meal_type,
          date,
          dining_halls!inner (
            id,
            name,
            short_name
          )
        ),
        nutrition_facts (
          id,
          menu_item_id,
          serving_size,
          serving_size_g,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          saturated_fat_g,
          trans_fat_g,
          fiber_g,
          sugar_g,
          sodium_mg,
          cholesterol_mg,
          calcium_mg,
          iron_mg,
          vitamin_a_mcg,
          vitamin_c_mg
        )
      `)
      .eq('menu_days.date', date);

    if (error) {
      console.error('❌ Error fetching menu items:', error);
      return res.status(500).json({
        error: 'Failed to fetch menus',
        details: error.message,
      } as ErrorResponse);
    }

    // Transform the data to flatten the structure
    const transformedItems = menuItems.map((item: any) => {
      const menuDay = Array.isArray(item.menu_days) ? item.menu_days[0] : item.menu_days;
      const diningHall = menuDay?.dining_halls;
      const nutrition = Array.isArray(item.nutrition_facts) ? item.nutrition_facts[0] : item.nutrition_facts;

      return {
        id: item.id,
        menu_day_id: item.menu_day_id,
        name: item.name,
        description: item.description,
        category: item.category,
        station: item.station,
        is_vegetarian: item.is_vegetarian,
        is_vegan: item.is_vegan,
        contains_gluten: item.contains_gluten,
        contains_dairy: item.contains_dairy,
        contains_nuts: item.contains_nuts,
        allergen_info: item.allergen_info,
        meal_type: menuDay?.meal_type,
        date: menuDay?.date,
        dining_hall: diningHall ? {
          id: diningHall.id,
          name: diningHall.name,
          short_name: diningHall.short_name,
        } : null,
        nutrition: nutrition || null,
      };
    });

    console.log(`✅ Found ${transformedItems.length} menu items for ${date}`);

    return res.status(200).json({
      success: true,
      data: transformedItems,
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/menus/available:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/menus/:hall/:mealType
 * Get menu items for a specific dining hall and meal type
 * Path params:
 *   - hall: dining hall short name (Latitude, Cuarto, Segundo, Tercero)
 *   - mealType: meal type (breakfast, lunch, dinner)
 * Query params:
 *   - date: YYYY-MM-DD format (optional, defaults to today)
 */
router.get('/menus/:hall/:mealType', async (req: Request, res: Response) => {
  try {
    const { hall } = req.params;
    const mealType = req.params.mealType || 'lunch';
    const dateParam = req.query.date as string;
    const date = dateParam || new Date().toISOString().split('T')[0];

    console.log(`📡 GET /api/menus/${hall}/${mealType} - Date: ${date}`);

    // Fetch menu items with all related data
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        menu_day_id,
        name,
        description,
        category,
        station,
        is_vegetarian,
        is_vegan,
        contains_gluten,
        contains_dairy,
        contains_nuts,
        allergen_info,
        menu_days!inner (
          id,
          meal_type,
          date,
          dining_halls!inner (
            id,
            name,
            short_name
          )
        ),
        nutrition_facts (
          id,
          menu_item_id,
          serving_size,
          serving_size_g,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          saturated_fat_g,
          trans_fat_g,
          fiber_g,
          sugar_g,
          sodium_mg,
          cholesterol_mg,
          calcium_mg,
          iron_mg,
          vitamin_a_mcg,
          vitamin_c_mg
        )
      `)
      .eq('menu_days.date', date)
      .eq('menu_days.meal_type', mealType.toLowerCase())
      .eq('menu_days.dining_halls.short_name', hall);

    if (error) {
      console.error('❌ Error fetching menu items:', error);
      return res.status(500).json({
        error: 'Failed to fetch menus',
        details: error.message,
      } as ErrorResponse);
    }

    // Transform the data to flatten the structure
    const transformedItems = menuItems.map((item: any) => {
      const menuDay = Array.isArray(item.menu_days) ? item.menu_days[0] : item.menu_days;
      const diningHall = menuDay?.dining_halls;
      const nutrition = Array.isArray(item.nutrition_facts) ? item.nutrition_facts[0] : item.nutrition_facts;

      return {
        id: item.id,
        menu_day_id: item.menu_day_id,
        name: item.name,
        description: item.description,
        category: item.category,
        station: item.station,
        is_vegetarian: item.is_vegetarian,
        is_vegan: item.is_vegan,
        contains_gluten: item.contains_gluten,
        contains_dairy: item.contains_dairy,
        contains_nuts: item.contains_nuts,
        allergen_info: item.allergen_info,
        meal_type: menuDay?.meal_type,
        date: menuDay?.date,
        dining_hall: diningHall ? {
          id: diningHall.id,
          name: diningHall.name,
          short_name: diningHall.short_name,
        } : null,
        nutrition: nutrition || null,
      };
    });

    console.log(`✅ Found ${transformedItems.length} menu items for ${hall} ${mealType}`);

    return res.status(200).json({
      success: true,
      data: transformedItems,
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/menus/:hall/:mealType:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

export default router;

