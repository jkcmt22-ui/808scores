'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GameWithTeams, School, Sport } from '@/types/database'
import { calculateStandings, type LeagueStandings } from '@/lib/standings-calculator'

interface UseStandingsOptions {
  sportCode?: string
  league?: string
  season?: string
}

interface UseStandingsReturn {
  standings: LeagueStandings[]
  sport: Sport | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useStandings(options: UseStandingsOptions = {}): UseStandingsReturn {
  const { sportCode, league, season } = options
  const [standings, setStandings] = useState<LeagueStandings[]>([])
  const [sport, setSport] = useState<Sport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchStandings = useCallback(async () => {
    if (!supabase) {
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

      // Fetch sport by code if specified
      let sportId: string | null = null
      if (sportCode) {
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*')
          .eq('code', sportCode)
          .single()

        if (sportError) throw sportError
        const sport = sportData as Sport
        setSport(sport)
        sportId = sport.id
      }

      // Build games query
      let gamesQuery = supabase
        .from('games')
        .select(`
          *,
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*),
          sport:sports!games_sport_id_fkey(*)
        `)
        .eq('status', 'final')
        .eq('game_type', 'regular_season')

      if (sportId) {
        gamesQuery = gamesQuery.eq('sport_id', sportId)
      }

      // Filter by season (year from scheduled_at)
      const seasonStart = `${targetSeason}-01-01`
      const seasonEnd = `${parseInt(targetSeason) + 1}-01-01`
      gamesQuery = gamesQuery
        .gte('scheduled_at', seasonStart)
        .lt('scheduled_at', seasonEnd)

      const { data: gamesData, error: gamesError } = await gamesQuery

      if (gamesError) throw gamesError

      // Fetch all schools
      let schoolsQuery = supabase.from('schools').select('*')

      if (league) {
        schoolsQuery = schoolsQuery.eq('league', league)
      }

      const { data: schoolsData, error: schoolsError } = await schoolsQuery

      if (schoolsError) throw schoolsError

      const games = gamesData as GameWithTeams[]
      const schools = schoolsData as School[]

      // Filter standings by league if specified
      let calculatedStandings = calculateStandings(games, schools)

      if (league) {
        calculatedStandings = calculatedStandings.filter(s => s.league === league)
      }

      setStandings(calculatedStandings)
    } catch (err) {
      console.error('Error fetching standings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch standings')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, sportCode, league, season])

  useEffect(() => {
    fetchStandings()
  }, [fetchStandings])

  return { standings, sport, isLoading, error, refetch: fetchStandings }
}

// Hook to get available sports that have standings (games played)
export function useStandingsSports() {
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const fetchSports = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get current year
        const currentYear = new Date().toLocaleDateString('en-CA', {
          timeZone: 'Pacific/Honolulu',
          year: 'numeric'
        })
        const seasonStart = `${currentYear}-01-01`
        const seasonEnd = `${parseInt(currentYear) + 1}-01-01`

        // Get sports that have final regular season games
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('sport_id')
          .eq('status', 'final')
          .eq('game_type', 'regular_season')
          .gte('scheduled_at', seasonStart)
          .lt('scheduled_at', seasonEnd)

        if (gamesError) throw gamesError

        // Get unique sport IDs
        const games = gamesData as { sport_id: string }[] || []
        const sportIds = [...new Set(games.map(g => g.sport_id))]

        if (sportIds.length === 0) {
          setSports([])
          return
        }

        // Fetch those sports
        const { data: sportsData, error: sportsError } = await supabase
          .from('sports')
          .select('*')
          .in('id', sportIds)
          .eq('active', true)
          .order('sort_order')

        if (sportsError) throw sportsError

        setSports(sportsData as Sport[])
      } catch (err) {
        console.error('Error fetching standings sports:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch sports')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSports()
  }, [supabase])

  return { sports, isLoading, error }
}
