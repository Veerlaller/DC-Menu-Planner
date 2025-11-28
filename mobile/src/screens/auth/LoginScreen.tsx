import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { supabase, redirectUrl } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Starting Google Sign In...');
      console.log('Platform:', Platform.OS);
      console.log('Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        Alert.alert('Sign In Error', error.message);
        setIsLoading(false);
        return;
      }

      // For web, Supabase will automatically handle the OAuth redirect and session
      // The page will redirect to Google, then back to our app with tokens in the URL
      // Supabase's detectSessionInUrl will automatically capture and set the session
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform: OAuth redirect will happen automatically');
        console.log('   Supabase will detect session from URL after redirect');
        // Don't set isLoading to false here - the page will redirect
        return;
      }

      // For mobile/native apps, we need to open the auth URL in a browser
      if (data?.url) {
        console.log('📱 Mobile platform: Opening auth URL in browser...');
        console.log('   Auth URL:', data.url);
        
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success' && result.url) {
          console.log('✅ OAuth completed successfully');
          console.log('   Callback URL:', result.url);
          
          // Extract the tokens from the callback URL
          const url = new URL(result.url);
          const access_token = url.searchParams.get('access_token');
          const refresh_token = url.searchParams.get('refresh_token');

          if (access_token && refresh_token) {
            console.log('🔑 Tokens received, setting session...');
            
            // Set the session with the tokens
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) {
              console.error('❌ Session error:', sessionError);
              Alert.alert('Error', 'Failed to establish session');
            } else {
              console.log('✅ Session established successfully!');
              console.log('   User ID:', sessionData.user?.id);
              console.log('   User Email:', sessionData.user?.email);
              console.log('📱 Navigation will be handled automatically by auth state listener');
            }
          } else {
            console.error('❌ No tokens in callback URL');
            console.log('   URL params:', Object.fromEntries(url.searchParams.entries()));
            Alert.alert('Error', 'No tokens received from OAuth');
          }
        } else if (result.type === 'cancel') {
          console.log('ℹ️ User cancelled sign in');
        } else {
          console.log('⚠️ OAuth result:', result);
          Alert.alert('Error', 'Sign in was not completed');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Make sure Supabase is configured.');
    } finally {
      // Only set loading to false for mobile - web will redirect
      if (Platform.OS !== 'web') {
        setIsLoading(false);
      }
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

