import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://twrhkwksbzwlhexjfuti.supabase.co';
const defaultKey = 'sb_publishable_xdnpG-yyQkCyl3siqLiLYw_vLENRNis';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'trustlens-supabase-auth',
      },
    });
  } catch (err) {
    console.warn('Failed to initialize client-side Supabase:', err);
  }
}

export const supabase = client;

export function isSupabaseConfigured(): boolean {
  return client !== null;
}
