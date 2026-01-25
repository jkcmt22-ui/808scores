import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

export interface School {
  id: string
  name: string
  short_name: string
  mascot: string | null
  island: string
  league: string | null
  division: string | null
}

export function useSchools() {
  const { supabase } = useSupabase()
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSchools = useCallback(async () => {
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

  return { schools, isLoading, error, refetch: fetchSchools }
}
