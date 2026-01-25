import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'

// Typed Supabase client for 808scores
export type TypedSupabaseClient = SupabaseClient<Database>

// Context value for providing supabase client
export interface SupabaseContextValue {
  supabase: TypedSupabaseClient | null
}
