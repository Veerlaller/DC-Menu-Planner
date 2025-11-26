import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireUserId, getUserId } from '../middleware/auth.js';
import type { TodayResponse, MacroTargets, ErrorResponse } from '../types/api.js';

const router = Router();

/**
 * GET /api/today
 * Get today's macro tracking data for the user
 */
router.get('/today', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Fetch user profile to get targets
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('target_calories, target_protein_g, target_carbs_g, target_fat_g')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Profile not found',
          details: 'User has not completed onboarding',
        } as ErrorResponse);
      }
      
      console.error('Error fetching profile:', profileError);
      return res.status(500).json({
        error: 'Failed to fetch profile',
        details: profileError.message,
      } as ErrorResponse);
    }

    // Set up macro targets (use stored values or defaults)
    const targets: MacroTargets = {
      calories: profile.target_calories || 2000,
      protein_g: profile.target_protein_g || 150,
      carbs_g: profile.target_carbs_g || 250,
      fat_g: profile.target_fat_g || 65,
    };

    // Fetch today's meal logs with nutrition facts
    const { data: mealLogs, error: logsError } = await supabase
      .from('meal_logs')
      .select(`
        servings,
        menu_item_id,
        menu_items!inner (
          nutrition_facts!inner (
            calories,
            protein_g,
            carbs_g,
            fat_g
          )
        )
      `)
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00`)
      .lt('logged_at', `${today}T23:59:59`);

    if (logsError) {
      console.error('Error fetching meal logs:', logsError);
      return res.status(500).json({
        error: 'Failed to fetch meal logs',
        details: logsError.message,
      } as ErrorResponse);
    }

    // Calculate consumed macros
    let consumed: MacroTargets = {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    };

    if (mealLogs && mealLogs.length > 0) {
      mealLogs.forEach((log: any) => {
        const servings = parseFloat(log.servings) || 1;
        const nutrition = log.menu_items?.nutrition_facts;

        if (nutrition) {
          consumed.calories += (parseFloat(nutrition.calories) || 0) * servings;
          consumed.protein_g += (parseFloat(nutrition.protein_g) || 0) * servings;
          consumed.carbs_g += (parseFloat(nutrition.carbs_g) || 0) * servings;
          consumed.fat_g += (parseFloat(nutrition.fat_g) || 0) * servings;
        }
      });
    }

    // Round to 1 decimal place
    consumed = {
      calories: Math.round(consumed.calories * 10) / 10,
      protein_g: Math.round(consumed.protein_g * 10) / 10,
      carbs_g: Math.round(consumed.carbs_g * 10) / 10,
      fat_g: Math.round(consumed.fat_g * 10) / 10,
    };

    // Calculate remaining macros
    const remaining: MacroTargets = {
      calories: Math.round((targets.calories - consumed.calories) * 10) / 10,
      protein_g: Math.round((targets.protein_g - consumed.protein_g) * 10) / 10,
      carbs_g: Math.round((targets.carbs_g - consumed.carbs_g) * 10) / 10,
      fat_g: Math.round((targets.fat_g - consumed.fat_g) * 10) / 10,
    };

    // Return today's tracking data
    res.status(200).json({
      date: today,
      targets,
      consumed,
      remaining,
    } as TodayResponse);

  } catch (error) {
    console.error('Unexpected error in GET /api/today:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

export default router;

