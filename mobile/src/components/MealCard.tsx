import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealLogWithItem } from '../types';
import { colors, spacing, fontSize, borderRadius, shadow } from '../constants/theme';

interface MealCardProps {
  meal: MealLogWithItem;
  onPress?: () => void;
  onDelete?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onPress, onDelete }) => {
  const totalCalories = (meal.menu_item.nutrition?.calories || 0) * meal.servings;
  const totalProtein = (meal.menu_item.nutrition?.protein_g || 0) * meal.servings;
  const totalCarbs = (meal.menu_item.nutrition?.carbs_g || 0) * meal.servings;
  const totalFat = (meal.menu_item.nutrition?.fat_g || 0) * meal.servings;

  const logTime = new Date(meal.logged_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.name}>{meal.menu_item.name}</Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>
                {meal.servings > 1 ? `${meal.servings}x servings` : '1 serving'}
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{logTime}</Text>
            </View>
            {meal.menu_item.station && (
              <Text style={styles.station}>{meal.menu_item.station}</Text>
            )}
          </View>

          {meal.menu_item.nutrition && (
            <View style={styles.caloriesSection}>
              <Text style={styles.caloriesValue}>{totalCalories}</Text>
              <Text style={styles.caloriesLabel}>kcal</Text>
            </View>
          )}
        </View>

        {meal.menu_item.nutrition && (
          <View style={styles.macros}>
            <MacroChip
              label="P"
              value={totalProtein}
              color={colors.protein}
            />
            <MacroChip
              label="C"
              value={totalCarbs}
              color={colors.carbs}
            />
            <MacroChip
              label="F"
              value={totalFat}
              color={colors.fat}
            />
          </View>
        )}

        {meal.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Note:</Text>
            <Text style={styles.notesText}>{meal.notes}</Text>
          </View>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

interface MacroChipProps {
  label: string;
  value: number;
  color: string;
}

const MacroChip: React.FC<MacroChipProps> = ({ label, value, color }) => (
  <View style={[styles.macroChip, { borderColor: color }]}>
    <Text style={[styles.macroLabel, { color }]}>{label}</Text>
    <Text style={styles.macroValue}>{value.toFixed(0)}g</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    ...shadow.md,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dot: {
    fontSize: fontSize.sm,
    color: colors.gray300,
  },
  station: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  caloriesSection: {
    alignItems: 'flex-end',
  },
  caloriesValue: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  },
  caloriesLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 0,
    backgroundColor: colors.gray100,
  },
  macroLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  macroValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  notesSection: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notesText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 24,
    color: colors.error,
    fontWeight: '600',
  },
});

