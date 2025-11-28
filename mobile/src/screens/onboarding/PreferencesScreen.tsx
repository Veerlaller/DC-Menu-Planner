import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useStore } from '../../store/useStore';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

type PreferencesScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  'Preferences'
>;

interface Props {
  navigation: PreferencesScreenNavigationProp;
}

const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { onboardingData, setOnboardingData } = useStore();
  
  const [isVegetarian, setIsVegetarian] = useState(onboardingData.is_vegetarian || false);
  const [isVegan, setIsVegan] = useState(onboardingData.is_vegan || false);
  const [isPescatarian, setIsPescatarian] = useState(onboardingData.is_pescatarian || false);
  const [isGlutenFree, setIsGlutenFree] = useState(onboardingData.is_gluten_free || false);
  const [isDairyFree, setIsDairyFree] = useState(onboardingData.is_dairy_free || false);
  const [isHalal, setIsHalal] = useState(onboardingData.is_halal || false);
  const [isKosher, setIsKosher] = useState(onboardingData.is_kosher || false);
  const [isHinduNonVeg, setIsHinduNonVeg] = useState(onboardingData.is_hindu_non_veg || false);
  
  const [allergiesInput, setAllergiesInput] = useState(
    onboardingData.allergies?.join(', ') || ''
  );

  const handleComplete = () => {
    const allergies = allergiesInput
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);

    setOnboardingData({
      is_vegetarian: isVegetarian,
      is_vegan: isVegan,
      is_pescatarian: isPescatarian,
      is_gluten_free: isGlutenFree,
      is_dairy_free: isDairyFree,
      is_halal: isHalal,
      is_kosher: isKosher,
      is_hindu_non_veg: isHinduNonVeg,
      allergies,
      dislikes: [],
    });

    navigation.navigate('Complete');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.progress}>Step 3 of 3</Text>
            <Text style={styles.title}>Dietary Preferences</Text>
            <Text style={styles.subtitle}>
              Help us recommend foods that match your diet
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
              <View style={styles.toggleList}>
                <ToggleOption
                  label="Vegetarian"
                  value={isVegetarian}
                  onToggle={setIsVegetarian}
                />
                <ToggleOption
                  label="Vegan"
                  value={isVegan}
                  onToggle={setIsVegan}
                />
                <ToggleOption
                  label="Pescatarian"
                  value={isPescatarian}
                  onToggle={setIsPescatarian}
                />
                <ToggleOption
                  label="Gluten-Free"
                  value={isGlutenFree}
                  onToggle={setIsGlutenFree}
                />
                <ToggleOption
                  label="Dairy-Free"
                  value={isDairyFree}
                  onToggle={setIsDairyFree}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Religious Dietary Restrictions</Text>
              <View style={styles.toggleList}>
                <ToggleOption
                  label="Halal"
                  value={isHalal}
                  onToggle={setIsHalal}
                />
                <ToggleOption
                  label="Kosher"
                  value={isKosher}
                  onToggle={setIsKosher}
                />
                <ToggleOption
                  label="Hindu (No Beef)"
                  value={isHinduNonVeg}
                  onToggle={setIsHinduNonVeg}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Allergies (Optional)</Text>
              <Text style={styles.inputHint}>Separate with commas</Text>
              <TextInput
                style={styles.textArea}
                value={allergiesInput}
                onChangeText={setAllergiesInput}
                placeholder="e.g. peanuts, shellfish, soy"
                placeholderTextColor={colors.gray400}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Complete Setup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ToggleOption: React.FC<{
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}> = ({ label, value, onToggle }) => (
  <TouchableOpacity
    style={styles.toggleItem}
    onPress={() => onToggle(!value)}
    activeOpacity={0.7}
  >
    <Text style={styles.toggleLabel}>{label}</Text>
    <View style={[styles.toggle, value && styles.toggleActive]}>
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
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
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  inputHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  toggleList: {
    gap: spacing.xs,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  toggleLabel: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray300,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  textArea: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
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

export default PreferencesScreen;

