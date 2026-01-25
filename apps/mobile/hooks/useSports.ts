import { useSupabase } from '../contexts/SupabaseContext'
import { useSports as useSportsBase, type SportCategory } from '@808scores/shared'

export type { SportCategory }

export function useSports() {
  const { supabase } = useSupabase()
  return useSportsBase(supabase)
}
