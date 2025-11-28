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
  Modal,
  Alert,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { MacroProgressBar } from '../../components/MacroProgressBar';
import { MealCard } from '../../components/MealCard';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../constants/theme';
import { getDailySummary, deleteMealLog, useMockApi } from '../../api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProfile, dailySummary, setDailySummary, setIsLoading, isLoading, setUserProfile } = useStore();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [goalsForm, setGoalsForm] = useState({
    goal: userProfile?.goal || 'maintain',
    activity_level: userProfile?.activity_level || 'moderate',
  });

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

  // Load on initial mount
  useEffect(() => {
    loadDailySummary();
  }, []);

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Home screen focused - refreshing data...');
      loadDailySummary();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailySummary();
    setRefreshing(false);
  };

  const handleDeleteMeal = async (mealLogId: string) => {
    try {
      console.log('🗑️ Deleting meal log:', mealLogId);
      await deleteMealLog(mealLogId);
      console.log('✅ Meal deleted successfully!');
      
      // Refresh the daily summary
      await loadDailySummary();
    } catch (error) {
      console.error('❌ Failed to delete meal:', error);
      alert('Failed to delete meal. Please try again.');
    }
  };

  const handleUpdateGoals = () => {
    if (userProfile) {
      setGoalsForm({
        goal: userProfile.goal,
        activity_level: userProfile.activity_level,
      });
      setShowGoalsModal(true);
    }
  };

  const handleSaveGoals = async () => {
    if (!user || !userProfile) return;

    try {
      setIsUpdating(true);

      // Update goals in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          goal: goalsForm.goal,
          activity_level: goalsForm.activity_level,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setUserProfile({
        ...userProfile,
        goal: goalsForm.goal as 'cut' | 'bulk' | 'maintain',
        activity_level: goalsForm.activity_level as 'sedentary' | 'lightly_active' | 'moderate' | 'very_active' | 'extremely_active',
      });

      setShowGoalsModal(false);
      Alert.alert('Success', 'Goals updated successfully! Your macro targets will be recalculated.');
      
      // Refresh daily summary to get updated targets
      await loadDailySummary();
    } catch (error: any) {
      console.error('Failed to update goals:', error);
      Alert.alert('Error', 'Failed to update goals. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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

        {/* I'm Hungry Button */}
        <TouchableOpacity
          style={styles.logMealButton}
          onPress={() => {
            // @ts-ignore - Navigate to Hungry Now screen
            navigation.navigate('HungryNow');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logMealIcon}>🍽️</Text>
          <Text style={styles.logMealText}>I'm Hungry</Text>
        </TouchableOpacity>

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
            <View style={styles.macroDivider} />
            <MacroProgressBar
              label="Carbohydrates"
              consumed={dailySummary.consumed_carbs}
              target={dailySummary.target_carbs}
              unit="g"
              color={colors.carbs}
            />
            <View style={styles.macroDivider} />
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
            <Text style={styles.sectionTitle}>Today's Meals</Text>
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
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Separator */}
        <View style={styles.sectionDivider} />

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={() => {
              // @ts-ignore - Navigate to WeeklyStats
              navigation.navigate('WeeklyStats');
            }}
          >
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionText}>View Weekly Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={handleUpdateGoals}
          >
            <Text style={styles.actionEmoji}>🎯</Text>
            <Text style={styles.actionText}>Update Goals</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Update Goals Modal */}
      <Modal
        visible={showGoalsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Goals</Text>
              <TouchableOpacity 
                onPress={() => setShowGoalsModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalBody}>
                <Text style={styles.sectionLabel}>Fitness Goal</Text>
                <Text style={styles.sectionHint}>Choose your primary fitness objective</Text>
                
                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.goal === 'cut' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, goal: 'cut' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>📉</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Cut (Lose Weight)</Text>
                      <Text style={styles.optionDescription}>
                        Lose fat while preserving muscle mass
                      </Text>
                    </View>
                    {goalsForm.goal === 'cut' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.goal === 'bulk' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, goal: 'bulk' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>💪</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Bulk (Gain Muscle)</Text>
                      <Text style={styles.optionDescription}>
                        Build muscle and gain strength
                      </Text>
                    </View>
                    {goalsForm.goal === 'bulk' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.goal === 'maintain' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, goal: 'maintain' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>⚖️</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Maintain</Text>
                      <Text style={styles.optionDescription}>
                        Maintain current physique and performance
                      </Text>
                    </View>
                    {goalsForm.goal === 'maintain' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Activity Level</Text>
                <Text style={styles.sectionHint}>How active are you during the week?</Text>
                
                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.activity_level === 'sedentary' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, activity_level: 'sedentary' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>🛋️</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Sedentary</Text>
                      <Text style={styles.optionDescription}>
                        Little to no exercise
                      </Text>
                    </View>
                    {goalsForm.activity_level === 'sedentary' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.activity_level === 'lightly_active' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, activity_level: 'lightly_active' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>🚶</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Lightly Active</Text>
                      <Text style={styles.optionDescription}>
                        Light exercise 1-3 days/week
                      </Text>
                    </View>
                    {goalsForm.activity_level === 'lightly_active' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.activity_level === 'moderate' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, activity_level: 'moderate' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>🏃</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Moderately Active</Text>
                      <Text style={styles.optionDescription}>
                        Moderate exercise 3-5 days/week
                      </Text>
                    </View>
                    {goalsForm.activity_level === 'moderate' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.activity_level === 'very_active' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, activity_level: 'very_active' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>🏋️</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Very Active</Text>
                      <Text style={styles.optionDescription}>
                        Hard exercise 6-7 days/week
                      </Text>
                    </View>
                    {goalsForm.activity_level === 'very_active' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.optionCard,
                    goalsForm.activity_level === 'extremely_active' && styles.optionCardSelected
                  ]}
                  onPress={() => setGoalsForm({ ...goalsForm, activity_level: 'extremely_active' })}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>🏆</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Extremely Active</Text>
                      <Text style={styles.optionDescription}>
                        Very hard exercise & physical job
                      </Text>
                    </View>
                    {goalsForm.activity_level === 'extremely_active' && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowGoalsModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveGoals}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dateContainer: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  calorieCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.sm,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  calorieValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
  },
  calorieTarget: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  circleProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleProgressInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  macrosCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadow.sm,
  },
  macroDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
  mealsSection: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mealsList: {
    gap: spacing.sm,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
  logMealButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.sm,
  },
  logMealIcon: {
    fontSize: 24,
  },
  logMealText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadow.sm,
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    ...shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalScrollView: {
    maxHeight: 500,
  },
  modalBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  sectionHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  optionCardSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionTextContainer: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  optionTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  optionDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  optionCheckmark: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: colors.gray100,
    borderWidth: 1.5,
    borderColor: colors.gray300,
  },
  modalButtonSecondaryText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonPrimaryText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.white,
  },
});

export default HomeScreen;

