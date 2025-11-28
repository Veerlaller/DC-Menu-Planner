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

// Check if user has completed onboarding and load their profile
export const checkUserProfile = async (): Promise<{
  hasProfile: boolean;
  profile?: UserProfile;
  preferences?: UserPreferences;
}> => {
  console.log('📡 API: Calling GET /api/onboarding...');
  
  try {
    const response = await apiClient.get<any>('/onboarding');
    
    console.log('📡 API: Response received:', {
      status: response.status,
      hasProfile: !!response.data.profile,
      hasPreferences: !!response.data.preferences,
    });
    
    // If we get a successful response with profile data, user has completed onboarding
    const hasCompleted = !!(response.data.profile && response.data.preferences);
    console.log('📡 API: User has completed onboarding:', hasCompleted);
    
    if (hasCompleted) {
      console.log('📡 API: Profile data:', {
        target_calories: response.data.profile.target_calories,
        target_protein_g: response.data.profile.target_protein_g,
        target_carbs_g: response.data.profile.target_carbs_g,
        target_fat_g: response.data.profile.target_fat_g,
      });
      
      return {
        hasProfile: true,
        profile: response.data.profile,
        preferences: response.data.preferences,
      };
    }
    
    return { hasProfile: false };
  } catch (error: any) {
    console.log('📡 API: Error response:', {
      status: error.response?.status,
      message: error.message,
    });
    
    // 404 means user hasn't completed onboarding
    if (error.response?.status === 404) {
      console.log('📡 API: 404 - User has not completed onboarding');
      return { hasProfile: false };
    }
    
    // For other errors, assume not completed to be safe
    console.error('📡 API: Unexpected error checking profile:', error.message);
    return { hasProfile: false };
  }
};

// ============================================
// DAILY SUMMARY & MEAL LOGGING
// ============================================

export const getDailySummary = async (date?: string): Promise<DailySummary> => {
  const dateParam = date || new Date().toISOString().split('T')[0];
  
  // Get both today's data and meal logs
  const [todayResponse, mealsResponse] = await Promise.all([
    apiClient.get<any>('/today'),
    apiClient.get<any>('/meals/today')
  ]);
  
  // Transform meal logs to match our type
  const meals_logged = (mealsResponse.data.meal_logs || []).map((log: any) => ({
    id: log.id,
    user_id: log.user_id,
    menu_item_id: log.menu_item_id,
    logged_at: log.logged_at,
    eaten_at: log.eaten_at,
    servings: log.servings,
    notes: log.notes,
    menu_item: {
      id: log.menu_items?.id,
      menu_day_id: '',
      name: log.menu_items?.name || 'Unknown',
      description: log.menu_items?.description,
      category: log.menu_items?.category,
      station: '',
      is_vegetarian: log.menu_items?.is_vegetarian || false,
      is_vegan: log.menu_items?.is_vegan || false,
      contains_gluten: false,
      contains_dairy: false,
      contains_nuts: false,
      allergen_info: [],
      nutrition: log.menu_items?.nutrition_facts ? {
        id: '',
        menu_item_id: log.menu_items?.id,
        calories: log.menu_items?.nutrition_facts.calories,
        protein_g: log.menu_items?.nutrition_facts.protein_g,
        carbs_g: log.menu_items?.nutrition_facts.carbs_g,
        fat_g: log.menu_items?.nutrition_facts.fat_g,
        serving_size: log.menu_items?.nutrition_facts.serving_size,
      } : undefined,
    },
  }));
  
  // Transform backend response to match our DailySummary type
  return {
    date: todayResponse.data.date,
    consumed_calories: todayResponse.data.consumed.calories,
    consumed_protein: todayResponse.data.consumed.protein_g,
    consumed_carbs: todayResponse.data.consumed.carbs_g,
    consumed_fat: todayResponse.data.consumed.fat_g,
    target_calories: todayResponse.data.targets.calories,
    target_protein: todayResponse.data.targets.protein_g,
    target_carbs: todayResponse.data.targets.carbs_g,
    target_fat: todayResponse.data.targets.fat_g,
    meals_logged,
  };
};

export const logMeal = async (
  mealData: Partial<MealLog>
): Promise<MealLog> => {
  const response = await apiClient.post<any>(
    '/meals/log',
    mealData
  );
  // Server returns { success: true, meal_log: ... }
  if (response.data.success && response.data.meal_log) {
    return response.data.meal_log;
  }
  throw new Error(response.data.error || 'Failed to log meal');
};

export const getMealLogs = async (date?: string): Promise<MealLog[]> => {
  const params = date ? { date } : {};
  const response = await apiClient.get<ApiResponse<MealLog[]>>(
    '/meals/logs',
    { params }
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to fetch meal logs');
};

export const deleteMealLog = async (mealLogId: string): Promise<void> => {
  const response = await apiClient.delete<any>(
    `/meals/log/${mealLogId}`
  );
  // Server returns { success: true, message: ... }
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete meal log');
  }
};

// ============================================
// MENUS & DINING HALLS
// ============================================

