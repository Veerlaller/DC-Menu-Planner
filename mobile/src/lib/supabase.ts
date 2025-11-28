import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Important: This is required for the redirect to work properly
WebBrowser.maybeCompleteAuthSession();

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials are configured
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || 
    SUPABASE_URL === 'https://your-project.supabase.co' || 
    SUPABASE_ANON_KEY === 'your-anon-key') {
  console.warn(
    '⚠️  Supabase credentials not configured!\n' +
    'Create a .env file in the mobile folder with:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
    'See mobile/env.example.txt for details.'
  );
}

// Get the redirect URL for OAuth
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: 'dcmenuplanner',
  path: 'auth/callback',
});

console.log('OAuth Redirect URL:', redirectUrl);

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web, let Supabase automatically detect session in URL after OAuth callback
    // On mobile, we handle it manually via WebBrowser
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Export redirect URL for use in OAuth
export { redirectUrl };

