import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.'
  );
}

/**
 * Supabase client configured with service role key for backend operations.
 * This client bypasses Row Level Security (RLS) policies.
 * Use with caution and implement your own authorization logic.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Test database connectivity by running a simple query.
 * @returns Promise that resolves to true if connection is successful
 * @throws Error if database connection fails
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Simple query to test connection
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      // If the version RPC doesn't exist, try a simple select
      const { error: selectError } = await supabase
        .from('dining_halls')
        .select('count')
        .limit(1);
      
      if (selectError && !selectError.message.includes('relation')) {
        throw selectError;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw new Error('Failed to connect to Supabase database');
  }
}

