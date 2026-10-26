import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = config.supabase.url;
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;

  if (!url || !key) {
    return null;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseAvailable(): boolean {
  return getSupabase() !== null;
}

export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  url?: string;
  authStatus?: string;
  error?: string;
}> {
  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      error: 'Supabase URL or Key not configured.',
    };
  }

  try {
    const { data, error } = await client.auth.getSession();
    if (error && !error.message.includes('Auth session missing')) {
      return {
        connected: false,
        url: config.supabase.url,
        error: error.message,
      };
    }

    return {
      connected: true,
      url: config.supabase.url,
      authStatus: 'operational',
    };
  } catch (err: any) {
    return {
      connected: false,
      url: config.supabase.url,
      error: err.message || 'Connection failed',
    };
  }
}
