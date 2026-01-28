'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School, Player } from '@/types/database'

export type SearchResultType = 'school' | 'player' | 'game'

export interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  subtitle: string
  url: string
  icon?: string
  metadata?: Record<string, unknown>
}

interface UseSearchOptions {
  debounceMs?: number
  limit?: number
}

interface UseSearchReturn {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  query: string
  setQuery: (query: string) => void
  clear: () => void
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { debounceMs = 300, limit = 20 } = options

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || !supabase) {
      setResults([])
      setIsLoading(false)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const performSearch = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const searchTerm = debouncedQuery.toLowerCase()
        const searchResults: SearchResult[] = []

        // Search schools
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,short_name.ilike.%${searchTerm}%,mascot.ilike.%${searchTerm}%`)
          .limit(limit)

        if (schoolsError) throw schoolsError

        const schools = schoolsData as School[] || []
        for (const school of schools) {
          searchResults.push({
            type: 'school',
            id: school.id,
            title: school.name,
            subtitle: `${school.mascot || ''} • ${school.island}${school.league ? ` • ${school.league}` : ''}`.replace(/^ • /, ''),
            url: `/school/${school.id}`,
            icon: '🏫',
            metadata: { school }
          })
        }

        // Search players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select(`
            *,
            school:schools(id, name, short_name)
          `)
          .eq('is_active', true)
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
          .limit(limit)

        if (playersError) throw playersError

        type PlayerWithSchool = Player & { school?: { id: string; name: string; short_name: string } | null }
        const players = playersData as PlayerWithSchool[] || []
        for (const player of players) {
          const school = player.school
          searchResults.push({
            type: 'player',
            id: player.id,
            title: `${player.first_name} ${player.last_name}`,
            subtitle: school?.name || 'Unknown School',
            url: school ? `/school/${school.id}?tab=roster` : '#',
            icon: '👤',
            metadata: { player, school }
          })
        }

        // Limit total results
        setResults(searchResults.slice(0, limit))
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Search error:', err)
          setError(err instanceof Error ? err.message : 'Search failed')
        }
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedQuery, supabase, limit])

  const clear = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    isLoading,
    error,
    query,
    setQuery,
    clear
  }
}

// Group results by type for display
export function groupSearchResults(results: SearchResult[]): Record<SearchResultType, SearchResult[]> {
  const grouped: Record<SearchResultType, SearchResult[]> = {
    school: [],
    player: [],
    game: []
  }

  for (const result of results) {
    grouped[result.type].push(result)
  }

  return grouped
}

// Get display label for result type
export function getResultTypeLabel(type: SearchResultType): string {
  switch (type) {
    case 'school':
      return 'Schools'
    case 'player':
      return 'Players'
    case 'game':
      return 'Games'
    default:
      return type
  }
}
