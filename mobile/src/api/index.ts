import { apiClient } from './client';
import {
  UserProfile,
  UserPreferences,
  DailySummary,
  MenuItemWithNutrition,
  MealLog,
  HungryNowRecommendation,
  OnboardingData,
  ApiResponse,
} from '../types';

// ============================================
// ONBOARDING & USER PROFILE
// ============================================

export const createUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await apiClient.post<ApiResponse<UserProfile>>('/users/profile', data);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to create profile');
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> => {
  const response = await apiClient.put<ApiResponse<UserProfile>>(
    `/users/${userId}/profile`,
    data
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to update profile');
};

export const createUserPreferences = async (
  data: Partial<UserPreferences>
): Promise<UserPreferences> => {
  const response = await apiClient.post<ApiResponse<UserPreferences>>(
    '/users/preferences',
    data
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to create preferences');
};

export const updateUserPreferences = async (
  userId: string,
  data: Partial<UserPreferences>
): Promise<UserPreferences> => {
  const response = await apiClient.put<ApiResponse<UserPreferences>>(
    `/users/${userId}/preferences`,
    data
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to update preferences');
};

export const completeOnboarding = async (
  data: OnboardingData
): Promise<{ profile: UserProfile; preferences: UserPreferences }> => {
  const response = await apiClient.post<any>('/onboarding', data);
  if (response.data.success) {
    return {
      profile: response.data.profile,
      preferences: response.data.preferences,
    };
  }
  throw new Error(response.data.error || 'Failed to complete onboarding');
};

// ============================================
// DAILY SUMMARY & MEAL LOGGING
// ============================================

export const getDailySummary = async (date?: string): Promise<DailySummary> => {
  const dateParam = date || new Date().toISOString().split('T')[0];
  const response = await apiClient.get<any>('/today');
  
  // Transform backend response to match our DailySummary type
  return {
    date: response.data.date,
    consumed_calories: response.data.consumed.calories,
    consumed_protein: response.data.consumed.protein_g,
    consumed_carbs: response.data.consumed.carbs_g,
    consumed_fat: response.data.consumed.fat_g,
    target_calories: response.data.targets.calories,
    target_protein: response.data.targets.protein_g,
    target_carbs: response.data.targets.carbs_g,
    target_fat: response.data.targets.fat_g,
    meals_logged: [], // TODO: Add meal logs endpoint
  };
};

export const logMeal = async (
  userId: string,
  mealData: Partial<MealLog>
): Promise<MealLog> => {
  const response = await apiClient.post<ApiResponse<MealLog>>(
    `/users/${userId}/meal-logs`,
    mealData
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to log meal');
};

export const deleteMealLog = async (userId: string, mealLogId: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/users/${userId}/meal-logs/${mealLogId}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete meal log');
  }
};

// ============================================
// MENUS & DINING HALLS
// ============================================

export const getAvailableMenus = async (date?: string): Promise<MenuItemWithNutrition[]> => {
  const dateParam = date || new Date().toISOString().split('T')[0];
  const response = await apiClient.get<ApiResponse<MenuItemWithNutrition[]>>(
    '/menus/available',
    { params: { date: dateParam } }
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to fetch menus');
};

export const getMenuByHallAndMeal = async (
  hall: string,
  mealType: string,
  date?: string
): Promise<MenuItemWithNutrition[]> => {
  const dateParam = date || new Date().toISOString().split('T')[0];
  const response = await apiClient.get<ApiResponse<MenuItemWithNutrition[]>>(
    `/menus/${hall}/${mealType}`,
    { params: { date: dateParam } }
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to fetch menu');
};

// ============================================
// HUNGRY NOW
// ============================================

export const getHungryNowRecommendations = async (
  userId: string
): Promise<HungryNowRecommendation> => {
  const response = await apiClient.get<ApiResponse<HungryNowRecommendation>>(
    `/users/${userId}/hungry-now`
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to get recommendations');
};

// ============================================
// MOCK API (for development without backend)
// ============================================

export const useMockApi = {
  getDailySummary: async (): Promise<DailySummary> => {
    return {
      date: new Date().toISOString().split('T')[0],
      consumed_calories: 1200,
      consumed_protein: 60,
      consumed_carbs: 150,
      consumed_fat: 40,
      target_calories: 2200,
      target_protein: 150,
      target_carbs: 250,
      target_fat: 70,
      meals_logged: [],
    };
  },

  getAvailableMenus: async (): Promise<MenuItemWithNutrition[]> => {
    return [
      {
        id: '1',
        menu_day_id: 'menu-1',
        name: 'Grilled Chicken Breast',
        category: 'entree',
        station: 'Grill',
        is_vegetarian: false,
        is_vegan: false,
        contains_gluten: false,
        contains_dairy: false,
        contains_nuts: false,
        allergen_info: [],
        nutrition: {
          id: 'n1',
          menu_item_id: '1',
          calories: 165,
          protein_g: 31,
          carbs_g: 0,
          fat_g: 3.6,
        },
      },
    ];
  },
};

