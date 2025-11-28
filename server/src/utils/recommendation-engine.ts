import { supabase } from '../lib/supabase.js';

/**
 * Recommendation Engine for DC Menu Planner
 * 
 * This engine recommends meals based on:
 * - User's remaining macros for the day
 * - User's dietary preferences and restrictions
 * - Currently available menu items
 * - User's meal history (variety)
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  station: string | null;
  is_vegetarian: boolean;
  is_vegan: boolean;
  contains_gluten: boolean;
  contains_dairy: boolean;
  contains_nuts: boolean;
  allergen_info: string[];
  meal_type: string;
  date: string;
  dining_hall: {
    id: string;
    name: string;
    short_name: string;
  } | null;
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
  } | null;
}

export interface UserPreferences {
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_pescatarian: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  is_halal: boolean;
  is_kosher: boolean;
  is_hindu_non_veg: boolean;
  allergies: string[];
  dislikes: string[];
  preferences: string[];
}

export interface MacroTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface RecommendationScore {
  item: MenuItem;
  totalScore: number;
  macroScore: number;
  preferenceScore: number;
  varietyScore: number;
  availabilityScore: number;
  reasoning: string[];
}

/**
 * Calculate how well a menu item matches remaining macros
 * Returns a score from 0 to 100
 */
function calculateMacroScore(
  itemNutrition: MenuItem['nutrition'],
  remaining: MacroTargets
): { score: number; reasoning: string[] } {
  if (!itemNutrition) {
    return { score: 0, reasoning: ['No nutrition data available'] };
  }

  const reasoning: string[] = [];
  let score = 0;

  // Calculate percentage of remaining macros this item would fulfill
  const caloriePercent = remaining.calories > 0 
    ? Math.min((itemNutrition.calories / remaining.calories) * 100, 150)
    : 0;
  
  const proteinPercent = remaining.protein_g > 0
    ? Math.min((itemNutrition.protein_g / remaining.protein_g) * 100, 150)
    : 0;
  
  const carbsPercent = remaining.carbs_g > 0
    ? Math.min((itemNutrition.carbs_g / remaining.carbs_g) * 100, 150)
    : 0;
  
  const fatPercent = remaining.fat_g > 0
    ? Math.min((itemNutrition.fat_g / remaining.fat_g) * 100, 150)
    : 0;

  // Ideal item fills 25-40% of remaining macros (one meal)
  const idealMin = 20;
  const idealMax = 45;

  // Score calories (weight: 30%)
  if (caloriePercent >= idealMin && caloriePercent <= idealMax) {
    score += 30;
    reasoning.push(`Perfect calorie fit (${Math.round(caloriePercent)}% of remaining)`);
  } else if (caloriePercent < idealMin) {
    score += (caloriePercent / idealMin) * 30;
    reasoning.push(`Light meal (${Math.round(caloriePercent)}% of remaining calories)`);
  } else {
    const penalty = Math.max(0, 30 - ((caloriePercent - idealMax) / 2));
    score += penalty;
    if (caloriePercent > 100) {
      reasoning.push(`⚠️ High calories (${Math.round(caloriePercent)}% of remaining)`);
    } else {
      reasoning.push(`Substantial meal (${Math.round(caloriePercent)}% of remaining calories)`);
    }
  }

  // Score protein (weight: 35% - prioritized for fitness)
  if (proteinPercent >= idealMin && proteinPercent <= idealMax) {
    score += 35;
    reasoning.push(`Excellent protein content (${Math.round(itemNutrition.protein_g)}g)`);
  } else if (proteinPercent < idealMin) {
    score += (proteinPercent / idealMin) * 35;
    if (proteinPercent < 10) {
      reasoning.push(`⚠️ Low protein (${Math.round(itemNutrition.protein_g)}g)`);
    }
  } else {
    score += Math.max(20, 35 - ((proteinPercent - idealMax) / 3));
    reasoning.push(`High protein (${Math.round(itemNutrition.protein_g)}g)`);
  }

  // Score carbs (weight: 20%)
  if (carbsPercent >= idealMin && carbsPercent <= idealMax) {
    score += 20;
  } else if (carbsPercent < idealMin) {
    score += (carbsPercent / idealMin) * 20;
  } else {
    score += Math.max(10, 20 - ((carbsPercent - idealMax) / 2));
  }

  // Score fats (weight: 15%)
  if (fatPercent >= idealMin && fatPercent <= idealMax) {
    score += 15;
  } else if (fatPercent < idealMin) {
    score += (fatPercent / idealMin) * 15;
  } else {
    score += Math.max(5, 15 - ((fatPercent - idealMax) / 2));
  }

  return { score: Math.round(score), reasoning };
}

