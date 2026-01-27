'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { School } from '@/types/database'

/**
 * React Query hook for fetching all schools with caching
 */
export function useQuerySchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name')

      if (error) throw error
      return data as School[]
    },
    staleTime: 5 * 60 * 1000, // Schools rarely change, cache for 5 minutes
  })
}

/**
 * React Query hook for fetching a single school
 */
export function useQuerySchool(schoolId: string) {
  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single()

      if (error) throw error
      return data as School
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * React Query hook for fetching schools by league
 */
export function useQuerySchoolsByLeague(league: string) {
  return useQuery({
    queryKey: ['schools', 'league', league],
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('league', league)
        .order('name')

      if (error) throw error
      return data as School[]
    },
    enabled: !!league,
    staleTime: 5 * 60 * 1000,
  })
}
