import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../constants/theme';
import { getDailySummary } from '../../api';
import { DailySummary } from '../../types';

const WeeklyStatsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [weeklyData, setWeeklyData] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      setIsLoading(true);
      const summaries: DailySummary[] = [];
      const today = new Date();

      // Get data for the past 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        try {
          const summary = await getDailySummary(dateStr);
          summaries.push(summary);
        } catch (error) {
          // Add empty summary for failed days
          summaries.push({
            date: dateStr,
            consumed_calories: 0,
            consumed_protein: 0,
            consumed_carbs: 0,
            consumed_fat: 0,
            target_calories: 0,
            target_protein: 0,
            target_carbs: 0,
            target_fat: 0,
            meals_logged: [],
          });
        }
      }

      setWeeklyData(summaries);
    } catch (error) {
      console.error('Failed to load weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (dateStr: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Calculate weekly averages
  const daysWithData = weeklyData.filter(d => d.consumed_calories > 0);
  const avgCalories = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.consumed_calories, 0) / daysWithData.length
    : 0;
  const avgProtein = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.consumed_protein, 0) / daysWithData.length
    : 0;
  const avgCarbs = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.consumed_carbs, 0) / daysWithData.length
    : 0;
  const avgFat = daysWithData.length > 0
    ? daysWithData.reduce((sum, d) => sum + d.consumed_fat, 0) / daysWithData.length
    : 0;

  const totalMeals = weeklyData.reduce((sum, d) => sum + d.meals_logged.length, 0);
  const daysTracked = daysWithData.length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading weekly stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Weekly Stats</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📊 This Week's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{daysTracked}</Text>
              <Text style={styles.summaryLabel}>Days Tracked</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalMeals}</Text>
              <Text style={styles.summaryLabel}>Meals Logged</Text>
            </View>
          </View>
        </View>

        {/* Average Intake Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Daily Averages</Text>
          <View style={styles.avgRow}>
            <View style={styles.avgItem}>
              <Text style={styles.avgValue}>{Math.round(avgCalories)}</Text>
              <Text style={styles.avgLabel}>Calories</Text>
            </View>
            <View style={styles.avgItem}>
              <Text style={styles.avgValue}>{Math.round(avgProtein)}g</Text>
              <Text style={styles.avgLabel}>Protein</Text>
            </View>
            <View style={styles.avgItem}>
              <Text style={styles.avgValue}>{Math.round(avgCarbs)}g</Text>
              <Text style={styles.avgLabel}>Carbs</Text>
            </View>
            <View style={styles.avgItem}>
              <Text style={styles.avgValue}>{Math.round(avgFat)}g</Text>
              <Text style={styles.avgLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Daily Breakdown</Text>
          {weeklyData.map((day) => {
            const hasData = day.consumed_calories > 0;
            const todayDate = isToday(day.date);
            const percentage = day.target_calories > 0
              ? Math.min((day.consumed_calories / day.target_calories) * 100, 100)
              : 0;

            return (
              <View
                key={day.date}
                style={[styles.dayRow, todayDate && styles.dayRowToday]}
              >
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayName, todayDate && styles.todayText]}>
                    {getDayName(day.date)}
                  </Text>
                  <Text style={styles.dayDate}>{getDay(day.date)}</Text>
                </View>

                {hasData ? (
                  <>
                    <View style={styles.dayStats}>
                      <View style={styles.statPill}>
                        <Text style={styles.statValue}>{Math.round(day.consumed_calories)}</Text>
                        <Text style={styles.statUnit}>cal</Text>
                      </View>
                      <View style={styles.statPill}>
                        <Text style={styles.statValue}>{Math.round(day.consumed_protein)}</Text>
                        <Text style={styles.statUnit}>p</Text>
                      </View>
                      <View style={styles.statPill}>
                        <Text style={styles.statValue}>{day.meals_logged.length}</Text>
                        <Text style={styles.statUnit}>meals</Text>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noDataText}>No data</Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  backIcon: {
    fontSize: 32,
    color: colors.text,
    fontWeight: '300',
    marginTop: -2,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    ...shadow.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  summaryDivider: {
    width: 2,
    height: 50,
    backgroundColor: colors.primary + '30',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.md,
  },
  avgRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  avgItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avgValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  avgLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dayRow: {
    flexDirection: 'column',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayRowToday: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary + '10',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dayName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
  },
  todayText: {
    color: colors.secondary,
  },
  dayDate: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  dayStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
  },
  statValue: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
  },
  statUnit: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  percentageText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 40,
  },
  noDataText: {
    fontSize: fontSize.base,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});

export default WeeklyStatsScreen;

