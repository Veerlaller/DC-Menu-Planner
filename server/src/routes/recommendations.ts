import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireUserId, getUserId } from '../middleware/auth.js';
import {
  recommendMeals,
  getUserRemainingMacros,
  getUserPreferences,
  MenuItem,
} from '../utils/recommendation-engine.js';
import type { ErrorResponse } from '../types/api.js';

const router = Router();

/**
 * GET /api/recommendations/now
 * "I'm Hungry Now" feature - Get personalized meal recommendations
 * based on current time, remaining macros, and user preferences
 */
router.get('/recommendations/now', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const limitParam = req.query.limit as string;
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    console.log(`📡 GET /api/recommendations/now - User: ${userId}`);

    // Get user's remaining macros
    const remaining = await getUserRemainingMacros(userId);
    if (!remaining) {
      return res.status(404).json({
        error: 'User profile not found',
        details: 'Please complete onboarding first',
      } as ErrorResponse);
    }

    // Get user preferences
    const preferences = await getUserPreferences(userId);
    if (!preferences) {
      return res.status(404).json({
        error: 'User preferences not found',
        details: 'Please complete onboarding first',
      } as ErrorResponse);
    }

    // Get currently available menu items (today's date)
    const today = new Date().toISOString().split('T')[0];
    const { data: menuItems, error: menuError } = await supabase
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
          sodium_mg
        )
      `)
      .eq('menu_days.date', today);

    if (menuError) {
      console.error('❌ Error fetching menu items:', menuError);
      return res.status(500).json({
        error: 'Failed to fetch available menu items',
        details: menuError.message,
      } as ErrorResponse);
    }

    // Transform menu items to match expected format
    const transformedItems: MenuItem[] = menuItems.map((item: any) => {
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
        allergen_info: item.allergen_info || [],
        meal_type: menuDay?.meal_type || 'lunch',
        date: menuDay?.date || today,
        dining_hall: diningHall ? {
          id: diningHall.id,
          name: diningHall.name,
          short_name: diningHall.short_name,
        } : null,
        nutrition: nutrition ? {
          calories: parseFloat(nutrition.calories) || 0,
          protein_g: parseFloat(nutrition.protein_g) || 0,
          carbs_g: parseFloat(nutrition.carbs_g) || 0,
          fat_g: parseFloat(nutrition.fat_g) || 0,
          fiber_g: nutrition.fiber_g ? parseFloat(nutrition.fiber_g) : undefined,
          sugar_g: nutrition.sugar_g ? parseFloat(nutrition.sugar_g) : undefined,
          sodium_mg: nutrition.sodium_mg ? parseFloat(nutrition.sodium_mg) : undefined,
        } : null,
      };
    });

    // Filter out items without nutrition data
    const itemsWithNutrition = transformedItems.filter(item => item.nutrition !== null);

    if (itemsWithNutrition.length === 0) {
      return res.status(404).json({
        error: 'No menu items available',
        details: 'No menu items with nutrition data found for today',
      } as ErrorResponse);
    }

    console.log(`📊 Found ${itemsWithNutrition.length} items with nutrition data`);
    console.log(`🎯 Remaining macros: ${remaining.calories} cal, ${remaining.protein_g}g protein`);

    // Get recommendations
    const recommendations = await recommendMeals(
      userId,
      remaining,
      preferences,
      itemsWithNutrition,
      new Date(),
      limit
    );

    console.log(`✅ Generated ${recommendations.length} recommendations`);

    // Format response
    const response = {
      success: true,
      date: today,
      remaining_macros: remaining,
      recommendations: recommendations.map(rec => ({
        item: {
          id: rec.item.id,
          name: rec.item.name,
          description: rec.item.description,
          category: rec.item.category,
          station: rec.item.station,
          dining_hall: rec.item.dining_hall,
          nutrition: rec.item.nutrition,
          is_vegetarian: rec.item.is_vegetarian,
          is_vegan: rec.item.is_vegan,
        },
        score: rec.totalScore,
        breakdown: {
          macro_score: rec.macroScore,
          preference_score: rec.preferenceScore,
          variety_score: rec.varietyScore,
          availability_score: rec.availabilityScore,
        },
        reasoning: rec.reasoning,
      })),
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/recommendations/now:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/recommendations/meal/:meal_period
 * Get recommendations for a specific meal period (breakfast, lunch, dinner)
 */
router.get('/recommendations/meal/:meal_period', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const mealPeriod = req.params.meal_period.toLowerCase();
    const limitParam = req.query.limit as string;
    const dateParam = req.query.date as string;
    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    const date = dateParam || new Date().toISOString().split('T')[0];

    // Validate meal period
    const validMealPeriods = ['breakfast', 'lunch', 'dinner', 'brunch', 'late_night'];
    if (!validMealPeriods.includes(mealPeriod)) {
      return res.status(400).json({
        error: 'Invalid meal period',
        details: `Meal period must be one of: ${validMealPeriods.join(', ')}`,
      } as ErrorResponse);
    }

    console.log(`📡 GET /api/recommendations/meal/${mealPeriod} - User: ${userId}, Date: ${date}`);

    // Get user's remaining macros
    const remaining = await getUserRemainingMacros(userId);
    if (!remaining) {
      return res.status(404).json({
        error: 'User profile not found',
        details: 'Please complete onboarding first',
      } as ErrorResponse);
    }

    // Get user preferences
    const preferences = await getUserPreferences(userId);
    if (!preferences) {
      return res.status(404).json({
        error: 'User preferences not found',
        details: 'Please complete onboarding first',
      } as ErrorResponse);
    }

    // Get menu items for specific meal period
    const { data: menuItems, error: menuError } = await supabase
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
          sodium_mg
        )
      `)
      .eq('menu_days.date', date)
      .eq('menu_days.meal_type', mealPeriod);

    if (menuError) {
      console.error('❌ Error fetching menu items:', menuError);
      return res.status(500).json({
        error: 'Failed to fetch menu items',
        details: menuError.message,
      } as ErrorResponse);
    }

    // Transform menu items
    const transformedItems: MenuItem[] = menuItems.map((item: any) => {
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
        allergen_info: item.allergen_info || [],
        meal_type: menuDay?.meal_type || mealPeriod,
        date: menuDay?.date || date,
        dining_hall: diningHall ? {
          id: diningHall.id,
          name: diningHall.name,
          short_name: diningHall.short_name,
        } : null,
        nutrition: nutrition ? {
          calories: parseFloat(nutrition.calories) || 0,
          protein_g: parseFloat(nutrition.protein_g) || 0,
          carbs_g: parseFloat(nutrition.carbs_g) || 0,
          fat_g: parseFloat(nutrition.fat_g) || 0,
          fiber_g: nutrition.fiber_g ? parseFloat(nutrition.fiber_g) : undefined,
          sugar_g: nutrition.sugar_g ? parseFloat(nutrition.sugar_g) : undefined,
          sodium_mg: nutrition.sodium_mg ? parseFloat(nutrition.sodium_mg) : undefined,
        } : null,
      };
    });

    // Filter out items without nutrition data
    const itemsWithNutrition = transformedItems.filter(item => item.nutrition !== null);

    if (itemsWithNutrition.length === 0) {
      return res.status(404).json({
        error: 'No menu items available',
        details: `No menu items found for ${mealPeriod} on ${date}`,
      } as ErrorResponse);
    }

    console.log(`📊 Found ${itemsWithNutrition.length} items for ${mealPeriod}`);

    // Get recommendations
    const recommendations = await recommendMeals(
      userId,
      remaining,
      preferences,
      itemsWithNutrition,
      new Date(date),
      limit
    );

    console.log(`✅ Generated ${recommendations.length} recommendations for ${mealPeriod}`);

    // Format response
    const response = {
      success: true,
      date,
      meal_period: mealPeriod,
      remaining_macros: remaining,
      recommendations: recommendations.map(rec => ({
        item: {
          id: rec.item.id,
          name: rec.item.name,
          description: rec.item.description,
          category: rec.item.category,
          station: rec.item.station,
          dining_hall: rec.item.dining_hall,
          nutrition: rec.item.nutrition,
          is_vegetarian: rec.item.is_vegetarian,
          is_vegan: rec.item.is_vegan,
        },
        score: rec.totalScore,
        breakdown: {
          macro_score: rec.macroScore,
          preference_score: rec.preferenceScore,
          variety_score: rec.varietyScore,
          availability_score: rec.availabilityScore,
        },
        reasoning: rec.reasoning,
      })),
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error(`❌ Unexpected error in GET /api/recommendations/meal/${req.params.meal_period}:`, error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

export default router;

