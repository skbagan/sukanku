import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Fallback to dummy values if not configured to prevent crash
// The actual usage is guarded by isSupabaseConfigured()
const urlToUse = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const keyToUse = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(urlToUse, keyToUse);
