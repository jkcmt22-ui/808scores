'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { GameWithTeams } from '@/types/database'

/**
 * React Query hook for fetching games with caching
 * Use this for pages where stale data is acceptable for better performance
 */
export function useQueryGames(options: {
  date?: string
  sportId?: string
  status?: 'scheduled' | 'in_progress' | 'final'
  limit?: number
} = {}) {
  const { date, sportId, status, limit = 50 } = options

  return useQuery({
    queryKey: ['games', { date, sportId, status, limit }],
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not available')
      let query = supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: true })
        .limit(limit)

      if (date) {
        const startOfDay = `${date}T00:00:00`
        const endOfDay = `${date}T23:59:59`
        query = query.gte('scheduled_at', startOfDay).lte('scheduled_at', endOfDay)
      }

      if (sportId) {
        query = query.eq('sport_id', sportId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data as GameWithTeams[]
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * React Query hook for fetching live games with frequent refetching
 */
export function useQueryLiveGames() {
  return useQuery({
    queryKey: ['games', 'live'],
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not available')
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

      if (error) throw error
      return data as GameWithTeams[]
    },
    staleTime: 10 * 1000, // 10 seconds for live data
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  })
}

/**
 * React Query hook for fetching a single game
 */
export function useQueryGame(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*),
          tournament:tournaments(*)
        `)
        .eq('id', gameId)
        .single()

      if (error) throw error
      return data as GameWithTeams
    },
    enabled: !!gameId,
    staleTime: 30 * 1000,
  })
}
