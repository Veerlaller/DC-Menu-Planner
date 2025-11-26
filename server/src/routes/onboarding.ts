import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireUserId, getUserId } from '../middleware/auth.js';
import type { OnboardingRequest, OnboardingResponse, ErrorResponse } from '../types/api.js';

const router = Router();

/**
 * POST /api/onboarding
 * Save or update user onboarding data (profile + preferences)
 */
router.post('/onboarding', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const body = req.body as OnboardingRequest;

    // Validate required fields
    if (!body.height_cm || !body.weight_kg || !body.age || !body.sex || !body.goal) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'height_cm, weight_kg, age, sex, and goal are required',
      } as ErrorResponse);
    }

    // Validate ranges
    if (body.age < 1 || body.age > 150) {
      return res.status(400).json({
        error: 'Invalid age',
        details: 'Age must be between 1 and 150',
      } as ErrorResponse);
    }

    if (body.height_cm <= 0 || body.weight_kg <= 0) {
      return res.status(400).json({
        error: 'Invalid measurements',
        details: 'Height and weight must be positive numbers',
      } as ErrorResponse);
    }

    // Validate enums
    const validSex = ['male', 'female', 'other'];
    const validGoals = ['cut', 'bulk', 'maintain'];
    
    if (!validSex.includes(body.sex)) {
      return res.status(400).json({
        error: 'Invalid sex',
        details: 'Sex must be male, female, or other',
      } as ErrorResponse);
    }

    if (!validGoals.includes(body.goal)) {
      return res.status(400).json({
        error: 'Invalid goal',
        details: 'Goal must be cut, bulk, or maintain',
      } as ErrorResponse);
    }

    // Upsert user_profiles
    const profileData = {
      user_id: userId,
      height_cm: body.height_cm,
      weight_kg: body.weight_kg,
      age: body.age,
      sex: body.sex,
      goal: body.goal,
      activity_level: body.activity_level || 'moderate',
      target_calories: body.target_calories || null,
      target_protein_g: body.target_protein_g || null,
      target_carbs_g: body.target_carbs_g || null,
      target_fat_g: body.target_fat_g || null,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error upserting profile:', profileError);
      return res.status(500).json({
        error: 'Failed to save profile',
        details: profileError.message,
      } as ErrorResponse);
    }

    // Upsert user_preferences
    const preferencesData = {
      user_id: userId,
      is_vegetarian: body.is_vegetarian || false,
      is_vegan: body.is_vegan || false,
      is_pescatarian: body.is_pescatarian || false,
      is_gluten_free: body.is_gluten_free || false,
      is_dairy_free: body.is_dairy_free || false,
      allergies: body.allergies || [],
      dislikes: body.dislikes || [],
      preferences: body.preferences || [],
      updated_at: new Date().toISOString(),
    };

    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .upsert(preferencesData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (preferencesError) {
      console.error('Error upserting preferences:', preferencesError);
      return res.status(500).json({
        error: 'Failed to save preferences',
        details: preferencesError.message,
      } as ErrorResponse);
    }

    // Return combined response
    res.status(200).json({
      success: true,
      profile,
      preferences,
    } as OnboardingResponse & { success: boolean });

  } catch (error) {
    console.error('Unexpected error in POST /api/onboarding:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

/**
 * GET /api/onboarding
 * Retrieve user onboarding data (profile + preferences)
 */
router.get('/onboarding', requireUserId, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No rows returned
        return res.status(404).json({
          error: 'Onboarding not found',
          details: 'User has not completed onboarding',
        } as ErrorResponse);
      }
      
      console.error('Error fetching profile:', profileError);
      return res.status(500).json({
        error: 'Failed to fetch profile',
        details: profileError.message,
      } as ErrorResponse);
    }

    // Fetch user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (preferencesError) {
      if (preferencesError.code === 'PGRST116') {
        // No rows returned - create default preferences
        return res.status(404).json({
          error: 'Onboarding not found',
          details: 'User has not completed onboarding',
        } as ErrorResponse);
      }
      
      console.error('Error fetching preferences:', preferencesError);
      return res.status(500).json({
        error: 'Failed to fetch preferences',
        details: preferencesError.message,
      } as ErrorResponse);
    }

    // Return combined response
    res.status(200).json({
      profile,
      preferences,
    } as OnboardingResponse);

  } catch (error) {
    console.error('Unexpected error in GET /api/onboarding:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
});

export default router;

