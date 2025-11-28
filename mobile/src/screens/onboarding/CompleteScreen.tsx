import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useStore } from '../../store/useStore';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { completeOnboarding } from '../../api';

type CompleteScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Complete'>;

interface Props {
  navigation: CompleteScreenNavigationProp;
}

const CompleteScreen: React.FC<Props> = () => {
  const {
    onboardingData,
    setHasCompletedOnboarding,
    setUserProfile,
    setUserPreferences,
    clearOnboardingData,
    setIsLoading,
    isLoading,
  } = useStore();

  // Calculate target macros based on user data
  const calculateMacros = () => {
    const { height_inches, weight_lbs, age, sex, goal, activity_level } = onboardingData;

    if (!height_inches || !weight_lbs || !age || !sex || !goal || !activity_level) {
      return null;
    }

    // Convert imperial to metric for BMR calculation
    const height_cm = height_inches * 2.54;
    const weight_kg = weight_lbs * 0.453592;

    // Calculate BMR using Mifflin-St Jeor equation (uses metric)
    let bmr: number;
    if (sex === 'male') {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    } else {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * activityMultipliers[activity_level];

    // Adjust based on goal
    let targetCalories: number;
    if (goal === 'cut') {
      targetCalories = tdee - 500; // 500 calorie deficit
    } else if (goal === 'bulk') {
      targetCalories = tdee + 300; // 300 calorie surplus
    } else {
      targetCalories = tdee; // Maintenance
    }

    // Calculate macros
    // Protein: 0.8-1g per lb for cut/bulk, 0.7g for maintain
    const proteinMultiplier = goal === 'maintain' ? 0.7 : 0.9;
    const targetProtein = weight_lbs * proteinMultiplier;

    // Fat: 25% of calories
    const targetFat = (targetCalories * 0.25) / 9;

    // Carbs: remaining calories
    const targetCarbs = (targetCalories - (targetProtein * 4 + targetFat * 9)) / 4;

    return {
      targetCalories: Math.round(targetCalories),
      targetProtein: Math.round(targetProtein),
      targetCarbs: Math.round(targetCarbs),
      targetFat: Math.round(targetFat),
    };
  };

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      const macros = calculateMacros();

      if (!macros) {
        alert('Failed to calculate nutrition targets. Please check your information.');
        setIsLoading(false);
        return;
      }

      // Add calculated macros to onboarding data
      const completeData = {
        ...onboardingData,
        target_calories: macros.targetCalories,
        target_protein_g: macros.targetProtein,
        target_carbs_g: macros.targetCarbs,
        target_fat_g: macros.targetFat,
      };

      console.log('📤 Sending onboarding data with macros:', {
        ...completeData,
        target_calories: completeData.target_calories,
        target_protein_g: completeData.target_protein_g,
        target_carbs_g: completeData.target_carbs_g,
        target_fat_g: completeData.target_fat_g,
      });

      // Send to backend API
      const result = await completeOnboarding(completeData);
      
      console.log('📥 Received profile from backend:', {
        target_calories: result.profile.target_calories,
        target_protein_g: result.profile.target_protein_g,
        target_carbs_g: result.profile.target_carbs_g,
        target_fat_g: result.profile.target_fat_g,
      });
      
      // Save to store with backend response
      setUserProfile(result.profile);
      setUserPreferences(result.preferences);
      setHasCompletedOnboarding(true);
      clearOnboardingData();

      // Navigation will happen automatically via RootNavigator
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const macros = calculateMacros();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Here's your personalized nutrition plan
          </Text>
        </View>

        {macros && (
          <View style={styles.macrosCard}>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Daily Calorie Target</Text>
              <Text style={styles.macroValue}>{macros.targetCalories} kcal</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <View style={[styles.macroBar, { backgroundColor: colors.protein }]} />
                <Text style={styles.macroName}>Protein</Text>
                <Text style={styles.macroAmount}>{macros.targetProtein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroBar, { backgroundColor: colors.carbs }]} />
                <Text style={styles.macroName}>Carbs</Text>
                <Text style={styles.macroAmount}>{macros.targetCarbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroBar, { backgroundColor: colors.fat }]} />
                <Text style={styles.macroName}>Fat</Text>
                <Text style={styles.macroAmount}>{macros.targetFat}g</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>What's Next:</Text>
          <FeatureItem emoji="📊" text="Track your meals from dining halls" />
          <FeatureItem emoji="🎯" text="Monitor your progress towards goals" />
          <FeatureItem emoji="🔔" text="Get personalized meal recommendations" />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleFinish}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Start Tracking</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FeatureItem: React.FC<{ emoji: string; text: string }> = ({ emoji, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  macrosCard: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  macroLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  macroValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroBar: {
    width: 40,
    height: 6,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs / 2,
  },
  macroName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  macroAmount: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  features: {
    gap: spacing.md,
  },
  featuresTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  footer: {
    marginBottom: spacing.xl,
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

export default CompleteScreen;

