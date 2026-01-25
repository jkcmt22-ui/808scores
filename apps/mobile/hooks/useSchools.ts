import { useSupabase } from '../contexts/SupabaseContext'
import { useSchools as useSchoolsBase } from '@808scores/shared'

export function useSchools() {
  const { supabase } = useSupabase()
  return useSchoolsBase(supabase)
}
