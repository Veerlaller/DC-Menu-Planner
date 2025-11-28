import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MenuItemWithNutrition } from '../types';
import { colors, spacing, fontSize, borderRadius, shadow } from '../constants/theme';

interface RecommendationCardProps {
  item: MenuItemWithNutrition;
  reason?: string;
  ranking?: number;
  onPress?: () => void;
  onLog?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  reason,
  ranking,
  onPress,
  onLog,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      {ranking && (
        <View style={styles.rankingBadge}>
          <Text style={styles.rankingText}>#{ranking}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={[styles.header, { paddingRight: ranking ? 40 : 0 }]}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            
            <View style={styles.metaRow}>
              {item.station && (
                <Text style={styles.station}>{item.station}</Text>
              )}
              {item.dining_hall && (
                <>
                  {item.station && <Text style={styles.dot}>•</Text>}
                  <Text style={styles.hall}>{item.dining_hall.short_name}</Text>
                </>
              )}
            </View>

            {/* Dietary indicators */}
            <View style={styles.indicators}>
              {item.is_vegan && (
                <View style={styles.indicator}>
                  <Text style={styles.indicatorText}>🌱</Text>
                </View>
              )}
              {item.is_vegetarian && !item.is_vegan && (
                <View style={styles.indicator}>
                  <Text style={styles.indicatorText}>🥬</Text>
                </View>
              )}
            </View>
          </View>

          {item.nutrition && (
            <View style={styles.nutritionSummary}>
              <Text style={styles.caloriesValue}>{item.nutrition.calories}</Text>
              <Text style={styles.caloriesLabel}>kcal</Text>
            </View>
          )}
        </View>

        {item.nutrition && (
          <View style={styles.macros}>
            <MacroPill
              label="Protein"
              value={`${item.nutrition.protein_g}g`}
              color={colors.protein}
            />
            <MacroPill
              label="Carbs"
              value={`${item.nutrition.carbs_g}g`}
              color={colors.carbs}
            />
            <MacroPill
              label="Fat"
              value={`${item.nutrition.fat_g}g`}
              color={colors.fat}
            />
          </View>
        )}

        {reason && (
          <View style={styles.reasonSection}>
            <Text style={styles.reasonIcon}>💡</Text>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        )}

        {onLog && (
          <TouchableOpacity
            style={styles.logButton}
            onPress={onLog}
            activeOpacity={0.8}
          >
            <Text style={styles.logButtonText}>+ Quick Log</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface MacroPillProps {
  label: string;
  value: string;
  color: string;
}

const MacroPill: React.FC<MacroPillProps> = ({ label, value, color }) => (
  <View style={[styles.macroPill, { backgroundColor: color + '15' }]}>
    <View style={[styles.macroDot, { backgroundColor: color }]} />
    <Text style={styles.macroText}>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
      <Text style={styles.macroLabel}> {label}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    position: 'relative',
    ...shadow.md,
  },
  rankingBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rankingText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.white,
  },
  content: {
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
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  station: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  hall: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  dot: {
    fontSize: fontSize.sm,
    color: colors.gray300,
  },
  indicators: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 18,
  },
  nutritionSummary: {
    alignItems: 'flex-end',
  },
  caloriesValue: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.text,
  },
  caloriesLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: -4,
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroText: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroValue: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  reasonSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  reasonIcon: {
    fontSize: 20,
  },
  reasonText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  logButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
});