export const getAvailableMenus = async (date?: string): Promise<MenuItemWithNutrition[]> => {
  // If no date provided, try today first, then find most recent available date
  if (!date) {
    const today = new Date().toISOString().split('T')[0];
    
    // Try today
    const todayResponse = await apiClient.get<ApiResponse<MenuItemWithNutrition[]>>(
      '/menus/available',
      { params: { date: today } }
    );
    
    // If today has menus, return them
    if (todayResponse.data.success && todayResponse.data.data && todayResponse.data.data.length > 0) {
      return todayResponse.data.data;
    }
    
    // Otherwise, try the next 7 days to find available menus
    console.log(`📅 No menu for ${today}, searching next 7 days...`);
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      try {
        const response = await apiClient.get<ApiResponse<MenuItemWithNutrition[]>>(
          '/menus/available',
          { params: { date: dateStr } }
        );
        
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          console.log(`📅 Found menu data for ${dateStr} (${response.data.data.length} items)`);
          return response.data.data;
        }
      } catch (error) {
        console.log(`   Day +${i} (${dateStr}): No data`);
      }
    }
    
    // If still no data found, return empty array
    console.log('⚠️ No menus found for the next 7 days');
    return [];
  }
  
  // If date is provided, use it directly
  const response = await apiClient.get<ApiResponse<MenuItemWithNutrition[]>>(
    '/menus/available',
    { params: { date } }
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
// HUNGRY NOW & RECOMMENDATIONS
// ============================================

export const getHungryNowRecommendations = async (): Promise<HungryNowRecommendation> => {
  const response = await apiClient.get<ApiResponse<HungryNowRecommendation>>(
    '/recommendations/now'
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'Failed to get recommendations');
};

export const getRecommendationsByMeal = async (
  mealType: string,
  date?: string
): Promise<MenuItemWithNutrition[]> => {
  const params = date ? { date } : {};
  const response = await apiClient.get<ApiResponse<MenuItemWithNutrition[]>>(
    `/recommendations/${mealType}`,
    { params }
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
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
      meals_logged: [
        {
          id: 'meal-1',
          user_id: 'user-1',
          menu_item_id: 'item-1',
          logged_at: new Date(Date.now() - 3600000).toISOString(),
          servings: 1,
          menu_item: {
            id: 'item-1',
            menu_day_id: 'menu-1',
            name: 'Scrambled Eggs',
            station: 'Breakfast Bar',
            is_vegetarian: true,
            is_vegan: false,
            contains_gluten: false,
            contains_dairy: true,
            contains_nuts: false,
            allergen_info: ['eggs', 'dairy'],
            nutrition: {
              id: 'n1',
              menu_item_id: 'item-1',
              calories: 200,
              protein_g: 13,
              carbs_g: 3,
              fat_g: 15,
            },
          },
        },
      ],
    };
  },

  getAvailableMenus: async (): Promise<MenuItemWithNutrition[]> => {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const today = new Date().toISOString().split('T')[0];
    
    return [
      {
        id: '1',
        menu_day_id: 'menu-1',
        name: 'Grilled Chicken Breast',
        category: 'entree',
        station: 'Grill',
        meal_type: 'lunch',
        date: today,
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
          serving_size: '4 oz',
        },
        dining_hall: {
          id: 'hall-1',
          name: 'Latitude 38',
          short_name: 'Latitude',
          is_active: true,
        },
      },
      {
        id: '2',
        menu_day_id: 'menu-1',
        name: 'Quinoa Buddha Bowl',
        category: 'entree',
        station: 'Plant Forward',
        meal_type: 'lunch',
        date: today,
        is_vegetarian: true,
        is_vegan: true,
        contains_gluten: false,
        contains_dairy: false,
        contains_nuts: false,
        allergen_info: [],
        nutrition: {
          id: 'n2',
          menu_item_id: '2',
          calories: 420,
          protein_g: 18,
          carbs_g: 65,
          fat_g: 12,
          serving_size: '1 bowl',
        },
        dining_hall: {
          id: 'hall-1',
          name: 'Latitude 38',
          short_name: 'Latitude',
          is_active: true,
        },
      },
      {
        id: '3',
        menu_day_id: 'menu-2',
        name: 'Salmon Fillet',
        category: 'entree',
        station: 'Seafood',
        meal_type: 'dinner',
        date: today,
        is_vegetarian: false,
        is_vegan: false,
        contains_gluten: false,
        contains_dairy: false,
        contains_nuts: false,
        allergen_info: ['fish'],
        nutrition: {
          id: 'n3',
          menu_item_id: '3',
          calories: 280,
          protein_g: 40,
          carbs_g: 0,
          fat_g: 13,
          serving_size: '6 oz',
        },
        dining_hall: {
          id: 'hall-2',
          name: 'Segundo Dining Commons',
          short_name: 'Segundo',
          is_active: true,
        },
      },
      {
        id: '4',
        menu_day_id: 'menu-1',
        name: 'Mediterranean Salad',
        category: 'salad',
        station: 'Salad Bar',
        meal_type: 'lunch',
        date: today,
        is_vegetarian: true,
        is_vegan: true,
        contains_gluten: false,
        contains_dairy: false,
        contains_nuts: false,
        allergen_info: [],
        nutrition: {
          id: 'n4',
          menu_item_id: '4',
          calories: 180,
          protein_g: 8,
          carbs_g: 25,
          fat_g: 7,
          serving_size: '1 bowl',
        },
        dining_hall: {
          id: 'hall-1',
          name: 'Latitude 38',
          short_name: 'Latitude',
          is_active: true,
        },
      },
      {
        id: '5',
        menu_day_id: 'menu-2',
        name: 'Turkey Burger',
        category: 'entree',
        station: 'Grill',
        meal_type: 'dinner',
        date: today,
        is_vegetarian: false,
        is_vegan: false,
        contains_gluten: true,
        contains_dairy: false,
        contains_nuts: false,
        allergen_info: ['wheat'],
        nutrition: {
          id: 'n5',
          menu_item_id: '5',
          calories: 320,
          protein_g: 28,
          carbs_g: 35,
          fat_g: 8,
          serving_size: '1 burger',
        },
        dining_hall: {
          id: 'hall-2',
          name: 'Segundo Dining Commons',
          short_name: 'Segundo',
          is_active: true,
        },
      },
    ];
  },
};

