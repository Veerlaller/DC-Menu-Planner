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

// Error Response
export interface ErrorResponse {
  error: string;
  details?: string;
}

