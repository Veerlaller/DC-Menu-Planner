import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MenuItemWithNutrition } from '../types';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { NutritionLabel } from './NutritionLabel';

interface MenuItemCardProps {
  item: MenuItemWithNutrition;
  onLog?: () => void;
  showDiningHall?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onLog,
  showDiningHall = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          
          <View style={styles.metaRow}>
            {item.station && (
              <Text style={styles.station}>{item.station}</Text>
            )}
            {showDiningHall && item.dining_hall && (
              <>
                {item.station && <Text style={styles.dot}>•</Text>}
                <Text style={styles.station}>{item.dining_hall.short_name}</Text>
              </>
            )}
            {item.meal_type && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.mealType}>
                  {item.meal_type.charAt(0).toUpperCase() + item.meal_type.slice(1)}
                </Text>
              </>
            )}
          </View>

          {/* Dietary Flags */}
          <View style={styles.tags}>
            {item.is_vegan && (
              <View style={[styles.tag, styles.tagVegan]}>
                <Text style={styles.tagText}>🌱 Vegan</Text>
              </View>
            )}
            {item.is_vegetarian && !item.is_vegan && (
              <View style={[styles.tag, styles.tagVegetarian]}>
                <Text style={styles.tagText}>🥬 Vegetarian</Text>
              </View>
            )}
            {!item.contains_gluten && (
              <View style={[styles.tag, styles.tagGlutenFree]}>
                <Text style={styles.tagText}>GF</Text>
              </View>
            )}
          </View>
        </View>

        {item.nutrition && (
          <View style={styles.caloriesSection}>
            <Text style={styles.caloriesValue}>{item.nutrition.calories}</Text>
            <Text style={styles.caloriesLabel}>kcal</Text>
          </View>
        )}
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.divider} />

          {item.nutrition ? (
            <>
              {/* Macro Summary */}
              <View style={styles.macrosGrid}>
                <MacroItem
                  label="Protein"
                  value={`${item.nutrition.protein_g}g`}
                  color={colors.protein}
                />
                <MacroItem
                  label="Carbs"
                  value={`${item.nutrition.carbs_g}g`}
                  color={colors.carbs}
                />
                <MacroItem
                  label="Fat"
                  value={`${item.nutrition.fat_g}g`}
                  color={colors.fat}
                />
              </View>

              {/* Detailed Nutrition Label */}
              <NutritionLabel nutrition={item.nutrition} />
            </>
          ) : (
            <Text style={styles.noNutrition}>Nutrition information not available</Text>
          )}

          {/* Allergen Info */}
          {item.allergen_info && item.allergen_info.length > 0 && (
            <View style={styles.allergenSection}>
              <Text style={styles.allergenLabel}>⚠️ Allergens:</Text>
              <Text style={styles.allergenText}>
                {item.allergen_info.join(', ')}
              </Text>
            </View>
          )}

          {/* Log Button */}
          {onLog && (
            <TouchableOpacity
              style={styles.logButton}
              onPress={onLog}
              activeOpacity={0.8}
            >
              <Text style={styles.logButtonText}>+ Log This Meal</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!expanded && (
        <Text style={styles.tapHint}>Tap for details</Text>
      )}
    </TouchableOpacity>
  );
};

interface MacroItemProps {
  label: string;
  value: string;
  color: string;
}

const MacroItem: React.FC<MacroItemProps> = ({ label, value, color }) => (
  <View style={styles.macroItem}>
    <View style={[styles.macroDot, { backgroundColor: color }]} />
    <View>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  station: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  mealType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dot: {
    fontSize: fontSize.sm,
    color: colors.gray300,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray100,
  },
  tagVegan: {
    backgroundColor: colors.secondary + '20',
  },
  tagVegetarian: {
    backgroundColor: colors.secondary + '20',
  },
  tagGlutenFree: {
    backgroundColor: colors.info + '20',
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  caloriesSection: {
    alignItems: 'flex-end',
  },
  caloriesValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  caloriesLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  tapHint: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
  },
  expandedSection: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  macroLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  noNutrition: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  allergenSection: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  allergenLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.warning,
  },
  allergenText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
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

