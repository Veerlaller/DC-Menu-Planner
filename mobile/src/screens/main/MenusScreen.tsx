import React, { useEffect, useState } from 'react';
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
import { useMockApi } from '../../api';

const DINING_HALLS = ['Latitude', 'Cuarto', 'Segundo', 'Tercero'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const MenusScreen: React.FC = () => {
  const { availableMenus, setAvailableMenus, setIsLoading, isLoading } = useStore();
  const [selectedHall, setSelectedHall] = useState('Latitude');
  const [selectedMeal, setSelectedMeal] = useState('Lunch');

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with real API call
      // const menus = await getAvailableMenus();
      const menus = await useMockApi.getAvailableMenus();
      setAvailableMenus(menus);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const filteredMenus = availableMenus.filter(
    (item) =>
      item.dining_hall?.short_name === selectedHall &&
      item.category === selectedMeal.toLowerCase()
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Dining Hall Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dining Hall</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hallsScroll}
          >
            {DINING_HALLS.map((hall) => (
              <TouchableOpacity
                key={hall}
                style={[styles.hallChip, selectedHall === hall && styles.hallChipActive]}
                onPress={() => setSelectedHall(hall)}
                activeOpacity={0.7}
              >
                <Text style={[styles.hallText, selectedHall === hall && styles.hallTextActive]}>
                  {hall}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Meal</Text>
          <View style={styles.mealButtons}>
            {MEAL_TYPES.map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[styles.mealButton, selectedMeal === meal && styles.mealButtonActive]}
                onPress={() => setSelectedMeal(meal)}
                activeOpacity={0.7}
              >
                <Text style={[styles.mealText, selectedMeal === meal && styles.mealTextActive]}>
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView style={styles.menuList} contentContainerStyle={styles.menuListContent}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredMenus.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No menu available</Text>
              <Text style={styles.emptyText}>
                Check back later or select a different dining hall
              </Text>
            </View>
          ) : (
            filteredMenus.map((item) => (
              <MenuItemCard key={item.id} item={item} onLog={() => console.log('Log meal')} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const MenuItemCard: React.FC<{
  item: MenuItemWithNutrition;
  onLog: () => void;
}> = ({ item, onLog }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      <View style={styles.menuCardHeader}>
        <View style={styles.menuCardInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.station && <Text style={styles.menuItemStation}>{item.station}</Text>}
          
          {/* Dietary Flags */}
          <View style={styles.tags}>
            {item.is_vegan && <View style={[styles.tag, styles.tagVegan]}><Text style={styles.tagText}>Vegan</Text></View>}
            {item.is_vegetarian && !item.is_vegan && <View style={[styles.tag, styles.tagVegetarian]}><Text style={styles.tagText}>Vegetarian</Text></View>}
            {item.contains_gluten && <View style={styles.tag}><Text style={styles.tagText}>Contains Gluten</Text></View>}
          </View>
        </View>

        {item.nutrition && (
          <View style={styles.menuCardCalories}>
            <Text style={styles.calorieNumber}>{item.nutrition.calories}</Text>
            <Text style={styles.calorieLabel}>kcal</Text>
          </View>
        )}
      </View>

      {expanded && item.nutrition && (
        <View style={styles.menuCardExpanded}>
          <View style={styles.divider} />
          
          {/* Nutrition Info */}
          <View style={styles.nutritionGrid}>
            <NutritionItem label="Protein" value={`${item.nutrition.protein_g}g`} color={colors.protein} />
            <NutritionItem label="Carbs" value={`${item.nutrition.carbs_g}g`} color={colors.carbs} />
            <NutritionItem label="Fat" value={`${item.nutrition.fat_g}g`} color={colors.fat} />
          </View>

          {item.allergen_info && item.allergen_info.length > 0 && (
            <View style={styles.allergenSection}>
              <Text style={styles.allergenLabel}>Allergens:</Text>
              <Text style={styles.allergenText}>{item.allergen_info.join(', ')}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.logButton} onPress={onLog} activeOpacity={0.8}>
            <Text style={styles.logButtonText}>+ Log This Meal</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const NutritionItem: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.nutritionItem}>
    <View style={[styles.nutritionDot, { backgroundColor: color }]} />
    <View>
      <Text style={styles.nutritionValue}>{value}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  hallsScroll: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  hallChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hallChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hallText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text,
  },
  hallTextActive: {
    color: colors.white,
  },
  mealButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mealButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  mealButtonActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  mealText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  mealTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  menuList: {
    flex: 1,
  },
  menuListContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  menuCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuCardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  menuItemName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemStation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs / 2,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
  },
  tagVegan: {
    backgroundColor: colors.secondary + '20',
  },
  tagVegetarian: {
    backgroundColor: colors.secondary + '20',
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.text,
  },
  menuCardCalories: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  calorieNumber: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  calorieLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  menuCardExpanded: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nutritionValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  nutritionLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  allergenSection: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  allergenLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  allergenText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.error,
  },
  logButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
});

export default MenusScreen;

