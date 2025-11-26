import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProfile, 
  UserPreferences, 
  DailySummary, 
  MenuItemWithNutrition,
  OnboardingData 
} from '../types';

interface AppState {
  // User data
  userProfile: UserProfile | null;
  userPreferences: UserPreferences | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  
  // Daily data
  dailySummary: DailySummary | null;
  availableMenus: MenuItemWithNutrition[];
  
  // Onboarding
  onboardingData: OnboardingData;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserProfile: (profile: UserProfile | null) => void;
  setUserPreferences: (preferences: UserPreferences | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setDailySummary: (summary: DailySummary | null) => void;
  setAvailableMenus: (menus: MenuItemWithNutrition[]) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  clearOnboardingData: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  
  // Persist actions
  loadPersistedData: () => Promise<void>;
  persistUserData: () => Promise<void>;
}

const initialState = {
  userProfile: null,
  userPreferences: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  dailySummary: null,
  availableMenus: [],
  onboardingData: {},
  isLoading: false,
  error: null,
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setUserProfile: (profile) => {
    set({ userProfile: profile });
    get().persistUserData();
  },

  setUserPreferences: (preferences) => {
    set({ userPreferences: preferences });
    get().persistUserData();
  },

  setIsAuthenticated: (isAuth) => {
    set({ isAuthenticated: isAuth });
    get().persistUserData();
  },

  setHasCompletedOnboarding: (completed) => {
    set({ hasCompletedOnboarding: completed });
    get().persistUserData();
  },

  setDailySummary: (summary) => set({ dailySummary: summary }),

  setAvailableMenus: (menus) => set({ availableMenus: menus }),

  setOnboardingData: (data) => {
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    }));
  },

  clearOnboardingData: () => set({ onboardingData: {} }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => {
    set(initialState);
    AsyncStorage.multiRemove(['userProfile', 'userPreferences', 'isAuthenticated', 'hasCompletedOnboarding']);
  },

  // Persist to AsyncStorage
  persistUserData: async () => {
    const state = get();
    try {
      await AsyncStorage.multiSet([
        ['userProfile', JSON.stringify(state.userProfile)],
        ['userPreferences', JSON.stringify(state.userPreferences)],
        ['isAuthenticated', JSON.stringify(state.isAuthenticated)],
        ['hasCompletedOnboarding', JSON.stringify(state.hasCompletedOnboarding)],
      ]);
    } catch (error) {
      console.error('Failed to persist user data:', error);
    }
  },

  // Load from AsyncStorage
  loadPersistedData: async () => {
    try {
      const keys = ['userProfile', 'userPreferences', 'isAuthenticated', 'hasCompletedOnboarding'];
      const values = await AsyncStorage.multiGet(keys);
      
      const data: any = {};
      values.forEach(([key, value]) => {
        if (value) {
          data[key] = JSON.parse(value);
        }
      });

      set({
        userProfile: data.userProfile || null,
        userPreferences: data.userPreferences || null,
        isAuthenticated: data.isAuthenticated || false,
        hasCompletedOnboarding: data.hasCompletedOnboarding || false,
      });
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  },
}));

