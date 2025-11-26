import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useStore } from '../../store/useStore';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

type BasicInfoScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'BasicInfo'>;

interface Props {
  navigation: BasicInfoScreenNavigationProp;
}

const BasicInfoScreen: React.FC<Props> = ({ navigation }) => {
  const { onboardingData, setOnboardingData } = useStore();
  
  const [height, setHeight] = useState(onboardingData.height_cm?.toString() || '');
  const [weight, setWeight] = useState(onboardingData.weight_kg?.toString() || '');
  const [age, setAge] = useState(onboardingData.age?.toString() || '');
  const [sex, setSex] = useState<'male' | 'female' | 'other' | undefined>(onboardingData.sex);

  const handleNext = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const ageNum = parseInt(age);

    if (!height || !weight || !age || !sex) {
      alert('Please fill in all fields');
      return;
    }

    if (isNaN(heightNum) || isNaN(weightNum) || isNaN(ageNum)) {
      alert('Please enter valid numbers');
      return;
    }

    setOnboardingData({
      height_cm: heightNum,
      weight_kg: weightNum,
      age: ageNum,
      sex,
    });

    navigation.navigate('Goals');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.progress}>Step 1 of 3</Text>
              <Text style={styles.title}>Basic Information</Text>
              <Text style={styles.subtitle}>
                Tell us about yourself to calculate your nutrition goals
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="170"
                  keyboardType="numeric"
                  placeholderTextColor={colors.gray400}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="70"
                  keyboardType="numeric"
                  placeholderTextColor={colors.gray400}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="20"
                  keyboardType="numeric"
                  placeholderTextColor={colors.gray400}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sex</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.optionButton, sex === 'male' && styles.optionButtonActive]}
                    onPress={() => setSex('male')}
                  >
                    <Text style={[styles.optionText, sex === 'male' && styles.optionTextActive]}>
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, sex === 'female' && styles.optionButtonActive]}
                    onPress={() => setSex('female')}
                  >
                    <Text style={[styles.optionText, sex === 'female' && styles.optionTextActive]}>
                      Female
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, sex === 'other' && styles.optionButtonActive]}
                    onPress={() => setSex('other')}
                  >
                    <Text style={[styles.optionText, sex === 'other' && styles.optionTextActive]}>
                      Other
                    </Text>
                  </TouchableOpacity>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
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
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '600',
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

export default BasicInfoScreen;

