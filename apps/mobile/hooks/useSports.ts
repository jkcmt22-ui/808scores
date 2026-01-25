import { useEffect, useState, useMemo } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

export interface Sport {
  id: string
  name: string
  code: string
  display_name: string | null
  gender: 'boys' | 'girls' | 'coed'
  active: boolean
  sort_order: number
}

export interface SportCategory {
  name: string
  baseSport: string
  sports: Sport[]
  hasGenderOptions: boolean
}

export function useSports() {
  const { supabase } = useSupabase()
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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

  const categories = useMemo((): SportCategory[] => {
    const categoryMap = new Map<string, Sport[]>()

    sports.forEach((sport) => {
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

  return { sports, categories, isLoading, error }
}
