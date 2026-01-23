'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Sport, SportGender } from '@/types/database'

export interface SportCategory {
  name: string
  baseSport: string
  sports: Sport[]
  hasGenderOptions: boolean
}

export function useSports() {
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient()!, [])

  useEffect(() => {
    const fetchSports = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: queryError } = await supabase
          .from('sports')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (queryError) throw queryError

        setSports((data as Sport[]) || [])
      } catch (err) {
        console.error('Error fetching sports:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch sports'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSports()
  }, [supabase])

  // Group sports by category for UI display
  const categories = useMemo((): SportCategory[] => {
    const categoryMap = new Map<string, Sport[]>()

    sports.forEach((sport) => {
      // Use the base name (e.g., "Basketball" not "Boys Basketball")
      const baseName = sport.name
      if (!categoryMap.has(baseName)) {
        categoryMap.set(baseName, [])
      }
      categoryMap.get(baseName)!.push(sport)
    })

    return Array.from(categoryMap.entries()).map(([name, sportsInCategory]) => ({
      name,
      baseSport: name.toLowerCase(),
      sports: sportsInCategory.sort((a, b) => a.sort_order - b.sort_order),
      hasGenderOptions: sportsInCategory.length > 1,
    }))
  }, [sports])

  // Get sports by gender filter
  const getSportsByGender = (gender: SportGender | 'all'): Sport[] => {
    if (gender === 'all') return sports
    return sports.filter((s) => s.gender === gender)
  }

  // Get a single sport by code
  const getSportByCode = (code: string): Sport | undefined => {
    return sports.find((s) => s.code === code)
  }

  return {
    sports,
    categories,
    isLoading,
    error,
    getSportsByGender,
    getSportByCode,
  }
}
