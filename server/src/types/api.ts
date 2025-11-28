/**
 * API Request and Response Types
 */

// Onboarding Types
export interface OnboardingRequest {
  // Profile fields (imperial units)
  height_inches: number;
  weight_lbs: number;
  age: number;
  sex: 'male' | 'female' | 'other';
  goal: 'cut' | 'bulk' | 'maintain';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  
  // Optional macro targets
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
  
  // Dietary preferences
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_pescatarian?: boolean;
  is_gluten_free?: boolean;
  is_dairy_free?: boolean;
  allergies?: string[];
  dislikes?: string[];
  preferences?: string[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  height_inches: number;
  weight_lbs: number;
  age: number;
  sex: string;
  goal: string;
  activity_level: string;
  target_calories: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_pescatarian: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  allergies: string[];
  dislikes: string[];
  preferences: string[];
  created_at: string;
  updated_at: string;
}

export interface OnboardingResponse {
  profile: UserProfile;
  preferences: UserPreferences;
}

// Today's Tracking Types
export interface MacroTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface TodayResponse {
  date: string;
  targets: MacroTargets;
  consumed: MacroTargets;
  remaining: MacroTargets;
}

// Menu Types
export interface DiningHall {
  id: string;
  name: string;
  short_name: string;
  location?: string;
  is_active?: boolean;
}

export interface NutritionFacts {
  id?: string;
  menu_item_id?: string;
  serving_size?: string;
  serving_size_g?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  saturated_fat_g?: number;
  trans_fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  cholesterol_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
}

export interface MenuItem {
  id: string;
  menu_day_id?: string;
  name: string;
  description?: string;
  category?: 'entree' | 'side' | 'salad' | 'soup' | 'dessert' | 'beverage' | 'condiment' | 'other';
  station?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  contains_gluten: boolean;
  contains_dairy: boolean;
  contains_nuts: boolean;
  allergen_info: string[];
  meal_type?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  dining_hall?: DiningHall | null;
  nutrition?: NutritionFacts | null;
}

export interface MenuDay {
  id: string;
  dining_hall_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'brunch' | 'late_night';
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  dining_hall?: DiningHall;
  items?: MenuItem[];
}

// Menu Response Types
export interface MenusResponse {
  success: boolean;
  date?: string;
  filters?: {
    hall?: string | null;
    meal_type?: string | null;
  };
  data: MenuItem[];
}

export interface MenuItemResponse {
  success: boolean;
  data: MenuItem;
}

export interface DiningHallsResponse {
  success: boolean;
  data: DiningHall[];
}

// Meal Logging Types
export interface MealLog {
  id: string;
  user_id: string;
  menu_item_id: string;
  logged_at: string;
  eaten_at: string | null;
  servings: number;
  notes: string | null;
  created_at: string;
  menu_items?: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    is_vegetarian: boolean;
    is_vegan: boolean;
    nutrition_facts: {
      calories: number | null;
      protein_g: number | null;
      carbs_g: number | null;
      fat_g: number | null;
      serving_size: string | null;
    } | null;
  };
}

export interface LogMealRequest {
  menu_item_id: string;
  servings?: number;
  eaten_at?: string;
  notes?: string;
}

export interface LogMealResponse {
  success: boolean;
  meal_log: MealLog;
}

export interface MealLogsResponse {
  meal_logs: MealLog[];
  count: number;
}

export interface TodayMealsResponse {
  date: string;
  meal_logs: MealLog[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  count: number;
}

// Error Response
export interface ErrorResponse {
  error: string;
  details?: string;
}

