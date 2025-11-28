import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../constants/theme';

// Import screens
import TodayScreen from '../screens/main/TodayScreen';
import MenusScreen from '../screens/main/MenusScreen';
import HungryNowScreen from '../screens/main/HungryNowScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import WeeklyStatsScreen from '../screens/main/WeeklyStatsScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  Menus: undefined;
  HungryNow: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  WeeklyStats: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

// Stack navigator for Home tab
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={TodayScreen} />
      <HomeStack.Screen name="WeeklyStats" component={WeeklyStatsScreen} />
    </HomeStack.Navigator>
  );
};

// Simple icon component (you can replace with react-native-vector-icons later)
const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const icons: { [key: string]: string } = {
    HomeTab: '🏠',
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
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
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

