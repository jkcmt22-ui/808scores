'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School, Sport } from '@/types/database'
import { type LeagueStandings, type TeamStanding } from '@/lib/standings-calculator'

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

// Row type returned by get_computed_standings RPC
interface ComputedStandingRow {
  school_id: string
  school_name: string
  school_short_name: string
  league: string | null
  division: string | null
  region: string | null
  overall_wins: number
  overall_losses: number
  overall_ties: number
  league_wins: number
  league_losses: number
  league_ties: number
  points_for: number
  points_against: number
}

// Helper to convert season year to TEXT format (e.g., "2025-2026")
function getSeasonYearText(year: number, season: string | null): string {
  // Fall sports span two calendar years (e.g., fall 2025 = "2025-2026")
  // Winter sports also span (e.g., winter 2025-26 = "2025-2026")
  // Spring sports are single year (e.g., spring 2026 = "2025-2026")
  if (season === 'spring') {
    return `${year - 1}-${year}`
  }
  return `${year}-${year + 1}`
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
      const currentYear = parseInt(new Date().toLocaleDateString('en-CA', {
        timeZone: 'Pacific/Honolulu',
        year: 'numeric'
      }))

      // Fetch sport by code if specified
      let currentSport: Sport | null = null
      if (sportCode) {
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*')
          .eq('code', sportCode)
          .single()

        if (sportError) throw sportError
        currentSport = sportData as Sport
        setSport(currentSport)
      }

      // If no sport selected, can't compute standings
      if (!currentSport) {
        setStandings([])
        setIsLoading(false)
        return
      }

      // Determine target season year in TEXT format
      const targetYear = season ? parseInt(season) : currentYear
      const seasonYearText = getSeasonYearText(targetYear, currentSport.season)

      // Call the new computed standings function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: standingsData, error: standingsError } = await (supabase.rpc as any)('get_computed_standings', {
        p_sport_id: currentSport.id,
        p_gender: currentSport.gender,
        p_season_year: seasonYearText,
        p_league: league || null
      })

      if (standingsError) {
        // If function doesn't exist, fall back to legacy behavior
        if (standingsError.message.includes('function') || standingsError.code === '42883') {
          console.warn('get_computed_standings function not found, falling back to legacy')
          await fetchLegacyStandings(currentSport, targetYear, league)
          return
        }
        throw standingsError
      }

      const rows = standingsData as ComputedStandingRow[]

      // Group standings by league -> division -> region
      const groupedStandings = new Map<string, {
        league: string
        division: string | null
        region: string | null
        teams: TeamStanding[]
      }>()

      for (const row of rows) {
        // Create group key
        const leagueKey = row.league || 'Other'
        const divisionKey = row.division || ''
        const regionKey = row.region || ''
        const groupKey = `${leagueKey}|${divisionKey}|${regionKey}`

        if (!groupedStandings.has(groupKey)) {
          groupedStandings.set(groupKey, {
            league: leagueKey,
            division: row.division,
            region: row.region,
            teams: []
          })
        }

        // Calculate win percentages
        const gamesPlayed = row.overall_wins + row.overall_losses + row.overall_ties
        const winPct = gamesPlayed > 0
          ? (row.overall_wins + row.overall_ties * 0.5) / gamesPlayed
          : 0

        const leagueGamesPlayed = row.league_wins + row.league_losses + row.league_ties
        const leagueWinPct = leagueGamesPlayed > 0
          ? (row.league_wins + row.league_ties * 0.5) / leagueGamesPlayed
          : 0

        // Fetch school colors (we need to make a separate call for this)
        // For now, create a minimal school object
        const school: School = {
          id: row.school_id,
          name: row.school_name,
          short_name: row.school_short_name,
          mascot: null,
          island: '',
          league: row.league,
          division: row.division,
          colors: null,
          logo_url: null,
          created_at: ''
        }

        groupedStandings.get(groupKey)!.teams.push({
          school,
          wins: row.overall_wins,
          losses: row.overall_losses,
          ties: row.overall_ties,
          winPct,
          pointsFor: row.points_for,
          pointsAgainst: row.points_against,
          pointDiff: row.points_for - row.points_against,
          streak: '-', // Not computed by the function for performance
          gamesPlayed,
          leagueWins: row.league_wins,
          leagueLosses: row.league_losses,
          leagueTies: row.league_ties,
          leagueWinPct,
          leagueGamesPlayed
        })
      }

      // Convert to LeagueStandings array
      const result: LeagueStandings[] = []
      for (const [, group] of groupedStandings) {
        // Sort teams by league win%, then league wins, then overall win%
        group.teams.sort((a, b) => {
          if (b.leagueWinPct !== a.leagueWinPct) return b.leagueWinPct - a.leagueWinPct
          if (b.leagueWins !== a.leagueWins) return b.leagueWins - a.leagueWins
          if (b.winPct !== a.winPct) return b.winPct - a.winPct
          if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
          return b.pointsFor - a.pointsFor
        })

        // Create display name
        let displayName = group.league
        if (group.division) {
          displayName += ` ${group.division}`
        }
        if (group.region) {
          displayName += ` ${group.region}`
        }

        result.push({
          league: group.league,
          division: group.division,
          region: group.region,
          displayName,
          teams: group.teams
        })
      }

      // Sort groups by league name, then division, then region
      result.sort((a, b) => {
        const leagueOrder = ['OIA', 'ILH', 'BIIF', 'MIL', 'KIF', 'Other']
        const aLeagueIdx = leagueOrder.indexOf(a.league)
        const bLeagueIdx = leagueOrder.indexOf(b.league)

        if (aLeagueIdx !== bLeagueIdx) {
          return (aLeagueIdx === -1 ? 999 : aLeagueIdx) - (bLeagueIdx === -1 ? 999 : bLeagueIdx)
        }

        // Open division first, then Division I, II, III
        const divOrder = ['Open', 'Division I', 'Division II', 'Division III']
        const aDivIdx = a.division ? divOrder.indexOf(a.division) : -1
        const bDivIdx = b.division ? divOrder.indexOf(b.division) : -1

        if (aDivIdx !== bDivIdx) {
          return (aDivIdx === -1 ? 999 : aDivIdx) - (bDivIdx === -1 ? 999 : bDivIdx)
        }

        // East before West
        if (a.region && b.region) {
          return a.region.localeCompare(b.region)
        }

        return 0
      })

      // Fetch school colors in bulk
      const schoolIds = rows.map(r => r.school_id)
      if (schoolIds.length > 0) {
        const { data: schoolsData } = await supabase
          .from('schools')
          .select('id, colors')
          .in('id', schoolIds)

        if (schoolsData) {
          const colorsMap = new Map((schoolsData as { id: string; colors: unknown }[]).map(s => [s.id, s.colors]))
          for (const group of result) {
            for (const team of group.teams) {
              const colors = colorsMap.get(team.school.id)
              if (colors) {
                team.school.colors = colors as School['colors']
              }
            }
          }
        }
      }

      setStandings(result)
    } catch (err) {
      console.error('Error fetching standings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch standings')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, sportCode, league, season])

  // Legacy fallback function for when get_computed_standings doesn't exist
  const fetchLegacyStandings = async (currentSport: Sport, targetYear: number, leagueFilter: string | undefined) => {
    if (!supabase) return

    try {
      // First, try to fetch from season_standings table
      let standingsQuery = supabase
        .from('season_standings')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('season_year', targetYear)
        .eq('sport_id', currentSport.id)

      if (leagueFilter) {
        standingsQuery = standingsQuery.eq('league', leagueFilter)
      }

      const { data: standingsData, error: standingsError } = await standingsQuery

      if (standingsError) throw standingsError

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
        points: number | null
        school: School
      }

      const seasonStandings = standingsData as SeasonStandingRow[]

      if (seasonStandings && seasonStandings.length > 0) {
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

          const leagueGamesPlayed = row.league_wins + row.league_losses + row.league_ties
          const leagueWinPct = leagueGamesPlayed > 0
            ? (row.league_wins + row.league_ties * 0.5) / leagueGamesPlayed
            : 0

          groupedByLeague.get(leagueKey)!.push({
            school: row.school,
            wins: row.overall_wins,
            losses: row.overall_losses,
            ties: row.overall_ties,
            winPct,
            pointsFor: 0,
            pointsAgainst: 0,
            pointDiff: 0,
            streak: '-',
            gamesPlayed,
            leagueWins: row.league_wins,
            leagueLosses: row.league_losses,
            leagueTies: row.league_ties,
            leagueWinPct,
            leagueGamesPlayed
          })
        }

        // Convert to LeagueStandings array
        const result: LeagueStandings[] = []
        for (const [leagueName, teams] of groupedByLeague) {
          // Sort by league win%, then league wins, then overall win%
          teams.sort((a, b) => {
            if (b.leagueWinPct !== a.leagueWinPct) return b.leagueWinPct - a.leagueWinPct
            if (b.leagueWins !== a.leagueWins) return b.leagueWins - a.leagueWins
            if (b.winPct !== a.winPct) return b.winPct - a.winPct
            return b.wins - a.wins
          })

          result.push({
            league: leagueName,
            division: null,
            region: null,
            displayName: leagueName,
            teams
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
        return
      }

      // If no pre-computed standings, set empty
      setStandings([])
    } catch (err) {
      console.error('Error in legacy standings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch standings')
    }
  }

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
