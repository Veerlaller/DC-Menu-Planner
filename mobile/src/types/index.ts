// User Types
export interface UserProfile {
  id: string;
  user_id: string;
  height_inches: number; // Height in inches (e.g., 70 = 5'10")
  weight_lbs: number; // Weight in pounds
  age: number;
  sex: 'male' | 'female' | 'other';
  goal: 'cut' | 'bulk' | 'maintain';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
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

// Dining Hall Types
export interface DiningHall {
  id: string;
  name: string;
  short_name: string;
  location?: string;
  is_active: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'brunch' | 'late_night';

export interface MenuDay {
  id: string;
  dining_hall_id: string;
  date: string;
  meal_type: MealType;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
}

// Menu Item Types
export interface MenuItem {
  id: string;
  menu_day_id: string;
  name: string;
  description?: string;
  category?: string;
  station?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  contains_gluten: boolean;
  contains_dairy: boolean;
  contains_nuts: boolean;
  allergen_info: string[];
}

export interface NutritionFacts {
  id: string;
  menu_item_id: string;
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

export interface MenuItemWithNutrition extends MenuItem {
  nutrition?: NutritionFacts;
  dining_hall?: DiningHall;
}

// Meal Log Types
export interface MealLog {
  id: string;
  user_id: string;
  menu_item_id: string;
  logged_at: string;
  eaten_at?: string;
  servings: number;
  notes?: string;
}

export interface MealLogWithItem extends MealLog {
  menu_item: MenuItemWithNutrition;
}

// Daily Summary Types
export interface DailySummary {
  date: string;
  consumed_calories: number;
  consumed_protein: number;
  consumed_carbs: number;
  consumed_fat: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  meals_logged: MealLogWithItem[];
}

// Onboarding Types
export interface OnboardingData {
  // Step 1: Basic Info
  height_inches?: number; // Height in inches (e.g., 70 = 5'10")
  weight_lbs?: number; // Weight in pounds
  age?: number;
  sex?: 'male' | 'female' | 'other';
  
  // Step 2: Goals
  goal?: 'cut' | 'bulk' | 'maintain';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  
  // Step 3: Preferences
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_pescatarian?: boolean;
  is_gluten_free?: boolean;
  is_dairy_free?: boolean;
  allergies?: string[];
  dislikes?: string[];
  preferences?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Hungry Now Types
export interface HungryNowRecommendation {
  dining_hall: DiningHall;
  meal_type: MealType;
  recommended_items: MenuItemWithNutrition[];
  reason: string;
}

