import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MenuItemWithNutrition } from '../types';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

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
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    position: 'relative',
  },
  rankingBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rankingText: {
    fontSize: fontSize.sm,
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
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 16,
  },
  nutritionSummary: {
    alignItems: 'flex-end',
  },
  caloriesValue: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  caloriesLabel: {
    fontSize: fontSize.xs,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroText: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  reasonSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primaryLight + '15',
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  reasonIcon: {
    fontSize: 18,
  },
  reasonText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
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

