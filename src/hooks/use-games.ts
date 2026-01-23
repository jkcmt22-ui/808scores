'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GameWithTeams, SportGender, GameType } from '@/types/database'

interface UseGamesOptions {
  date?: Date
  sportCode?: string
  status?: string
  gender?: SportGender
  gameTypes?: GameType[]
  excludeGameTypes?: GameType[]
}

export function useGames(options: UseGamesOptions = {}) {
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Memoize the supabase client
  const supabase = useMemo(() => createClient()!, [])

  const fetchGames = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: true })

      // Filter by date if provided
      // Use Hawaii timezone (HST = UTC-10) for date filtering
      if (options.date) {
        // Format the date as YYYY-MM-DD in Hawaii time
        const dateStr = options.date.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })

        // Create start and end times in Hawaii timezone (UTC-10)
        const startOfDay = new Date(`${dateStr}T00:00:00-10:00`)
        const endOfDay = new Date(`${dateStr}T23:59:59-10:00`)

        query = query
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
      }

      // Filter by sport if provided
      if (options.sportCode && options.sportCode !== 'all') {
        // First try exact code match
        const { data: exactMatch } = await supabase
          .from('sports')
          .select('id')
          .eq('code', options.sportCode)
          .eq('active', true)
          .single()

        if (exactMatch && 'id' in exactMatch) {
          query = query.eq('sport_id', (exactMatch as { id: string }).id)
        } else {
          // Try matching by base sport name (e.g., "basketball" matches "boys-basketball" and "girls-basketball")
          const { data: matchingSports } = await supabase
            .from('sports')
            .select('id')
            .eq('active', true)
            .ilike('name', `%${options.sportCode}%`)

          if (matchingSports && matchingSports.length > 0) {
            const sportIds = (matchingSports as Array<{ id: string }>).map((s) => s.id)
            if (sportIds.length === 1) {
              query = query.eq('sport_id', sportIds[0])
            } else {
              query = query.in('sport_id', sportIds)
            }
          }
        }
      }

      // Filter by gender if provided
      if (options.gender) {
        const { data: genderSports } = await supabase
          .from('sports')
          .select('id')
          .eq('gender', options.gender)
          .eq('active', true)

        if (genderSports && genderSports.length > 0) {
          const sportIds = (genderSports as Array<{ id: string }>).map((s) => s.id)
          query = query.in('sport_id', sportIds)
        }
      }

      // Filter by status if provided
      if (options.status) {
        query = query.eq('status', options.status)
      }

      // Filter by game types if provided
      if (options.gameTypes && options.gameTypes.length > 0) {
        query = query.in('game_type', options.gameTypes)
      }

      // Exclude certain game types if provided
      if (options.excludeGameTypes && options.excludeGameTypes.length > 0) {
        for (const excludeType of options.excludeGameTypes) {
          query = query.neq('game_type', excludeType)
        }
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setGames((data as GameWithTeams[]) || [])
    } catch (err) {
      console.error('Error fetching games:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch games'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.date, options.sportCode, options.status, options.gender, options.gameTypes, options.excludeGameTypes])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('games-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setGames((current) =>
              current.map((game) =>
                game.id === payload.new.id
                  ? { ...game, ...payload.new }
                  : game
              )
            )
          } else if (payload.eventType === 'INSERT') {
            // Refetch to get full game with relations
            fetchGames()
          } else if (payload.eventType === 'DELETE') {
            setGames((current) =>
              current.filter((game) => game.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchGames])

  return {
    games,
    isLoading,
    error,
    refetch: fetchGames,
  }
}

export function useLiveGames() {
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = useMemo(() => createClient()!, [])

  useEffect(() => {
    const fetchLiveGames = async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .eq('status', 'in_progress')
        .order('scheduled_at', { ascending: true })

      if (!error && data) {
        setGames(data as GameWithTeams[])
      }
      setIsLoading(false)
    }

    fetchLiveGames()

    // Subscribe to live game updates
    const channel = supabase
      .channel('live-games')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: 'status=eq.in_progress',
        },
        () => {
          fetchLiveGames()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { games, isLoading }
}

export function useGame(gameId: string) {
  const [game, setGame] = useState<GameWithTeams | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient()!, [])

  useEffect(() => {
    const fetchGame = async () => {
      setIsLoading(true)

      const { data, error: queryError } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .eq('id', gameId)
        .single()

      if (queryError) {
        setError(queryError)
      } else {
        setGame(data as GameWithTeams)
      }
      setIsLoading(false)
    }

    if (gameId) {
      fetchGame()
    }

    // Subscribe to updates for this specific game
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame((current) =>
            current ? { ...current, ...payload.new } : null
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId])

  return { game, isLoading, error }
}
