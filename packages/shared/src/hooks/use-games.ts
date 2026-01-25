import { useEffect, useState, useCallback, useMemo } from 'react'
import type { TypedSupabaseClient } from '../lib/supabase/types'
import type { GameWithTeams, SportGender, GameType } from '../types/database'

// Extended type that includes message count
export type GameWithTeamsAndCount = GameWithTeams & { message_count: number }

interface UseGamesOptions {
  date?: Date
  sportCode?: string
  status?: string
  gender?: SportGender
  gameTypes?: GameType[]
  excludeGameTypes?: GameType[]
}

export function useGames(supabase: TypedSupabaseClient | null, options: UseGamesOptions = {}) {
  const [games, setGames] = useState<GameWithTeamsAndCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGames = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

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
          // Try matching by base sport name
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

      const gamesData = (data as GameWithTeams[]) || []

      // Fetch message counts for these games
      if (gamesData.length > 0) {
        const gameIds = gamesData.map(g => g.id)
        const { data: messageCounts } = await supabase
          .from('chat_messages')
          .select('game_id')
          .in('game_id', gameIds)

        // Count messages per game
        const countMap: Record<string, number> = {}
        if (messageCounts) {
          for (const msg of messageCounts as { game_id: string }[]) {
            countMap[msg.game_id] = (countMap[msg.game_id] || 0) + 1
          }
        }

        // Merge counts into games
        const gamesWithCounts: GameWithTeamsAndCount[] = gamesData.map(game => ({
          ...game,
          message_count: countMap[game.id] || 0
        }))

        setGames(gamesWithCounts)
      } else {
        setGames([])
      }
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
    if (!supabase) return

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
              current.map((game) => {
                if (game.id !== payload.new.id) return game
                const updatedFields = payload.new as Record<string, unknown>
                return {
                  ...game,
                  ...updatedFields,
                  home_team: game.home_team,
                  away_team: game.away_team,
                  sport: game.sport,
                  message_count: game.message_count,
                }
              })
            )
          } else if (payload.eventType === 'INSERT') {
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

export function useLiveGames(supabase: TypedSupabaseClient | null) {
  const [games, setGames] = useState<GameWithTeamsAndCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

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
        const gamesData = data as GameWithTeams[]

        if (gamesData.length > 0) {
          const gameIds = gamesData.map(g => g.id)
          const { data: messageCounts } = await supabase
            .from('chat_messages')
            .select('game_id')
            .in('game_id', gameIds)

          const countMap: Record<string, number> = {}
          if (messageCounts) {
            for (const msg of messageCounts as { game_id: string }[]) {
              countMap[msg.game_id] = (countMap[msg.game_id] || 0) + 1
            }
          }

          setGames(gamesData.map(game => ({
            ...game,
            message_count: countMap[game.id] || 0
          })))
        } else {
          setGames([])
        }
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

export function useGame(supabase: TypedSupabaseClient | null, gameId: string) {
  const [game, setGame] = useState<GameWithTeamsAndCount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!supabase || !gameId) {
      setIsLoading(false)
      return
    }

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
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('game_id', gameId)

        setGame({
          ...(data as GameWithTeams),
          message_count: count || 0
        })
      }
      setIsLoading(false)
    }

    fetchGame()

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
          setGame((current) => {
            if (!current) return null
            const updatedFields = payload.new as Record<string, unknown>
            return {
              ...current,
              ...updatedFields,
              home_team: current.home_team,
              away_team: current.away_team,
              sport: current.sport,
              message_count: current.message_count,
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId])

  return { game, isLoading, error }
}
