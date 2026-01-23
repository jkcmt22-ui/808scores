import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Singleton instance for client-side
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // During build time or SSG, env vars may not be available
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return null during build/SSG - components should handle this
    return null
  }

  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient<Database>(url, key)

  return supabaseInstance
}
