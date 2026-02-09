'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School } from '@/types/database'

export interface UseSchoolsOptions {
  island?: string
  league?: string
  division?: string
  search?: string
}

interface UseSchoolsReturn {
  schools: School[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSchools(options: UseSchoolsOptions = {}): UseSchoolsReturn {
  const { island, league, division, search } = options
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchSchools = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('schools')
        .select('*')
        .order('name')

      // Apply filters
      if (island) {
        query = query.eq('island', island)
      }

      if (league) {
        query = query.eq('league', league)
      }

      if (division) {
        query = query.eq('division', division)
      }

      if (search) {
        // Search by name, short_name, or mascot — sanitize PostgREST filter chars
        const sanitized = search.replace(/[,()]/g, '')
        query = query.or(`name.ilike.%${sanitized}%,short_name.ilike.%${sanitized}%,mascot.ilike.%${sanitized}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setSchools(data as School[])
    } catch (err) {
      console.error('Error fetching schools:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch schools')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, island, league, division, search])

  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  return { schools, isLoading, error, refetch: fetchSchools }
}

// Hook to get a single school by ID
export function useSchool(schoolId: string | null) {
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!supabase || !schoolId) {
      setIsLoading(false)
      return
    }

    const fetchSchool = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', schoolId)
          .single()

        if (fetchError) throw fetchError

        setSchool(data as School)
      } catch (err) {
        console.error('Error fetching school:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch school')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchool()
  }, [supabase, schoolId])

  return { school, isLoading, error }
}

// Hook to get schools grouped by league
export function useSchoolsByLeague() {
  const { schools, isLoading, error } = useSchools()

  const schoolsByLeague = useMemo(() => {
    const grouped: Record<string, School[]> = {}

    for (const school of schools) {
      const league = school.league || 'Other'
      if (!grouped[league]) {
        grouped[league] = []
      }
      grouped[league].push(school)
    }

    return grouped
  }, [schools])

  return { schoolsByLeague, isLoading, error }
}

// Hook to get schools grouped by island
export function useSchoolsByIsland() {
  const { schools, isLoading, error } = useSchools()

  const schoolsByIsland = useMemo(() => {
    const grouped: Record<string, School[]> = {}

    for (const school of schools) {
      const island = school.island || 'Other'
      if (!grouped[island]) {
        grouped[island] = []
      }
      grouped[island].push(school)
    }

    return grouped
  }, [schools])

  return { schoolsByIsland, isLoading, error }
}
