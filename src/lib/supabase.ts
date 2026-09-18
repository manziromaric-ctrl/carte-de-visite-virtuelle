import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_STORAGE_KEY = 'kongo_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName?: string;
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: 'https://tcdnsdupjqglczuqndbq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZG5zZHVwanFnbGN6dXFuZGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NTY3NjMsImV4cCI6MjEwNTMzMjc2M30.Jky0YlF_Pib2oTSlFEMMaFmZaGT8-A-MuY13MxxoxnY',
  tableName: 'digital_cards',
};

export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_CONFIG.url;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_CONFIG.anonKey;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return {
            url: parsed.url,
            anonKey: parsed.anonKey,
            tableName: parsed.tableName || 'digital_cards',
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: 'digital_cards',
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

export { runSupabasePermissionsTest, SUPABASE_FIX_SQL } from '../utils/supabaseTester';
export type { SupabaseTestReport, SupabaseTestStep } from '../utils/supabaseTester';
