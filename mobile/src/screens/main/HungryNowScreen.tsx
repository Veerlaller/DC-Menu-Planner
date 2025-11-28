import React, { useState } from 'react';
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
import { MenuItemWithNutrition } from '../../types';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { getAvailableMenus } from '../../api';
import { useAuth } from '../../hooks/useAuth';

const HungryNowScreen: React.FC = () => {
  const { userProfile, userPreferences } = useStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MenuItemWithNutrition[]>([]);
  const [recommendedHall, setRecommendedHall] = useState<string | null>(null);
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
        setRecommendations([]);
        setRecommendedHall(null);
        return;
      }
      
      // Filter based on user preferences
      let filteredItems = menuItems;
      
      if (userPreferences) {
        filteredItems = menuItems.filter((item) => {
          // Check vegetarian/vegan restrictions
          if (userPreferences.is_vegan && !item.is_vegan) return false;
          if (userPreferences.is_vegetarian && !item.is_vegetarian) return false;
          if (userPreferences.is_pescatarian && !item.is_vegetarian && item.category !== 'seafood') return false;
          
          // Check allergens
          if (userPreferences.is_gluten_free && item.contains_gluten) return false;
          if (userPreferences.is_dairy_free && item.contains_dairy) return false;
          if (userPreferences.is_dairy_free && item.contains_nuts) return false;
          
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
        setRecommendations([]);
        setRecommendedHall(null);
        return;
      }
      
      // Sort by protein content for simplicity (could be more sophisticated)
      const sortedItems = filteredItems.sort(
        (a, b) => (b.nutrition?.protein_g || 0) - (a.nutrition?.protein_g || 0)
      );
      
      // Take top 3 items
      const topRecommendations = sortedItems.slice(0, 3);
      
      setRecommendedHall('UC Davis Dining Commons');
      setRecommendations(topRecommendations);
    } catch (error: any) {
      console.error('Failed to get recommendations:', error);
      setError(error.message || 'Failed to load menu recommendations. Please try again.');
      setRecommendations([]);
      setRecommendedHall(null);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalories = recommendations.reduce(
    (sum, item) => sum + (item.nutrition?.calories || 0),
    0
  );
  const totalProtein = recommendations.reduce(
    (sum, item) => sum + (item.nutrition?.protein_g || 0),
    0
  );

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

        {!recommendedHall && !error ? (
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
        ) : recommendedHall ? (
          <>
            {/* Recommended Hall */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>Recommended For You</Text>
              <View style={styles.hallBadge}>
                <Text style={styles.hallEmoji}>🏢</Text>
                <Text style={styles.hallName}>{recommendedHall}</Text>
              </View>
              <Text style={styles.recommendationReason}>
                {userProfile?.goal === 'cut'
                  ? 'Best high-protein, lower-calorie options'
                  : userProfile?.goal === 'bulk'
                  ? 'Great high-calorie meals for muscle building'
                  : 'Balanced meals for maintenance'}
              </Text>
            </View>

            {/* Meal Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Suggested Meal</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalCalories}</Text>
                  <Text style={styles.summaryLabel}>calories</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalProtein.toFixed(0)}g</Text>
                  <Text style={styles.summaryLabel}>protein</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{recommendations.length}</Text>
                  <Text style={styles.summaryLabel}>items</Text>
                </View>
              </View>
            </View>

            {/* Recommended Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Recommended Items</Text>
              {recommendations.map((item) => (
                <RecommendedItem key={item.id} item={item} />
              ))}
            </View>

            {/* Actions */}
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <Text style={styles.actionButtonText}>Log This Meal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={getRecommendations}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.secondaryButtonText}>Get New Recommendation</Text>
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

const RecommendedItem: React.FC<{ item: MenuItemWithNutrition }> = ({ item }) => (
  <View style={styles.itemCard}>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemStation}>{item.station}</Text>
      {item.nutrition && (
        <View style={styles.itemMacros}>
          <Text style={styles.itemMacro}>
            {item.nutrition.calories} cal
          </Text>
          <Text style={styles.itemMacroDot}>•</Text>
          <Text style={styles.itemMacro}>
            {item.nutrition.protein_g}g protein
          </Text>
        </View>
      )}
    </View>
    <View style={styles.itemBadge}>
      <Text style={styles.itemBadgeText}>✓</Text>
    </View>
  </View>
);

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
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  promptTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    color: colors.text,
  },
  promptText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bigButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    minWidth: 200,
  },
  bigButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: spacing.md,
  },
  recommendationLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  hallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hallEmoji: {
    fontSize: 32,
  },
  hallName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  recommendationReason: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSize.base,
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
    gap: spacing.xs / 2,
  },
  summaryValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  itemsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  itemName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  itemStation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemMacros: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs / 2,
  },
  itemMacro: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemMacroDot: {
    fontSize: fontSize.sm,
    color: colors.gray300,
  },
  itemBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBadgeText: {
    fontSize: fontSize.lg,
    color: colors.white,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  infoItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  errorCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  errorEmoji: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: spacing.sm,
    minWidth: 150,
  },
  retryButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
});

export default HungryNowScreen;

