import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import type { ErrorResponse } from '../types/api.js';

const router = Router();

/**
 * GET /api/menus/halls
 * Get list of all dining halls
 */
router.get('/halls', async (req: Request, res: Response) => {
  try {
    console.log('📡 GET /api/menus/halls - Fetching dining halls');

    const { data: halls, error } = await supabase
      .from('dining_halls')
      .select('id, name, short_name, location, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching dining halls:', error);
      return res.status(500).json({
        error: 'Failed to fetch dining halls',
        details: error.message,
      } as ErrorResponse);
    }

    console.log(`✅ Found ${halls?.length || 0} dining halls`);

    return res.status(200).json({
      success: true,
      data: halls || [],
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/menus/halls:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/menus/today
 * Get today's menu across all dining halls
 */
router.get('/today', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📡 GET /api/menus/today - Fetching menus for ${today}`);

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
          calories,
          protein_g,
          carbs_g,
          fat_g,
          fiber_g,
          sugar_g,
          sodium_mg,
          serving_size
        )
      `)
      .eq('menu_days.date', today);

    if (error) {
      console.error('❌ Error fetching menu items:', error);
      return res.status(500).json({
        error: 'Failed to fetch menus',
        details: error.message,
      } as ErrorResponse);
    }

    // Transform the data
    const transformedItems = menuItems.map((item: any) => {
      const menuDay = Array.isArray(item.menu_days) ? item.menu_days[0] : item.menu_days;
      const diningHall = menuDay?.dining_halls;
      const nutrition = Array.isArray(item.nutrition_facts) ? item.nutrition_facts[0] : item.nutrition_facts;

      return {
        id: item.id,
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
        dining_hall: diningHall ? {
          id: diningHall.id,
          name: diningHall.name,
          short_name: diningHall.short_name,
        } : null,
        nutrition: nutrition || null,
      };
    });

    console.log(`✅ Found ${transformedItems.length} menu items for today`);

    return res.status(200).json({
      success: true,
      date: today,
      data: transformedItems,
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/menus/today:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/menus/item/:id
 * Get specific menu item details including full nutrition info
 */
router.get('/item/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📡 GET /api/menus/item/${id} - Fetching menu item details`);

    const { data: menuItem, error } = await supabase
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
          start_time,
          end_time,
          dining_halls!inner (
            id,
            name,
            short_name,
            location
          )
        ),
        nutrition_facts (
          id,
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
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Menu item not found',
        } as ErrorResponse);
      }

      console.error('❌ Error fetching menu item:', error);
      return res.status(500).json({
        error: 'Failed to fetch menu item',
        details: error.message,
      } as ErrorResponse);
    }

    // Transform the data
    const menuDay = Array.isArray(menuItem.menu_days) ? menuItem.menu_days[0] : menuItem.menu_days;
    const diningHallRaw = menuDay?.dining_halls;
    const diningHall = Array.isArray(diningHallRaw) ? diningHallRaw[0] : diningHallRaw;
    const nutrition = Array.isArray(menuItem.nutrition_facts) ? menuItem.nutrition_facts[0] : menuItem.nutrition_facts;

    const transformedItem = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      category: menuItem.category,
      station: menuItem.station,
      is_vegetarian: menuItem.is_vegetarian,
      is_vegan: menuItem.is_vegan,
      contains_gluten: menuItem.contains_gluten,
      contains_dairy: menuItem.contains_dairy,
      contains_nuts: menuItem.contains_nuts,
      allergen_info: menuItem.allergen_info,
      meal_type: menuDay?.meal_type,
      date: menuDay?.date,
      start_time: menuDay?.start_time,
      end_time: menuDay?.end_time,
      dining_hall: diningHall ? {
        id: diningHall.id,
        name: diningHall.name,
        short_name: diningHall.short_name,
        location: diningHall.location,
      } : null,
      nutrition: nutrition || null,
    };

    console.log(`✅ Found menu item: ${transformedItem.name}`);

    return res.status(200).json({
      success: true,
      data: transformedItem,
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/menus/item/:id:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/menus
 * Get menus with filters (hall, date, meal_period)
 * Query params:
 *   - date: YYYY-MM-DD format (optional, defaults to today)
 *   - hall: dining hall short name (optional)
 *   - meal_type: breakfast, lunch, dinner, brunch, late_night (optional)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const dateParam = req.query.date as string;
    const hallParam = req.query.hall as string;
    const mealTypeParam = req.query.meal_type as string;

    const date = dateParam || new Date().toISOString().split('T')[0];

    console.log(`📡 GET /api/menus - Filters: date=${date}, hall=${hallParam || 'all'}, meal_type=${mealTypeParam || 'all'}`);

    // Build query
    let query = supabase
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
          calories,
          protein_g,
          carbs_g,
          fat_g,
          fiber_g,
          sugar_g,
          sodium_mg,
          serving_size
        )
      `)
      .eq('menu_days.date', date);

    // Apply hall filter if provided
    if (hallParam) {
      query = query.eq('menu_days.dining_halls.short_name', hallParam);
    }

    // Apply meal type filter if provided
    if (mealTypeParam) {
      query = query.eq('menu_days.meal_type', mealTypeParam.toLowerCase());
    }

    const { data: menuItems, error } = await query;

    if (error) {
      console.error('❌ Error fetching menu items:', error);
      return res.status(500).json({
        error: 'Failed to fetch menus',
        details: error.message,
      } as ErrorResponse);
    }

    // Transform the data
    const transformedItems = menuItems.map((item: any) => {
      const menuDay = Array.isArray(item.menu_days) ? item.menu_days[0] : item.menu_days;
      const diningHall = menuDay?.dining_halls;
      const nutrition = Array.isArray(item.nutrition_facts) ? item.nutrition_facts[0] : item.nutrition_facts;

      return {
        id: item.id,
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
        dining_hall: diningHall ? {
          id: diningHall.id,
          name: diningHall.name,
          short_name: diningHall.short_name,
        } : null,
        nutrition: nutrition || null,
      };
    });

    console.log(`✅ Found ${transformedItems.length} menu items`);

    return res.status(200).json({
      success: true,
      date: date,
      filters: {
        hall: hallParam || null,
        meal_type: mealTypeParam || null,
      },
      data: transformedItems,
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/menus:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/menus/available
 * Get all available menu items for a specific date
 * Query params:
 *   - date: YYYY-MM-DD format (optional, defaults to today)
 */
router.get('/available', async (req: Request, res: Response) => {
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
router.get('/:hall/:mealType', async (req: Request, res: Response) => {
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

