import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

// Types inline to avoid shared package React issues
// After migration 072, home_team and away_team are TeamWithSchool objects
interface SchoolData {
  id: string
  name: string
  short_name: string
  island: string
}

interface TeamWithSchool {
  id: string
  school_id: string
  school: SchoolData
}

export interface GameWithTeamsAndCount {
  id: string
  sport_id: string
  home_team_id: string
  away_team_id: string
  scheduled_at: string
  venue: string | null
  status: 'scheduled' | 'in_progress' | 'final' | 'postponed' | 'canceled'
  current_period: string | null
  home_score: number
  away_score: number
  is_overtime: boolean
  game_type: string
  home_team: TeamWithSchool
  away_team: TeamWithSchool
  sport: {
    id: string
    name: string
    code: string
    display_name: string | null
    gender: string
  }
  message_count: number
}

// Helper to get school from team
export function getSchoolFromTeam(team: TeamWithSchool): SchoolData {
  return team.school
}

interface UseGamesOptions {
  date?: Date
  sportCode?: string
  status?: string
}

export function useGames(options: UseGamesOptions = {}) {
  const { supabase } = useSupabase()
  const [games, setGames] = useState<GameWithTeamsAndCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Convert date to string for stable dependency
  const dateStr = options.date
    ? options.date.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
    : null

  const fetchGames = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // After migration 072, games reference teams instead of schools
      let query = supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*))
        `)
        .order('scheduled_at', { ascending: true })

      // Filter by date if provided (Hawaii timezone)
      if (dateStr) {
        const startOfDay = new Date(`${dateStr}T00:00:00-10:00`)
        const endOfDay = new Date(`${dateStr}T23:59:59-10:00`)

        query = query
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      const gamesData = (data || []) as GameWithTeamsAndCount[]

      // Fetch message counts
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
    } catch (err) {
      console.error('Error fetching games:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch games'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, dateStr, options.status])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  return { games, isLoading, error, refetch: fetchGames }
}

export function useLiveGames() {
  const { supabase } = useSupabase()
  const [games, setGames] = useState<GameWithTeamsAndCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLiveGames = async () => {
      // After migration 072, games reference teams instead of schools
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*))
        `)
        .eq('status', 'in_progress')
        .order('scheduled_at', { ascending: true })

      if (!error && data) {
        const gamesData = data as GameWithTeamsAndCount[]

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

export function useGame(gameId: string) {
  const { supabase } = useSupabase()
  const [game, setGame] = useState<GameWithTeamsAndCount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setIsLoading(false)
      return
    }

    const fetchGame = async () => {
      setIsLoading(true)

      // After migration 072, games reference teams instead of schools
      const { data, error: queryError } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*))
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
          ...(data as GameWithTeamsAndCount),
          message_count: count || 0
        })
      }
      setIsLoading(false)
    }

    fetchGame()

    // Subscribe to updates
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
            return {
              ...current,
              ...payload.new,
              home_team: current.home_team,
              away_team: current.away_team,
              sport: current.sport,
              message_count: current.message_count,
            } as GameWithTeamsAndCount
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
