import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (will create these next)
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import BasicInfoScreen from '../screens/onboarding/BasicInfoScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import PreferencesScreen from '../screens/onboarding/PreferencesScreen';
import CompleteScreen from '../screens/onboarding/CompleteScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  BasicInfo: undefined;
  Goals: undefined;
  Preferences: undefined;
  Complete: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BasicInfo"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Complete" component={CompleteScreen} />
    </Stack.Navigator>
  );
};

