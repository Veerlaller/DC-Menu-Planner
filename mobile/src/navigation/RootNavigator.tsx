import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import { colors, fontSize, spacing } from '../constants/theme';
import { checkUserProfile } from '../api';

// Import navigators and screens
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import LoginScreen from '../screens/auth/LoginScreen';

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { hasCompletedOnboarding, loadPersistedData, setHasCompletedOnboarding, setUserProfile, setUserPreferences } = useStore();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const hasCheckedProfile = useRef(false);

  // Load persisted data on app start - but DON'T load hasCompletedOnboarding
  // since we need to check that fresh from the API
  useEffect(() => {
    console.log('📂 Loading persisted data...');
    // Note: We intentionally don't load hasCompletedOnboarding from storage
    // since we want to check it fresh from the API after authentication
    loadPersistedData();
  }, []);

  // Reset onboarding state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🔓 User not authenticated, resetting onboarding state');
      hasCheckedProfile.current = false;
      setHasCompletedOnboarding(false);
    }
  }, [isAuthenticated]);

  // Check for user profile when authentication changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', {
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email,
      hasCompletedOnboarding,
      hasCheckedProfile: hasCheckedProfile.current,
      isCheckingProfile,
    });

    const checkProfile = async () => {
      // Only check if:
      // 1. User is authenticated
      // 2. We have a user object
      // 3. We haven't checked yet for this session
      // 4. We're not currently checking
      if (isAuthenticated && user && !hasCheckedProfile.current && !isCheckingProfile) {
        hasCheckedProfile.current = true;
        setIsCheckingProfile(true);
        
        console.log('🔍 Checking if user has completed onboarding...');
        console.log('   User ID:', user.id);
        console.log('   User Email:', user.email);
        
        try {
          const result = await checkUserProfile();
          
          console.log('📊 Profile check result:', result.hasProfile);
          
          if (result.hasProfile && result.profile && result.preferences) {
            console.log('✅ User has completed onboarding - loading profile data');
            console.log('   Profile data:', {
              target_calories: result.profile.target_calories,
              target_protein_g: result.profile.target_protein_g,
            });
            
            // Load profile and preferences into store
            setUserProfile(result.profile);
            setUserPreferences(result.preferences);
            setHasCompletedOnboarding(true);
            console.log('✅ Profile data loaded into store - going to Main App');
          } else {
            console.log('📝 User needs to complete onboarding - showing Onboarding Flow');
            setHasCompletedOnboarding(false);
          }
        } catch (error) {
          console.error('❌ Error checking profile:', error);
          // Default to not completed if there's an error
          console.log('⚠️ Defaulting to show onboarding due to error');
          setHasCompletedOnboarding(false);
        } finally {
          setIsCheckingProfile(false);
          console.log('✓ Profile check complete');
        }
      }
    };

    checkProfile();
  }, [isAuthenticated, user?.id]);

  // Debug logging for navigation decision
  useEffect(() => {
    console.log('🧭 Navigation decision:', {
      isLoading,
      isAuthenticated,
      isCheckingProfile,
      hasCompletedOnboarding,
      decision: isLoading ? 'Loading' :
                isCheckingProfile ? 'Checking' :
                !isAuthenticated ? 'Login' :
                !hasCompletedOnboarding ? 'Onboarding' :
                'Main App'
    });
  }, [isLoading, isAuthenticated, isCheckingProfile, hasCompletedOnboarding]);

  // Show loading while checking auth or profile
  if (isLoading || (isAuthenticated && isCheckingProfile)) {
    console.log('⏳ Showing loading screen:', isLoading ? 'Auth loading' : 'Checking profile');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {isLoading ? 'Loading...' : 'Checking profile...'}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Not logged in - show login
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !hasCompletedOnboarding ? (
          // Logged in but no profile - show onboarding
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Logged in and has profile - show main app
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
});

