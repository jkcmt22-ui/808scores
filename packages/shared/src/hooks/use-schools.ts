import { useEffect, useState, useCallback } from 'react'
import type { TypedSupabaseClient } from '../lib/supabase/types'
import type { School } from '../types/database'

export function useSchools(supabase: TypedSupabaseClient | null) {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSchools = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true })

      if (queryError) throw queryError

      setSchools((data as School[]) || [])
    } catch (err) {
      console.error('Error fetching schools:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch schools'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  // Get a single school by ID
  const getSchoolById = (id: string): School | undefined => {
    return schools.find((s) => s.id === id)
  }

  // Get schools by island
  const getSchoolsByIsland = (island: string): School[] => {
    return schools.filter((s) => s.island === island)
  }

  // Get schools by league
  const getSchoolsByLeague = (league: string): School[] => {
    return schools.filter((s) => s.league === league)
  }

  return {
    schools,
    isLoading,
    error,
    refetch: fetchSchools,
    getSchoolById,
    getSchoolsByIsland,
    getSchoolsByLeague,
  }
}
