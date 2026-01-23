'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School } from '@/types/database'

interface UseSchoolsReturn {
  schools: School[]
  isLoading: boolean
  error: string | null
}

export function useSchools(): UseSchoolsReturn {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()!

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('schools')
          .select('*')
          .order('name')

        if (fetchError) throw fetchError

        setSchools(data as School[])
      } catch (err) {
        console.error('Error fetching schools:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch schools')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchools()
  }, [supabase])

  return { schools, isLoading, error }
}
