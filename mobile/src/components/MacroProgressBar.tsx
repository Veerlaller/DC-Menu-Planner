import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface MacroProgressBarProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  consumed,
  target,
  unit,
  color,
}) => {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(target - consumed, 0);
  const isOverTarget = consumed > target;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, isOverTarget && styles.overTarget]}>
          {consumed.toFixed(0)}/{target.toFixed(0)} {unit}
        </Text>
      </View>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: isOverTarget ? colors.error : color },
          ]}
        />
      </View>
      <Text style={styles.remaining}>
        {isOverTarget ? '+' : ''}{isOverTarget ? (consumed - target).toFixed(0) : remaining.toFixed(0)} {unit} {isOverTarget ? 'over' : 'remaining'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  value: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  overTarget: {
    color: colors.error,
  },
  barContainer: {
    height: 12,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  remaining: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

