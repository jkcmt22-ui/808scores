'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GameWithTeams, Sport } from '@/types/database'

export interface ScheduleGame extends GameWithTeams {
  isHome: boolean
  result: 'W' | 'L' | 'T' | null
}

export interface SportSchedule {
  sport: Sport
  games: ScheduleGame[]
  record: {
    wins: number
    losses: number
    ties: number
  }
}

interface UseSchoolScheduleReturn {
  schedules: SportSchedule[]
  allGames: ScheduleGame[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSchoolSchedule(
  schoolId: string | null,
  season?: string
): UseSchoolScheduleReturn {
  const [schedules, setSchedules] = useState<SportSchedule[]>([])
  const [allGames, setAllGames] = useState<ScheduleGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchSchedule = useCallback(async () => {
    if (!supabase || !schoolId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get current year for default season
      const currentYear = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Pacific/Honolulu',
        year: 'numeric'
      })
      const targetSeason = season || currentYear

      // Build date range for the season
      const seasonStart = `${targetSeason}-01-01`
      const seasonEnd = `${parseInt(targetSeason) + 1}-01-01`

      // Fetch all games for this school in the season
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*),
          sport:sports!games_sport_id_fkey(*)
        `)
        .or(`home_team_id.eq.${schoolId},away_team_id.eq.${schoolId}`)
        .gte('scheduled_at', seasonStart)
        .lt('scheduled_at', seasonEnd)
        .order('scheduled_at', { ascending: true })

      if (gamesError) throw gamesError

      const games = gamesData as GameWithTeams[]

      // Process games to add isHome and result
      const processedGames: ScheduleGame[] = games.map(game => {
        const isHome = game.home_team_id === schoolId

        let result: 'W' | 'L' | 'T' | null = null
        if (game.status === 'final') {
          const schoolScore = isHome ? game.home_score : game.away_score
          const opponentScore = isHome ? game.away_score : game.home_score

          if (schoolScore > opponentScore) {
            result = 'W'
          } else if (opponentScore > schoolScore) {
            result = 'L'
          } else {
            result = 'T'
          }
        }

        return {
          ...game,
          isHome,
          result
        }
      })

      setAllGames(processedGames)

      // Group by sport
      const sportMap = new Map<string, { sport: Sport; games: ScheduleGame[] }>()

      for (const game of processedGames) {
        const sportId = game.sport.id
        if (!sportMap.has(sportId)) {
          sportMap.set(sportId, { sport: game.sport, games: [] })
        }
        sportMap.get(sportId)!.games.push(game)
      }

      // Calculate records and create schedules
      const sportSchedules: SportSchedule[] = Array.from(sportMap.values()).map(
        ({ sport, games }) => {
          const record = { wins: 0, losses: 0, ties: 0 }

          for (const game of games) {
            if (game.result === 'W') record.wins++
            else if (game.result === 'L') record.losses++
            else if (game.result === 'T') record.ties++
          }

          return { sport, games, record }
        }
      )

      // Sort by sport sort_order
      sportSchedules.sort((a, b) => a.sport.sort_order - b.sport.sort_order)

      setSchedules(sportSchedules)
    } catch (err) {
      console.error('Error fetching school schedule:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, schoolId, season])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  return { schedules, allGames, isLoading, error, refetch: fetchSchedule }
}
