'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Game,
  School,
  Sport,
  Player,
  PlayerGameStats
} from '@/types/database'

// Game with full team details
export interface GameWithDetails {
  id: string
  sport_id: string
  home_team_id: string
  away_team_id: string
  scheduled_at: string
  venue: string | null
  status: string
  home_score: number
  away_score: number
  sport: Sport
  home_team: School
  away_team: School
}

// Player with their stats for a specific game
export interface PlayerWithStats {
  player: Player
  stats: Partial<PlayerGameStats> | null
  jerseyNumber: number | null
  position: string | null
  isStarter: boolean
}

// Team roster with stats
export interface TeamRosterWithStats {
  school: School
  players: PlayerWithStats[]
}

interface UseGameStatsOptions {
  gameId: string
}

interface UseGameStatsReturn {
  game: GameWithDetails | null
  homeRoster: TeamRosterWithStats | null
  awayRoster: TeamRosterWithStats | null
  existingStats: Map<string, PlayerGameStats>
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useGameStats(options: UseGameStatsOptions): UseGameStatsReturn {
  const { gameId } = options
  const [game, setGame] = useState<GameWithDetails | null>(null)
  const [homeRoster, setHomeRoster] = useState<TeamRosterWithStats | null>(null)
  const [awayRoster, setAwayRoster] = useState<TeamRosterWithStats | null>(null)
  const [existingStats, setExistingStats] = useState<Map<string, PlayerGameStats>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchGameStats = useCallback(async () => {
    if (!supabase || !gameId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Fetch game with teams and sport
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .eq('id', gameId)
        .single()

      if (gameError) throw gameError
      if (!gameData) throw new Error('Game not found')

      const gameWithDetails = gameData as unknown as GameWithDetails
      setGame(gameWithDetails)

      // Get current season year for roster lookup
      const gameDate = new Date(gameWithDetails.scheduled_at)
      const month = gameDate.getMonth() + 1
      const year = gameDate.getFullYear()
      const seasonYear = month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`

      // Fetch team IDs for roster lookup
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, school_id')
        .eq('sport_id', gameWithDetails.sport_id)
        .eq('season_year', seasonYear)
        .in('school_id', [gameWithDetails.home_team_id, gameWithDetails.away_team_id])

      const teams = (teamsData || []) as Array<{ id: string; school_id: string }>
      const homeTeamIds = teams
        .filter(t => t.school_id === gameWithDetails.home_team_id)
        .map(t => t.id)
      const awayTeamIds = teams
        .filter(t => t.school_id === gameWithDetails.away_team_id)
        .map(t => t.id)

      // Helper to fetch players for a team
      const fetchTeamPlayers = async (
        schoolId: string,
        teamIds: string[]
      ): Promise<PlayerWithStats[]> => {
        // Try team_rosters first if we have team IDs
        if (teamIds.length > 0) {
          const { data: rosterData, error: rosterError } = await supabase
            .from('team_rosters')
            .select(`
              jersey_number,
              position,
              is_starter,
              player:players(*)
            `)
            .eq('is_active', true)
            .eq('season_year', seasonYear)
            .in('team_id', teamIds)

          if (!rosterError && rosterData && rosterData.length > 0) {
            return rosterData
              .filter((row: any) => row.player)
              .map((row: any) => ({
                player: row.player as Player,
                stats: null,
                jerseyNumber: row.jersey_number,
                position: row.position,
                isStarter: row.is_starter || false,
              }))
          }
        }

        // Fallback: fetch from players + player_seasons
        const { data: fallbackPlayers, error: fallbackError } = await supabase
          .from('players')
          .select(`
            *,
            player_seasons!inner(
              jersey_number,
              position,
              sport_id,
              season_year
            )
          `)
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .eq('player_seasons.sport_id', gameWithDetails.sport_id)

        if (!fallbackError && fallbackPlayers) {
          return fallbackPlayers.map((row: any) => ({
            player: row as Player,
            stats: null,
            jerseyNumber: row.player_seasons?.[0]?.jersey_number ?? row.jersey_number,
            position: row.player_seasons?.[0]?.position ?? null,
            isStarter: false,
          }))
        }

        return []
      }

      // Fetch players for both teams in parallel
      const [homePlayers, awayPlayers] = await Promise.all([
        fetchTeamPlayers(gameWithDetails.home_team_id, homeTeamIds),
        fetchTeamPlayers(gameWithDetails.away_team_id, awayTeamIds),
      ])

      // Fetch existing stats for this game
      const { data: statsData, error: statsError } = await supabase
        .from('player_game_stats')
        .select('*')
        .eq('game_id', gameId)

      if (statsError) {
        console.warn('Could not fetch existing stats:', statsError)
      }

      const statsMap = new Map<string, PlayerGameStats>()
      if (statsData) {
        const stats = statsData as PlayerGameStats[]
        for (const stat of stats) {
          statsMap.set(stat.player_id, stat)
        }
      }

      // Merge stats into player lists
      const homePlayersWithStats = homePlayers.map(p => ({
        ...p,
        stats: statsMap.get(p.player.id) || null,
        isStarter: statsMap.get(p.player.id)?.is_starter ?? p.isStarter,
      }))

      const awayPlayersWithStats = awayPlayers.map(p => ({
        ...p,
        stats: statsMap.get(p.player.id) || null,
        isStarter: statsMap.get(p.player.id)?.is_starter ?? p.isStarter,
      }))

      // Sort players by jersey number
      const sortByJersey = (a: PlayerWithStats, b: PlayerWithStats) => {
        const aNum = a.jerseyNumber ?? 999
        const bNum = b.jerseyNumber ?? 999
        if (aNum !== bNum) return aNum - bNum
        return a.player.last_name.localeCompare(b.player.last_name)
      }

      homePlayersWithStats.sort(sortByJersey)
      awayPlayersWithStats.sort(sortByJersey)

      setHomeRoster({
        school: gameWithDetails.home_team,
        players: homePlayersWithStats,
      })

      setAwayRoster({
        school: gameWithDetails.away_team,
        players: awayPlayersWithStats,
      })

      setExistingStats(statsMap)
    } catch (err) {
      console.error('Error fetching game stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch game stats')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, gameId])

  useEffect(() => {
    fetchGameStats()
  }, [fetchGameStats])

  return {
    game,
    homeRoster,
    awayRoster,
    existingStats,
    isLoading,
    error,
    refetch: fetchGameStats,
  }
}

// Mutations hook for saving stats
export interface GameStatsMutations {
  savePlayerStats: (
    playerId: string,
    schoolId: string,
    stats: Partial<PlayerGameStats>
  ) => Promise<boolean>
  saveAllStats: (
    statsToSave: Array<{
      playerId: string
      schoolId: string
      stats: Partial<PlayerGameStats>
    }>
  ) => Promise<boolean>
  deletePlayerStats: (playerId: string) => Promise<boolean>
}

interface UseGameStatsMutationsReturn extends GameStatsMutations {
  isLoading: boolean
  error: string | null
}

export function useGameStatsMutations(gameId: string): UseGameStatsMutationsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const savePlayerStats = useCallback(async (
    playerId: string,
    schoolId: string,
    stats: Partial<PlayerGameStats>
  ): Promise<boolean> => {
    if (!supabase || !gameId) return false

    try {
      setIsLoading(true)
      setError(null)

      // Remove id, timestamps from stats if present
      const { id, created_at, updated_at, game_id, player_id, school_id, ...statFields } = stats as any

      const { error: upsertError } = await supabase
        .from('player_game_stats')
        .upsert({
          game_id: gameId,
          player_id: playerId,
          school_id: schoolId,
          ...statFields,
        } as never, {
          onConflict: 'game_id,player_id',
        })

      if (upsertError) throw upsertError

      return true
    } catch (err) {
      console.error('Error saving player stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to save stats')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, gameId])

  const saveAllStats = useCallback(async (
    statsToSave: Array<{
      playerId: string
      schoolId: string
      stats: Partial<PlayerGameStats>
    }>
  ): Promise<boolean> => {
    if (!supabase || !gameId) return false

    try {
      setIsLoading(true)
      setError(null)

      // Filter out players with no stats entered
      const recordsToUpsert = statsToSave
        .filter(({ stats }) => {
          // Check if any stat field has a non-null value
          const { id, created_at, updated_at, game_id, player_id, school_id, is_starter, ...statFields } = stats as any
          return Object.values(statFields).some(v => v !== null && v !== undefined && v !== 0)
        })
        .map(({ playerId, schoolId, stats }) => {
          const { id, created_at, updated_at, game_id, player_id, school_id, ...statFields } = stats as any
          return {
            game_id: gameId,
            player_id: playerId,
            school_id: schoolId,
            ...statFields,
          }
        })

      if (recordsToUpsert.length === 0) {
        return true // Nothing to save
      }

      const { error: upsertError } = await supabase
        .from('player_game_stats')
        .upsert(recordsToUpsert as never[], {
          onConflict: 'game_id,player_id',
        })

      if (upsertError) throw upsertError

      return true
    } catch (err) {
      console.error('Error saving all stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to save stats')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, gameId])

  const deletePlayerStats = useCallback(async (playerId: string): Promise<boolean> => {
    if (!supabase || !gameId) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('player_game_stats')
        .delete()
        .eq('game_id', gameId)
        .eq('player_id', playerId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error deleting player stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete stats')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, gameId])

  return {
    savePlayerStats,
    saveAllStats,
    deletePlayerStats,
    isLoading,
    error,
  }
}
