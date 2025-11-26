import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useStore } from '../../store/useStore';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

type GoalsScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Goals'>;

interface Props {
  navigation: GoalsScreenNavigationProp;
}

const GoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { onboardingData, setOnboardingData } = useStore();
  
  const [goal, setGoal] = useState<'cut' | 'bulk' | 'maintain' | undefined>(
    onboardingData.goal
  );
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | undefined
  >(onboardingData.activity_level);

  const handleNext = () => {
    if (!goal || !activityLevel) {
      alert('Please select both your goal and activity level');
      return;
    }

    setOnboardingData({ goal, activity_level: activityLevel });
    navigation.navigate('Preferences');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.progress}>Step 2 of 3</Text>
            <Text style={styles.title}>Your Goals</Text>
            <Text style={styles.subtitle}>
              We'll calculate your nutrition targets based on your goals
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fitness Goal</Text>
              <View style={styles.optionsGrid}>
                <GoalCard
                  emoji="📉"
                  title="Cut"
                  description="Lose fat and get lean"
                  isSelected={goal === 'cut'}
                  onPress={() => setGoal('cut')}
                />
                <GoalCard
                  emoji="💪"
                  title="Bulk"
                  description="Build muscle mass"
                  isSelected={goal === 'bulk'}
                  onPress={() => setGoal('bulk')}
                />
                <GoalCard
                  emoji="⚖️"
                  title="Maintain"
                  description="Stay at current weight"
                  isSelected={goal === 'maintain'}
                  onPress={() => setGoal('maintain')}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Level</Text>
              <View style={styles.optionsList}>
                <ActivityOption
                  title="Sedentary"
                  description="Little to no exercise"
                  isSelected={activityLevel === 'sedentary'}
                  onPress={() => setActivityLevel('sedentary')}
                />
                <ActivityOption
                  title="Light"
                  description="Exercise 1-3 times/week"
                  isSelected={activityLevel === 'light'}
                  onPress={() => setActivityLevel('light')}
                />
                <ActivityOption
                  title="Moderate"
                  description="Exercise 3-5 times/week"
                  isSelected={activityLevel === 'moderate'}
                  onPress={() => setActivityLevel('moderate')}
                />
                <ActivityOption
                  title="Active"
                  description="Exercise 6-7 times/week"
                  isSelected={activityLevel === 'active'}
                  onPress={() => setActivityLevel('active')}
                />
                <ActivityOption
                  title="Very Active"
                  description="Athlete or physical job"
                  isSelected={activityLevel === 'very_active'}
                  onPress={() => setActivityLevel('very_active')}
                />
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const GoalCard: React.FC<{
  emoji: string;
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}> = ({ emoji, title, description, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.goalCard, isSelected && styles.goalCardActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.goalEmoji}>{emoji}</Text>
    <Text style={[styles.goalTitle, isSelected && styles.goalTitleActive]}>{title}</Text>
    <Text style={styles.goalDescription}>{description}</Text>
  </TouchableOpacity>
);

const ActivityOption: React.FC<{
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}> = ({ title, description, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.activityOption, isSelected && styles.activityOptionActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.activityContent}>
      <Text style={[styles.activityTitle, isSelected && styles.activityTitleActive]}>
        {title}
      </Text>
      <Text style={styles.activityDescription}>{description}</Text>
    </View>
    <View style={[styles.radio, isSelected && styles.radioActive]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: spacing.xxl,
  },
  progress: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  goalCard: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  goalCardActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  goalTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  goalTitleActive: {
    color: colors.primary,
  },
  goalDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionsList: {
    gap: spacing.sm,
  },
  activityOption: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  activityOptionActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  activityTitleActive: {
    color: colors.primary,
  },
  activityDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  footer: {
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});

export default GoalsScreen;

