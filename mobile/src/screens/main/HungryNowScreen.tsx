import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { MenuItemWithNutrition, DiningHall, MealType } from '../../types';
import { RecommendationCard } from '../../components/RecommendationCard';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../constants/theme';
import { getAvailableMenus, logMeal } from '../../api';
import { useAuth } from '../../hooks/useAuth';

interface RecommendationData {
  hall: DiningHall | null;
  mealType: MealType | null;
  items: MenuItemWithNutrition[];
  reason: string;
  hours?: string;
}

const HungryNowScreen: React.FC = () => {
  const { userProfile, userPreferences } = useStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching available menus...');
      
      // Get today's menu items from the API
      const menuItems = await getAvailableMenus();
      
      console.log('📋 Received menu items:', menuItems.length);
      
      if (!menuItems || menuItems.length === 0) {
        setError('No menu items available today. The dining hall menus may not be loaded yet.');
        setRecommendation(null);
        return;
      }
      
      // Determine current time and meal period
      const now = new Date();
      const currentHour = now.getHours();
      let currentMealType: MealType;
      
      if (currentHour < 10) {
        currentMealType = 'breakfast';
      } else if (currentHour < 15) {
        currentMealType = 'lunch';
      } else if (currentHour < 20) {
        currentMealType = 'dinner';
      } else {
        currentMealType = 'late_night';
      }
      
      // Filter for current meal period
      let currentMealItems = menuItems.filter(
        (item) => item.meal_type === currentMealType
      );
      
      // If no items for current meal, show all available
      if (currentMealItems.length === 0) {
        currentMealItems = menuItems;
      }
      
      // Filter based on user preferences
      let filteredItems = currentMealItems;
      
      if (userPreferences) {
        filteredItems = currentMealItems.filter((item) => {
          // Check vegetarian/vegan restrictions
          if (userPreferences.is_vegan && !item.is_vegan) return false;
          if (userPreferences.is_vegetarian && !item.is_vegetarian) return false;
          if (userPreferences.is_pescatarian && !item.is_vegetarian && item.category !== 'seafood') return false;
          
          // Check allergens
          if (userPreferences.is_gluten_free && item.contains_gluten) return false;
          if (userPreferences.is_dairy_free && item.contains_dairy) return false;
          
          // Check specific allergies
          if (userPreferences.allergies && userPreferences.allergies.length > 0) {
            const itemAllergens = item.allergen_info.map((a) => a.toLowerCase());
            const hasAllergen = userPreferences.allergies.some((allergy) =>
              itemAllergens.some((a) => a.includes(allergy.toLowerCase()))
            );
            if (hasAllergen) return false;
          }
          
          return true;
        });
      }
      
      if (filteredItems.length === 0) {
        setError('No menu items match your dietary restrictions. Try adjusting your preferences.');
        setRecommendation(null);
        return;
      }
      
      // Score items based on user goals
      const scoredItems = filteredItems.map((item) => {
        let score = 0;
        const nutrition = item.nutrition;
        
        if (!nutrition) return { item, score: 0 };
        
        const proteinRatio = (nutrition.protein_g || 0) / Math.max(nutrition.calories || 1, 1);
        const fatRatio = (nutrition.fat_g || 0) / Math.max(nutrition.calories || 1, 1);
        
        if (userProfile?.goal === 'cut') {
          // Prioritize high protein, lower calories
          score += (nutrition.protein_g || 0) * 2;
          score -= ((nutrition.calories || 0) / 100);
          score += proteinRatio * 100;
        } else if (userProfile?.goal === 'bulk') {
          // Prioritize high calories and protein
          score += (nutrition.calories || 0) / 10;
          score += (nutrition.protein_g || 0) * 1.5;
        } else {
          // Balanced approach
          score += (nutrition.protein_g || 0);
          score += proteinRatio * 50;
        }
        
        return { item, score };
      });
      
      // Sort by score and take top 5
      const topItems = scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ item }) => item);
      
      // Get the dining hall from the first item
      const hall = topItems[0]?.dining_hall || null;
      
      // Generate recommendation reason
      let reason = '';
      if (userProfile?.goal === 'cut') {
        reason = 'High-protein, lower-calorie options to support your cutting goals';
      } else if (userProfile?.goal === 'bulk') {
        reason = 'High-calorie, protein-rich meals perfect for building muscle';
      } else {
        reason = 'Balanced meals to help you maintain your current fitness level';
      }
      
      // Mock dining hours (would come from API in production)
      const hours = getMealHours(currentMealType);
      
      setRecommendation({
        hall,
        mealType: currentMealType,
        items: topItems,
        reason,
        hours,
      });
    } catch (error: any) {
      console.error('Failed to get recommendations:', error);
      setError(error.message || 'Failed to load menu recommendations. Please try again.');
      setRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getMealHours = (mealType: MealType): string => {
    switch (mealType) {
      case 'breakfast':
        return '7:00 AM - 10:00 AM';
      case 'lunch':
        return '11:00 AM - 2:30 PM';
      case 'dinner':
        return '5:00 PM - 8:00 PM';
      case 'late_night':
        return '8:00 PM - 11:00 PM';
      default:
        return 'Check dining hall for hours';
    }
  };

  const handleLogMeal = async (item: MenuItemWithNutrition) => {
    try {
      console.log('🍽️ Logging meal:', item.name);
      
      await logMeal({
        menu_item_id: item.id,
        servings: 1,
        eaten_at: new Date().toISOString(),
      });
      
      console.log('✅ Meal logged successfully!');
      alert(`✅ ${item.name} logged!\n\nSwitch to the Today tab to see your updated progress.`);
    } catch (error) {
      console.error('❌ Failed to log meal:', error);
      alert('Failed to log meal. Please try again.');
    }
  };

  const totalCalories = Math.round((recommendation?.items.reduce(
    (sum, item) => sum + (item.nutrition?.calories || 0),
    0
  ) || 0) * 100) / 100;
  const totalProtein = Math.round((recommendation?.items.reduce(
    (sum, item) => sum + (item.nutrition?.protein_g || 0),
    0
  ) || 0) * 100) / 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.title}>I'm Hungry Now</Text>
          <Text style={styles.subtitle}>
            Get personalized meal recommendations based on your goals
          </Text>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>No Menu Available</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={getRecommendations}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.retryButtonText}>Try Again</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!recommendation && !error ? (
          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Ready to eat?</Text>
            <Text style={styles.promptText}>
              We'll recommend the best dining hall and meals to help you hit your goals
            </Text>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={getRecommendations}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.bigButtonText}>Find My Meal</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : recommendation ? (
          <>
            {/* Recommended Hall */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>Recommended For You</Text>
              <View style={styles.hallInfo}>
                <View style={styles.hallBadge}>
                  <Text style={styles.hallEmoji}>🏢</Text>
                  <View>
                    <Text style={styles.hallName}>
                      {recommendation.hall?.name || 'UC Davis Dining'}
                    </Text>
                    <Text style={styles.mealPeriod}>
                      {recommendation.mealType?.charAt(0).toUpperCase() + 
                       recommendation.mealType?.slice(1) || 'Current Meal'}
                    </Text>
                  </View>
                </View>
                {recommendation.hours && (
                  <View style={styles.hoursInfo}>
                    <Text style={styles.hoursIcon}>🕒</Text>
                    <Text style={styles.hoursText}>{recommendation.hours}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.recommendationReason}>
                💡 {recommendation.reason}
              </Text>
            </View>

            {/* Meal Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Suggested Meal Totals</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalCalories.toFixed(2)}</Text>
                  <Text style={styles.summaryLabel}>calories</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalProtein.toFixed(2)}g</Text>
                  <Text style={styles.summaryLabel}>protein</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{recommendation.items.length}</Text>
                  <Text style={styles.summaryLabel}>items</Text>
                </View>
              </View>
            </View>

            {/* Recommended Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Top Recommendations</Text>
              {recommendation.items.map((item, index) => (
                <RecommendationCard
                  key={item.id}
                  item={item}
                  ranking={index + 1}
                  reason={
                    index === 0
                      ? `Best match for your ${userProfile?.goal || 'fitness'} goals`
                      : undefined
                  }
                  onLog={() => handleLogMeal(item)}
                />
              ))}
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={getRecommendations}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.secondaryButtonIcon}>🔄</Text>
                  <Text style={styles.secondaryButtonText}>Get New Recommendations</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : null}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <InfoItem
            emoji="🎯"
            text="Considers your goals (cut, bulk, or maintain)"
          />
          <InfoItem
            emoji="🥗"
            text="Respects your dietary restrictions and allergies"
          />
          <InfoItem
            emoji="⏰"
            text="Shows what's available right now"
          />
          <InfoItem
            emoji="📊"
            text="Optimizes for your remaining macros"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const InfoItem: React.FC<{ emoji: string; text: string }> = ({ emoji, text }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoEmoji}>{emoji}</Text>
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
    ...shadow.md,
  },
  promptTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  promptText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bigButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl * 1.5,
    borderRadius: borderRadius.xxl,
    marginTop: spacing.md,
    minWidth: 220,
  },
  bigButtonText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.secondary,
    gap: spacing.lg,
    ...shadow.lg,
  },
  recommendationLabel: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
  },
  hallInfo: {
    gap: spacing.md,
  },
  hallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hallEmoji: {
    fontSize: 48,
  },
  hallName: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    lineHeight: 30,
  },
  mealPeriod: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  hoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
  },
  hoursIcon: {
    fontSize: 18,
  },
  hoursText: {
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '600',
  },
  recommendationReason: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.md,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  summaryDivider: {
    width: 2,
    height: 50,
    backgroundColor: colors.border,
  },
  itemsSection: {
    gap: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray300,
    ...shadow.sm,
  },
  secondaryButtonIcon: {
    fontSize: 24,
  },
  secondaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.sm,
  },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  infoItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 28,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  errorCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 3,
    borderColor: colors.warning,
    ...shadow.md,
  },
  errorEmoji: {
    fontSize: 72,
  },
  errorTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray300,
    marginTop: spacing.md,
    minWidth: 180,
  },
  retryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});

export default HungryNowScreen;

