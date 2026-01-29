'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Tournament,
  TournamentWithDetails,
  TournamentTeamWithSchool,
  TournamentStatus,
  GameWithTeams,
  BracketGame,
  BracketRound,
  TournamentBracket,
  TournamentRound,
} from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'

interface UseTournamentsOptions {
  sportId?: string
  status?: TournamentStatus
  league?: string
  season?: string
}

export function useTournaments(options: UseTournamentsOptions = {}) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchTournaments = useCallback(async () => {
    if (!supabase) {
      setError(new Error('Database connection not available'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('tournaments')
        .select(`
          *,
          sport:sports(*)
        `)
        .order('start_date', { ascending: false })

      if (options.sportId) {
        query = query.eq('sport_id', options.sportId)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.league) {
        query = query.eq('league', options.league)
      }

      if (options.season) {
        query = query.eq('season', options.season)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setTournaments(data || [])
    } catch (err) {
      console.error('Error fetching tournaments:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch tournaments'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.sportId, options.status, options.league, options.season])

  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  return {
    tournaments,
    isLoading,
    error,
    refetch: fetchTournaments,
  }
}

export function useTournament(tournamentId: string) {
  const [tournament, setTournament] = useState<TournamentWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchTournament = useCallback(async () => {
    if (!supabase) {
      setError(new Error('Database connection not available'))
      setIsLoading(false)
      return
    }

    if (!tournamentId) return

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [tournamentResult, teamsResult, gamesResult] = await Promise.all([
        // Fetch tournament with sport
        supabase
          .from('tournaments')
          .select(`
            *,
            sport:sports(*)
          `)
          .eq('id', tournamentId)
          .single(),
        // Fetch tournament teams with schools
        supabase
          .from('tournament_teams')
          .select(`
            *,
            school:schools(*)
          `)
          .eq('tournament_id', tournamentId)
          .order('seed', { ascending: true, nullsFirst: false }),
        // Fetch tournament games
        // After migration 072, games reference teams instead of schools
        supabase
          .from('games')
          .select(`
            *,
            sport:sports(*),
            home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
            away_team:teams!games_away_team_id_fkey(*, school:schools(*))
          `)
          .eq('tournament_id', tournamentId)
          .order('scheduled_at', { ascending: true }),
      ])

      if (tournamentResult.error) throw tournamentResult.error
      if (teamsResult.error) throw teamsResult.error
      if (gamesResult.error) throw gamesResult.error

      setTournament({
        ...(tournamentResult.data as Tournament & { sport: import('@/types/database').Sport }),
        teams: teamsResult.data as TournamentTeamWithSchool[],
        games: gamesResult.data as GameWithTeams[],
      } as TournamentWithDetails)
    } catch (err) {
      console.error('Error fetching tournament:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch tournament'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, tournamentId])

  useEffect(() => {
    fetchTournament()
  }, [fetchTournament])

  // Subscribe to tournament updates
  useEffect(() => {
    if (!supabase || !tournamentId) return

    const channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`,
        },
        () => {
          fetchTournament()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_teams',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchTournament()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchTournament()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tournamentId, fetchTournament])

  return {
    tournament,
    isLoading,
    error,
    refetch: fetchTournament,
  }
}

// Round labels for display
const ROUND_LABELS: Record<TournamentRound, string> = {
  play_in: 'Play-In',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarterfinal: 'Quarterfinals',
  semifinal: 'Semifinals',
  third_place: 'Third Place',
  final: 'Championship',
  pool_a: 'Pool A',
  pool_b: 'Pool B',
  pool_c: 'Pool C',
  pool_d: 'Pool D',
}

// Round order for sorting
const ROUND_ORDER: TournamentRound[] = [
  'play_in',
  'round_of_32',
  'round_of_16',
  'quarterfinal',
  'semifinal',
  'third_place',
  'final',
]

export function useTournamentBracket(tournamentId: string) {
  const { tournament, isLoading, error, refetch } = useTournament(tournamentId)

  const bracket = useMemo<TournamentBracket | null>(() => {
    if (!tournament || !tournament.games) return null

    // Group games by round
    const gamesByRound = new Map<TournamentRound, GameWithTeams[]>()

    for (const game of tournament.games) {
      if (!game.tournament_round) continue

      const round = game.tournament_round
      if (!gamesByRound.has(round)) {
        gamesByRound.set(round, [])
      }
      gamesByRound.get(round)!.push(game)
    }

    // Build rounds array
    const rounds: BracketRound[] = []

    // Get team seed map for display
    const teamSeeds = new Map<string, number>()
    if (tournament.teams) {
      for (const team of tournament.teams) {
        if (team.seed) {
          teamSeeds.set(team.school_id, team.seed)
        }
      }
    }

    for (const round of ROUND_ORDER) {
      const games = gamesByRound.get(round)
      if (!games || games.length === 0) continue

      // Sort by bracket position
      games.sort((a, b) => (a.bracket_position || 0) - (b.bracket_position || 0))

      const bracketGames: BracketGame[] = games.map((game) => ({
        id: game.id,
        round,
        position: game.bracket_position || 0,
        // After migration 072: use helper to get school from team
        homeTeam: getHomeSchool(game),
        awayTeam: getAwaySchool(game),
        homeScore: game.status === 'scheduled' ? null : game.home_score,
        awayScore: game.status === 'scheduled' ? null : game.away_score,
        homeSeed: teamSeeds.get(game.home_team_id) || null,
        awaySeed: teamSeeds.get(game.away_team_id) || null,
        status: game.status,
        scheduledAt: game.scheduled_at,
        winnerAdvancesTo: game.winner_advances_to,
        loserDropsTo: game.loser_drops_to,
      }))

      rounds.push({
        round,
        label: ROUND_LABELS[round],
        games: bracketGames,
      })
    }

    return {
      tournament,
      rounds,
    }
  }, [tournament])

  return {
    bracket,
    isLoading,
    error,
    refetch,
  }
}

// Hook for active/upcoming tournaments
export function useActiveTournaments(sportId?: string) {
  return useTournaments({
    sportId,
    status: 'in_progress',
  })
}

export function useUpcomingTournaments(sportId?: string) {
  return useTournaments({
    sportId,
    status: 'upcoming',
  })
}
