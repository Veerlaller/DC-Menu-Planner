import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';

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
  const { hasCompletedOnboarding, loadPersistedData } = useStore();
  const { isAuthenticated, isLoading } = useAuth();

  // Load persisted data on app start
  useEffect(() => {
    loadPersistedData();
  }, []);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
  },
});

