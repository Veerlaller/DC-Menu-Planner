import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../constants/theme';

// Import screens (will create these next)
import TodayScreen from '../screens/main/TodayScreen';
import MenusScreen from '../screens/main/MenusScreen';
import HungryNowScreen from '../screens/main/HungryNowScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  Today: undefined;
  Menus: undefined;
  HungryNow: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple icon component (you can replace with react-native-vector-icons later)
const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const icons: { [key: string]: string } = {
    Today: '📊',
    Menus: '🍽️',
    HungryNow: '🔔',
    Profile: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Today" 
        component={TodayScreen}
      />
      <Tab.Screen 
        name="Menus" 
        component={MenusScreen}
      />
      <Tab.Screen 
        name="HungryNow" 
        component={HungryNowScreen}
        options={{ 
          tabBarLabel: "Hungry Now"
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});

