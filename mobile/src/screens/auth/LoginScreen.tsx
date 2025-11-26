import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'exp://localhost:8081',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        Alert.alert('Sign In Error', error.message);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>DC Menu Planner</Text>
          <Text style={styles.subtitle}>
            Track your nutrition from UC Davis dining halls
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem emoji="📊" text="Track macros and calories" />
          <FeatureItem emoji="🍽️" text="Browse daily menus" />
          <FeatureItem emoji="🎯" text="Hit your fitness goals" />
          <FeatureItem emoji="🔔" text="Get meal recommendations" />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Sign in with your UC Davis Google account to get started
          </Text>
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
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  googleButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  googleIcon: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  googleButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;

