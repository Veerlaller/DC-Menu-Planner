import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { MacroProgressBar } from '../../components/MacroProgressBar';
import { MealCard } from '../../components/MealCard';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../constants/theme';
import { getDailySummary, useMockApi } from '../../api';
import { useNavigation } from '@react-navigation/native';

const TodayScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProfile, dailySummary, setDailySummary, setIsLoading, isLoading } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadDailySummary = async () => {
    try {
      setIsLoading(true);
      // Try real API first, fall back to mock if it fails
      try {
        const summary = await getDailySummary();
        setDailySummary(summary);
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        const summary = await useMockApi.getDailySummary();
        setDailySummary(summary);
      }
    } catch (error) {
      console.error('Failed to load daily summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDailySummary();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailySummary();
    setRefreshing(false);
  };

  if (!userProfile || !dailySummary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const caloriesPercentage =
    ((dailySummary.consumed_calories / dailySummary.target_calories) * 100).toFixed(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Date Header */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Calorie Summary Card */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <View>
              <Text style={styles.calorieLabel}>Daily Calories</Text>
              <Text style={styles.calorieValue}>
                {dailySummary.consumed_calories.toFixed(0)}
              </Text>
              <Text style={styles.calorieTarget}>
                of {dailySummary.target_calories} kcal
              </Text>
            </View>
            <View style={styles.circleProgress}>
              <View style={styles.circleProgressInner}>
                <Text style={styles.circlePercentage}>{caloriesPercentage}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.calorieBar}>
            <View
              style={[
                styles.calorieBarFill,
                {
                  width: `${Math.min(
                    (dailySummary.consumed_calories / dailySummary.target_calories) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.calorieRemaining}>
            {Math.max(
              dailySummary.target_calories - dailySummary.consumed_calories,
              0
            ).toFixed(0)}{' '}
            kcal remaining
          </Text>
        </View>

        {/* Macros Section */}
        <View style={styles.macrosSection}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>

          <View style={styles.macrosCard}>
            <MacroProgressBar
              label="Protein"
              consumed={dailySummary.consumed_protein}
              target={dailySummary.target_protein}
              unit="g"
              color={colors.protein}
            />
          </View>

          <View style={styles.macrosCard}>
            <MacroProgressBar
              label="Carbohydrates"
              consumed={dailySummary.consumed_carbs}
              target={dailySummary.target_carbs}
              unit="g"
              color={colors.carbs}
            />
          </View>

          <View style={styles.macrosCard}>
            <MacroProgressBar
              label="Fat"
              consumed={dailySummary.consumed_fat}
              target={dailySummary.target_fat}
              unit="g"
              color={colors.fat}
            />
          </View>
        </View>

        {/* Meals Logged */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meals Logged Today</Text>
            <Text style={styles.mealCount}>
              {dailySummary.meals_logged.length} {dailySummary.meals_logged.length === 1 ? 'meal' : 'meals'}
            </Text>
          </View>

          {dailySummary.meals_logged.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No meals logged yet</Text>
              <Text style={styles.emptyText}>
                Go to the Menus tab to start tracking your meals
              </Text>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {dailySummary.meals_logged.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onPress={() => {
                    // TODO: Navigate to meal detail screen
                    console.log('Meal pressed:', meal.id);
                  }}
                  onDelete={() => {
                    // TODO: Implement delete meal
                    console.log('Delete meal:', meal.id);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Log Meal Button */}
        <TouchableOpacity
          style={styles.logMealButton}
          onPress={() => {
            // @ts-ignore - Navigate to Menus tab
            navigation.navigate('Menus');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logMealIcon}>🍽️</Text>
          <Text style={styles.logMealText}>Log a Meal</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionText}>View Weekly Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionEmoji}>🎯</Text>
            <Text style={styles.actionText}>Update Goals</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  dateContainer: {
    paddingVertical: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  calorieCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  calorieValue: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.text,
  },
  calorieTarget: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  circleProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleProgressInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlePercentage: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  calorieBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  calorieBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  calorieRemaining: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  macrosSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  macrosCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  mealsSection: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mealsList: {
    gap: spacing.sm,
  },
  logMealButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    ...shadow.md,
  },
  logMealIcon: {
    fontSize: 28,
  },
  logMealText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
});

export default TodayScreen;

