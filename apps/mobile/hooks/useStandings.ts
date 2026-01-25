import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

export interface TeamStanding {
  school: {
    id: string
    name: string
    short_name: string
    island: string
    league: string | null
  }
  wins: number
  losses: number
  ties: number
  winPct: number
  leagueWins: number
  leagueLosses: number
  leagueTies: number
  streak: string
}

export interface LeagueStandings {
  league: string
  displayName: string
  teams: TeamStanding[]
}

interface UseStandingsOptions {
  sportCode?: string
  league?: string
}

interface UseStandingsReturn {
  standings: LeagueStandings[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

interface SeasonStandingRow {
  id: string
  school_id: string
  sport_id: string
  season_year: number
  league: string
  league_wins: number
  league_losses: number
  league_ties: number
  overall_wins: number
  overall_losses: number
  overall_ties: number
  school: {
    id: string
    name: string
    short_name: string
    island: string
    league: string | null
  }
}

export function useStandings(options: UseStandingsOptions = {}): UseStandingsReturn {
  const { sportCode, league } = options
  const { supabase } = useSupabase()
  const [standings, setStandings] = useState<LeagueStandings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStandings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current year for season - winter sports use current calendar year,
      // fall sports (like football) use previous calendar year if we're in winter
      const now = new Date()
      const currentYear = parseInt(now.toLocaleDateString('en-CA', {
        timeZone: 'Pacific/Honolulu',
        year: 'numeric'
      }))
      const currentMonth = now.getMonth() + 1 // 1-12

      // Fall sports: football (Aug-Dec) - if we're in Jan-Jul, use previous year
      const isFallSport = sportCode === 'football'
      const seasonYear = isFallSport && currentMonth < 8 ? currentYear - 1 : currentYear

      // Get sport ID if sportCode specified
      let sportId: string | null = null
      if (sportCode) {
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('id')
          .eq('code', sportCode)
          .single()

        if (sportError) throw sportError
        sportId = sportData?.id
      }

      // Fetch from season_standings table
      // If no specific sport, fetch for current year (winter sports)
      // We'll also fetch football from previous year
      let query = supabase
        .from('season_standings')
        .select(`
          *,
          school:schools(id, name, short_name, island, league)
        `)

      if (sportCode) {
        // Specific sport - use calculated season year
        query = query.eq('season_year', seasonYear)
      } else {
        // All sports - fetch both current year and previous year for fall sports
        query = query.or(`season_year.eq.${currentYear},season_year.eq.${currentYear - 1}`)
      }

      if (sportId) {
        query = query.eq('sport_id', sportId)
      }

      if (league) {
        query = query.eq('league', league)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      const seasonStandings = (data || []) as SeasonStandingRow[]

      // Group by league
      const groupedByLeague = new Map<string, TeamStanding[]>()

      for (const row of seasonStandings) {
        if (!row.school) continue

        const leagueKey = row.league
        if (!groupedByLeague.has(leagueKey)) {
          groupedByLeague.set(leagueKey, [])
        }

        const gamesPlayed = row.overall_wins + row.overall_losses + row.overall_ties
        const winPct = gamesPlayed > 0
          ? (row.overall_wins + row.overall_ties * 0.5) / gamesPlayed
          : 0

        groupedByLeague.get(leagueKey)!.push({
          school: row.school,
          wins: row.overall_wins,
          losses: row.overall_losses,
          ties: row.overall_ties,
          winPct,
          leagueWins: row.league_wins,
          leagueLosses: row.league_losses,
          leagueTies: row.league_ties,
          streak: '-',
        })
      }

      // Convert to LeagueStandings array and sort
      const result: LeagueStandings[] = []
      for (const [leagueName, teams] of groupedByLeague) {
        // Sort by league wins, then win pct
        teams.sort((a, b) => {
          if (b.leagueWins !== a.leagueWins) return b.leagueWins - a.leagueWins
          if (b.winPct !== a.winPct) return b.winPct - a.winPct
          return b.wins - a.wins
        })

        result.push({
          league: leagueName,
          displayName: leagueName,
          teams,
        })
      }

      // Sort leagues
      const leagueOrder = ['OIA East', 'OIA West', 'ILH', 'BIIF', 'MIL', 'KIF', 'Other']
      result.sort((a, b) => {
        const aIdx = leagueOrder.indexOf(a.league)
        const bIdx = leagueOrder.indexOf(b.league)
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
      })

      setStandings(result)
    } catch (err) {
      console.error('Error fetching standings:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch standings'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, sportCode, league])

  useEffect(() => {
    fetchStandings()
  }, [fetchStandings])

  return { standings, isLoading, error, refetch: fetchStandings }
}

// Hook to get sports that have standings data
export function useStandingsSports() {
  const { supabase } = useSupabase()
  const [sports, setSports] = useState<Array<{ id: string; name: string; code: string; display_name: string | null }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const currentYear = parseInt(new Date().toLocaleDateString('en-CA', {
          timeZone: 'Pacific/Honolulu',
          year: 'numeric'
        }))

        // Get sport IDs that have standings for current year OR previous year (for fall sports)
        const { data: standingsData } = await supabase
          .from('season_standings')
          .select('sport_id')
          .or(`season_year.eq.${currentYear},season_year.eq.${currentYear - 1}`)

        const sportIds = [...new Set((standingsData || []).map(s => s.sport_id))]

        if (sportIds.length === 0) {
          setSports([])
          setIsLoading(false)
          return
        }

        const { data: sportsData } = await supabase
          .from('sports')
          .select('id, name, code, display_name')
          .in('id', sportIds)
          .eq('active', true)
          .order('sort_order')

        setSports(sportsData || [])
      } catch (err) {
        console.error('Error fetching standings sports:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSports()
  }, [supabase])

  return { sports, isLoading }
}
