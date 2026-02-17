'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GameWithTeams, Submission } from '@/types/database'

/**
 * Hook for subscribing to real-time game updates
 */
export function useRealtimeGame(gameId: string) {
  const [game, setGame] = useState<GameWithTeams | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch initial game data
  const fetchGame = useCallback(async () => {
    if (!supabase) {
      setError(new Error('Database connection not available'))
      setIsLoading(false)
      return
    }

    try {
      // After migration 072, games reference teams instead of schools
      const { data, error: fetchError } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*)),
          sport:sports(*)
        `)
        .eq('id', gameId)
        .single()

      if (fetchError) throw fetchError

      setGame(data as GameWithTeams)
      setError(null)
    } catch (err) {
      console.error('Error fetching game:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch game'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, gameId])

  useEffect(() => {
    if (!supabase) return

    fetchGame()

    // Subscribe to real-time updates
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
        () => {
          // Refetch to get full data with relations
          fetchGame()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, fetchGame])

  return { game, isLoading, error, refetch: fetchGame }
}

/**
 * Hook for subscribing to real-time live games
 */
export function useRealtimeLiveGames() {
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch live games
  const fetchLiveGames = useCallback(async () => {
    if (!supabase) {
      setError(new Error('Database connection not available'))
      setIsLoading(false)
      return
    }

    try {
      // After migration 072, games reference teams instead of schools
      const { data, error: fetchError } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*)),
          sport:sports(*)
        `)
        .eq('status', 'in_progress')
        .order('scheduled_at', { ascending: true })

      if (fetchError) throw fetchError

      setGames(data as GameWithTeams[])
      setError(null)
    } catch (err) {
      console.error('Error fetching live games:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch live games'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!supabase) return

    fetchLiveGames()

    // Subscribe to all game updates
    const channel = supabase
      .channel('live-games')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
        },
        () => {
          fetchLiveGames()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchLiveGames])

  return { games, isLoading, error, refetch: fetchLiveGames }
}

/**
 * Hook for subscribing to game submissions (for verification UI)
 */
export function useRealtimeSubmissions(gameId: string) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  const fetchSubmissions = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSubmissions(data as Submission[])
    } catch (err) {
      console.error('Error fetching submissions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, gameId])

  useEffect(() => {
    if (!supabase) return

    fetchSubmissions()

    const channel = supabase
      .channel(`submissions-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchSubmissions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, fetchSubmissions])

  return { submissions, isLoading, refetch: fetchSubmissions }
}
