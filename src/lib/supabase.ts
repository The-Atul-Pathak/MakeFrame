import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client.
 *
 * Configuration comes exclusively from environment variables so that the same
 * build can target local, staging, and production without code changes. We fail
 * fast on a missing/placeholder configuration rather than silently falling back
 * to a hardcoded localhost instance — a misconfigured production deploy should
 * crash loudly at startup, not quietly talk to the wrong database.
 *
 * For local development, copy `.env.example` to `.env` and fill in the values
 * from `supabase status` (or your hosted project's API settings).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function assertConfigured(value: string | undefined, name: string): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Copy .env.example to .env and provide a value (see README.md → Setup).`,
    )
  }
  return value
}

export const supabase = createClient(
  assertConfigured(supabaseUrl, 'VITE_SUPABASE_URL'),
  assertConfigured(supabaseAnonKey, 'VITE_SUPABASE_ANON_KEY'),
  {
    auth: {
      // Persist the session in localStorage and transparently refresh tokens so
      // users stay signed in across reloads and tabs.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