/**
 * Calculate how well a menu item matches user preferences
 * Returns a score from 0 to 100
 */
function calculatePreferenceScore(
  item: MenuItem,
  preferences: UserPreferences
): { score: number; reasoning: string[] } {
  let score = 100;
  const reasoning: string[] = [];

  // Check dietary restrictions (eliminates item if violated)
  if (preferences.is_vegan && !item.is_vegan) {
    return { score: 0, reasoning: ['❌ Not vegan'] };
  }

  if (preferences.is_vegetarian && !item.is_vegetarian) {
    return { score: 0, reasoning: ['❌ Not vegetarian'] };
  }

  if (preferences.is_gluten_free && item.contains_gluten) {
    return { score: 0, reasoning: ['❌ Contains gluten'] };
  }

  if (preferences.is_dairy_free && item.contains_dairy) {
    return { score: 0, reasoning: ['❌ Contains dairy'] };
  }

  // Check allergies (eliminates item if allergen present)
  if (preferences.allergies.length > 0) {
    const hasAllergen = preferences.allergies.some(allergen =>
      item.allergen_info.some(info => 
        info.toLowerCase().includes(allergen.toLowerCase())
      ) ||
      item.name.toLowerCase().includes(allergen.toLowerCase())
    );

    if (hasAllergen) {
      return { score: 0, reasoning: ['❌ Contains allergen'] };
    }
  }

  // Check nuts separately (common allergen)
  if (preferences.allergies.some(a => a.toLowerCase().includes('nut')) && item.contains_nuts) {
    return { score: 0, reasoning: ['❌ Contains nuts'] };
  }

  // Check dislikes (reduces score)
  if (preferences.dislikes.length > 0) {
    const hasDislike = preferences.dislikes.some(dislike =>
      item.name.toLowerCase().includes(dislike.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(dislike.toLowerCase()))
    );

    if (hasDislike) {
      score -= 40;
      reasoning.push('⚠️ Contains disliked ingredient');
    }
  }

  // Bonus for matching preferences
  if (preferences.preferences.length > 0) {
    const matchesPreference = preferences.preferences.some(pref =>
      item.name.toLowerCase().includes(pref.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(pref.toLowerCase())) ||
      item.category?.toLowerCase().includes(pref.toLowerCase())
    );

    if (matchesPreference) {
      score += 20;
      score = Math.min(100, score); // Cap at 100
      reasoning.push('✨ Matches your preferences');
    }
  }

  // Bonus for vegan/vegetarian even if not required
  if (item.is_vegan) {
    reasoning.push('🌱 Vegan option');
  } else if (item.is_vegetarian) {
    reasoning.push('🥗 Vegetarian option');
  }

  return { score: Math.max(0, score), reasoning };
}

/**
 * Calculate variety score based on recent meal history
 * Returns a score from 0 to 100
 */
async function calculateVarietyScore(
  item: MenuItem,
  userId: string
): Promise<{ score: number; reasoning: string[] }> {
  const reasoning: string[] = [];
  
  try {
    // Get meals from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentLogs, error } = await supabase
      .from('meal_logs')
      .select('menu_item_id, menu_items!inner(name, category)')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo.toISOString());

    if (error) {
      console.warn('Error fetching meal history for variety score:', error);
      return { score: 50, reasoning: ['No meal history available'] };
    }

    if (!recentLogs || recentLogs.length === 0) {
      reasoning.push('🆕 New to your rotation');
      return { score: 100, reasoning };
    }

    // Check if exact item was eaten recently
    const itemEatenCount = recentLogs.filter((log: any) => 
      log.menu_item_id === item.id
    ).length;

    if (itemEatenCount > 0) {
      const penalty = Math.min(50, itemEatenCount * 20);
      reasoning.push(`Eaten ${itemEatenCount}x this week`);
      return { score: Math.max(0, 100 - penalty), reasoning };
    }

    // Check if similar item (same name) was eaten
    const similarEatenCount = recentLogs.filter((log: any) =>
      log.menu_items?.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]) ||
      item.name.toLowerCase().includes(log.menu_items?.name.toLowerCase().split(' ')[0])
    ).length;

    if (similarEatenCount > 0) {
      const penalty = Math.min(30, similarEatenCount * 10);
      reasoning.push(`Similar item eaten ${similarEatenCount}x this week`);
      return { score: Math.max(30, 100 - penalty), reasoning };
    }

    // Check if same category was eaten a lot
    const categoryEatenCount = recentLogs.filter((log: any) =>
      log.menu_items?.category === item.category
    ).length;

    if (categoryEatenCount > 5) {
      reasoning.push(`${item.category} eaten ${categoryEatenCount}x this week`);
      return { score: 70, reasoning };
    }

    reasoning.push('🆕 New to your rotation');
    return { score: 100, reasoning };

  } catch (error) {
    console.warn('Error calculating variety score:', error);
    return { score: 50, reasoning: ['Could not check meal history'] };
  }
}

