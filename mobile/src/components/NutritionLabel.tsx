import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutritionFacts } from '../types';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface NutritionLabelProps {
  nutrition: NutritionFacts;
  compact?: boolean;
}

export const NutritionLabel: React.FC<NutritionLabelProps> = ({
  nutrition,
  compact = false,
}) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <NutritionRow label="Calories" value={`${nutrition.calories || 0}`} />
        <NutritionRow label="Protein" value={`${nutrition.protein_g || 0}g`} />
        <NutritionRow label="Carbs" value={`${nutrition.carbs_g || 0}g`} />
        <NutritionRow label="Fat" value={`${nutrition.fat_g || 0}g`} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition Facts</Text>
        {nutrition.serving_size && (
          <Text style={styles.servingSize}>
            Serving Size: {nutrition.serving_size}
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* Calories - Prominent */}
      <View style={styles.caloriesSection}>
        <Text style={styles.caloriesLabel}>Calories</Text>
        <Text style={styles.caloriesValue}>{nutrition.calories || 0}</Text>
      </View>

      <View style={styles.dividerThick} />

      {/* Macronutrients */}
      <View style={styles.section}>
        <NutritionRow
          label="Total Fat"
          value={`${nutrition.fat_g || 0}g`}
          bold
        />
        {nutrition.saturated_fat_g !== undefined && (
          <NutritionRow
            label="Saturated Fat"
            value={`${nutrition.saturated_fat_g}g`}
            indent
          />
        )}
        {nutrition.trans_fat_g !== undefined && (
          <NutritionRow
            label="Trans Fat"
            value={`${nutrition.trans_fat_g}g`}
            indent
          />
        )}

        <View style={styles.divider} />

        <NutritionRow
          label="Total Carbohydrate"
          value={`${nutrition.carbs_g || 0}g`}
          bold
        />
        {nutrition.fiber_g !== undefined && (
          <NutritionRow
            label="Dietary Fiber"
            value={`${nutrition.fiber_g}g`}
            indent
          />
        )}
        {nutrition.sugar_g !== undefined && (
          <NutritionRow
            label="Total Sugars"
            value={`${nutrition.sugar_g}g`}
            indent
          />
        )}

        <View style={styles.divider} />

        <NutritionRow
          label="Protein"
          value={`${nutrition.protein_g || 0}g`}
          bold
        />
      </View>

      <View style={styles.dividerThick} />

      {/* Micronutrients */}
      <View style={styles.section}>
        {nutrition.cholesterol_mg !== undefined && (
          <NutritionRow
            label="Cholesterol"
            value={`${nutrition.cholesterol_mg}mg`}
          />
        )}
        {nutrition.sodium_mg !== undefined && (
          <NutritionRow label="Sodium" value={`${nutrition.sodium_mg}mg`} />
        )}
        {nutrition.calcium_mg !== undefined && (
          <NutritionRow label="Calcium" value={`${nutrition.calcium_mg}mg`} />
        )}
        {nutrition.iron_mg !== undefined && (
          <NutritionRow label="Iron" value={`${nutrition.iron_mg}mg`} />
        )}
        {nutrition.vitamin_a_mcg !== undefined && (
          <NutritionRow
            label="Vitamin A"
            value={`${nutrition.vitamin_a_mcg}mcg`}
          />
        )}
        {nutrition.vitamin_c_mg !== undefined && (
          <NutritionRow
            label="Vitamin C"
            value={`${nutrition.vitamin_c_mg}mg`}
          />
        )}
      </View>
    </View>
  );
};

interface NutritionRowProps {
  label: string;
  value: string;
  bold?: boolean;
  indent?: boolean;
}

const NutritionRow: React.FC<NutritionRowProps> = ({
  label,
  value,
  bold = false,
  indent = false,
}) => (
  <View style={[styles.row, indent && styles.rowIndent]}>
    <Text style={[styles.label, bold && styles.labelBold]}>{label}</Text>
    <Text style={[styles.value, bold && styles.valueBold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray900,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  compactContainer: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  servingSize: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray300,
    marginVertical: spacing.xs,
  },
  dividerThick: {
    height: 8,
    backgroundColor: colors.gray900,
    marginVertical: spacing.sm,
  },
  caloriesSection: {
    paddingVertical: spacing.sm,
  },
  caloriesLabel: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  caloriesValue: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    gap: spacing.xs / 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs / 2,
  },
  rowIndent: {
    paddingLeft: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  labelBold: {
    fontWeight: '700',
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  valueBold: {
    fontWeight: '700',
  },
});

