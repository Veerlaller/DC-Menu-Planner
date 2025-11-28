import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireUserId, getUserId } from '../middleware/auth.js';
import type { LogMealRequest, LogMealResponse, MealLogsResponse, MealLog, TodayMealsResponse, ErrorResponse } from '../types/api.js';

const router = Router();

/**
 * POST /api/meals/log
 * Log a consumed meal
 */
router.post('/log', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const body = req.body as LogMealRequest;

    // Validate required fields
    if (!body.menu_item_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'menu_item_id is required',
      } as ErrorResponse);
    }

    // Validate servings
    if (body.servings !== undefined && body.servings <= 0) {
      return res.status(400).json({
        error: 'Invalid servings',
        details: 'Servings must be a positive number',
      } as ErrorResponse);
    }

    // Verify menu item exists
    const { data: menuItem, error: menuItemError } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', body.menu_item_id)
      .single();

    if (menuItemError || !menuItem) {
      return res.status(404).json({
        error: 'Menu item not found',
        details: 'The specified menu_item_id does not exist',
      } as ErrorResponse);
    }

    // Insert meal log
    const mealLogData = {
      user_id: userId,
      menu_item_id: body.menu_item_id,
      servings: body.servings || 1.0,
      eaten_at: body.eaten_at || new Date().toISOString(),
      notes: body.notes || null,
      logged_at: new Date().toISOString(),
    };

    const { data: mealLog, error: insertError } = await supabase
      .from('meal_logs')
      .insert(mealLogData)
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting meal log:', insertError);
      return res.status(500).json({
        error: 'Failed to log meal',
        details: insertError.message,
      } as ErrorResponse);
    }

    res.status(201).json({
      success: true,
      meal_log: mealLog,
    } as LogMealResponse);

  } catch (error) {
    console.error('Unexpected error in POST /api/meals/log:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/meals/logs
 * Get user's meal logs with optional date filtering
 * Query params: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
router.get('/logs', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { start_date, end_date } = req.query;

    // Build query
    let query = supabase
      .from('meal_logs')
      .select(`
        *,
        menu_items:menu_item_id (
          id,
          name,
          description,
          category,
          is_vegetarian,
          is_vegan,
          nutrition_facts (
            calories,
            protein_g,
            carbs_g,
            fat_g,
            serving_size
          )
        )
      `)
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    // Apply date filters if provided
    if (start_date && typeof start_date === 'string') {
      query = query.gte('logged_at', `${start_date}T00:00:00Z`);
    }

    if (end_date && typeof end_date === 'string') {
      query = query.lte('logged_at', `${end_date}T23:59:59Z`);
    }

    const { data: mealLogs, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching meal logs:', fetchError);
      return res.status(500).json({
        error: 'Failed to fetch meal logs',
        details: fetchError.message,
      } as ErrorResponse);
    }

    res.status(200).json({
      meal_logs: mealLogs || [],
      count: mealLogs?.length || 0,
    } as MealLogsResponse);

  } catch (error) {
    console.error('Unexpected error in GET /api/meals/logs:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * DELETE /api/meals/log/:id
 * Remove a logged meal
 */
router.delete('/log/:id', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Missing meal log ID',
        details: 'Meal log ID is required in the URL',
      } as ErrorResponse);
    }

    // Verify the meal log exists and belongs to the user
    const { data: existingLog, error: fetchError } = await supabase
      .from('meal_logs')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingLog) {
      return res.status(404).json({
        error: 'Meal log not found',
        details: 'The specified meal log does not exist',
      } as ErrorResponse);
    }

    if (existingLog.user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        details: 'You do not have permission to delete this meal log',
      } as ErrorResponse);
    }

    // Delete the meal log
    const { error: deleteError } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Extra safety check

    if (deleteError) {
      console.error('Error deleting meal log:', deleteError);
      return res.status(500).json({
        error: 'Failed to delete meal log',
        details: deleteError.message,
      } as ErrorResponse);
    }

    res.status(200).json({
      success: true,
      message: 'Meal log deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/meals/log/:id:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/meals/today
 * Get today's logged meals with macro totals
 */
router.get('/today', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Fetch today's meal logs
    const { data: mealLogs, error: fetchError } = await supabase
      .from('meal_logs')
      .select(`
        *,
        menu_items:menu_item_id (
          id,
          name,
          description,
          category,
          is_vegetarian,
          is_vegan,
          nutrition_facts (
            calories,
            protein_g,
            carbs_g,
            fat_g,
            serving_size
          )
        )
      `)
      .eq('user_id', userId)
      .gte('logged_at', startOfDay)
      .lte('logged_at', endOfDay)
      .order('logged_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching today\'s meals:', fetchError);
      return res.status(500).json({
        error: 'Failed to fetch today\'s meals',
        details: fetchError.message,
      } as ErrorResponse);
    }

    // Calculate macro totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    if (mealLogs && mealLogs.length > 0) {
      mealLogs.forEach((log: any) => {
        const servings = log.servings || 1.0;
        const nutrition = log.menu_items?.nutrition_facts;
        
        if (nutrition) {
          totalCalories += (nutrition.calories || 0) * servings;
          totalProtein += (nutrition.protein_g || 0) * servings;
          totalCarbs += (nutrition.carbs_g || 0) * servings;
          totalFat += (nutrition.fat_g || 0) * servings;
        }
      });
    }

    res.status(200).json({
      date: today.toISOString().split('T')[0],
      meal_logs: mealLogs || [],
      totals: {
        calories: Math.round(totalCalories * 100) / 100,
        protein_g: Math.round(totalProtein * 100) / 100,
        carbs_g: Math.round(totalCarbs * 100) / 100,
        fat_g: Math.round(totalFat * 100) / 100,
      },
      count: mealLogs?.length || 0,
    } as TodayMealsResponse);

  } catch (error) {
    console.error('Unexpected error in GET /api/meals/today:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

export default router;