/**
 * Calculate availability score
 * Returns a score from 0 to 100
 */
function calculateAvailabilityScore(
  item: MenuItem,
  currentTime?: Date
): { score: number; reasoning: string[] } {
  const now = currentTime || new Date();
  const reasoning: string[] = [];

  // For now, if the item exists in the menu, it's available
  // In the future, we can check dining hall hours
  if (item.dining_hall) {
    reasoning.push(`Available at ${item.dining_hall.name}`);
    return { score: 100, reasoning };
  }

  return { score: 50, reasoning: ['Availability unknown'] };
}

/**
 * Main recommendation function
 * Returns ranked list of menu items with scores and reasoning
 */
export async function recommendMeals(
  userId: string,
  remaining: MacroTargets,
  preferences: UserPreferences,
  availableItems: MenuItem[],
  currentTime?: Date,
  limit: number = 10
): Promise<RecommendationScore[]> {
  const recommendations: RecommendationScore[] = [];

  // Score each item
  for (const item of availableItems) {
    // Calculate individual scores
    const macroResult = calculateMacroScore(item.nutrition, remaining);
    const preferenceResult = calculatePreferenceScore(item, preferences);
    
    // Skip items that violate dietary restrictions
    if (preferenceResult.score === 0) {
      continue;
    }

    const varietyResult = await calculateVarietyScore(item, userId);
    const availabilityResult = calculateAvailabilityScore(item, currentTime);

    // Calculate weighted total score
    // Weights: Macro 40%, Preference 30%, Variety 20%, Availability 10%
    const totalScore = 
      (macroResult.score * 0.40) +
      (preferenceResult.score * 0.30) +
      (varietyResult.score * 0.20) +
      (availabilityResult.score * 0.10);

    // Combine all reasoning
    const reasoning = [
      ...macroResult.reasoning,
      ...preferenceResult.reasoning,
      ...varietyResult.reasoning,
      ...availabilityResult.reasoning,
    ];

    recommendations.push({
      item,
      totalScore: Math.round(totalScore),
      macroScore: Math.round(macroResult.score),
      preferenceScore: Math.round(preferenceResult.score),
      varietyScore: Math.round(varietyResult.score),
      availabilityScore: Math.round(availabilityResult.score),
      reasoning,
    });
  }

  // Sort by total score (descending) and return top results
  return recommendations
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
}

/**
 * Helper to get user's remaining macros for today
 */
export async function getUserRemainingMacros(
  userId: string
): Promise<MacroTargets | null> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get user's targets
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('target_calories, target_protein_g, target_carbs_g, target_fat_g')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    const targets: MacroTargets = {
      calories: profile.target_calories || 2000,
      protein_g: profile.target_protein_g || 150,
      carbs_g: profile.target_carbs_g || 250,
      fat_g: profile.target_fat_g || 65,
    };

    // Get today's consumed macros
    const { data: mealLogs, error: logsError } = await supabase
      .from('meal_logs')
      .select(`
        servings,
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
      return targets; // Return full targets if can't get consumed
    }

    // Calculate consumed
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

    // Calculate remaining
    const remaining: MacroTargets = {
      calories: Math.max(0, targets.calories - consumed.calories),
      protein_g: Math.max(0, targets.protein_g - consumed.protein_g),
      carbs_g: Math.max(0, targets.carbs_g - consumed.carbs_g),
      fat_g: Math.max(0, targets.fat_g - consumed.fat_g),
    };

    return remaining;

  } catch (error) {
    console.error('Error getting remaining macros:', error);
    return null;
  }
}

/**
 * Helper to get user preferences
 */
export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data as UserPreferences;

  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

