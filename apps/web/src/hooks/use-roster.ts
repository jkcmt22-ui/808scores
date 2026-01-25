'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Player, PlayerSeason, Sport, School } from '@/types/database'

export interface RosterPlayer {
  player: Player
  season: PlayerSeason | null
  jerseyNumber: number | null
  position: string | null
  grade: string | null
  isCaptain: boolean
}

export interface SportRoster {
  sport: Sport
  players: RosterPlayer[]
}

interface UseRosterOptions {
  schoolId: string | null
  sportId?: string
  seasonYear?: number
}

interface UseRosterReturn {
  rosters: SportRoster[]
  allPlayers: RosterPlayer[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useRoster(options: UseRosterOptions): UseRosterReturn {
  const { schoolId, sportId, seasonYear } = options
  const [rosters, setRosters] = useState<SportRoster[]>([])
  const [allPlayers, setAllPlayers] = useState<RosterPlayer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchRoster = useCallback(async () => {
    if (!supabase || !schoolId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get current year for default season
      const currentYear = seasonYear || parseInt(
        new Date().toLocaleDateString('en-CA', {
          timeZone: 'Pacific/Honolulu',
          year: 'numeric'
        })
      )

      // Fetch all active players for this school
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('last_name')
        .order('first_name')

      if (playersError) throw playersError

      const players = playersData as Player[]

      if (players.length === 0) {
        setRosters([])
        setAllPlayers([])
        setIsLoading(false)
        return
      }

      // Fetch player seasons for these players
      let seasonsQuery = supabase
        .from('player_seasons')
        .select(`
          *,
          sport:sports(*)
        `)
        .in('player_id', players.map(p => p.id))
        .eq('season_year', currentYear)

      if (sportId) {
        seasonsQuery = seasonsQuery.eq('sport_id', sportId)
      }

      const { data: seasonsData, error: seasonsError } = await seasonsQuery

      if (seasonsError) throw seasonsError

      // Define the type for the joined query result
      type SeasonWithSport = PlayerSeason & { sport: Sport }

      // Create a map of player seasons
      const playerSeasonMap = new Map<string, { season: PlayerSeason; sport: Sport }[]>()
      for (const seasonData of (seasonsData || []) as SeasonWithSport[]) {
        const playerId = seasonData.player_id
        if (!playerSeasonMap.has(playerId)) {
          playerSeasonMap.set(playerId, [])
        }
        playerSeasonMap.get(playerId)!.push({
          season: seasonData,
          sport: seasonData.sport
        })
      }

      // Group by sport
      const sportMap = new Map<string, { sport: Sport; players: RosterPlayer[] }>()

      // First, process players with season data
      for (const [playerId, seasons] of playerSeasonMap) {
        const player = players.find(p => p.id === playerId)
        if (!player) continue

        for (const { season, sport } of seasons) {
          if (!sportMap.has(sport.id)) {
            sportMap.set(sport.id, { sport, players: [] })
          }

          sportMap.get(sport.id)!.players.push({
            player,
            season,
            jerseyNumber: season.jersey_number ?? player.jersey_number,
            position: season.position,
            grade: season.grade,
            isCaptain: season.is_captain
          })
        }
      }

      // Create all players list (for players without season assignment)
      const allRosterPlayers: RosterPlayer[] = players.map(player => {
        const seasons = playerSeasonMap.get(player.id)
        const firstSeason = seasons?.[0]?.season || null

        return {
          player,
          season: firstSeason,
          jerseyNumber: firstSeason?.jersey_number ?? player.jersey_number,
          position: firstSeason?.position || null,
          grade: firstSeason?.grade || null,
          isCaptain: firstSeason?.is_captain || false
        }
      })

      setAllPlayers(allRosterPlayers)

      // Convert to array and sort by sport
      const sportRosters = Array.from(sportMap.values())
      sportRosters.sort((a, b) => a.sport.sort_order - b.sport.sort_order)

      // Sort players within each sport by jersey number, then name
      for (const roster of sportRosters) {
        roster.players.sort((a, b) => {
          // Captains first
          if (a.isCaptain && !b.isCaptain) return -1
          if (!a.isCaptain && b.isCaptain) return 1

          // Then by jersey number
          const aNum = a.jerseyNumber ?? 999
          const bNum = b.jerseyNumber ?? 999
          if (aNum !== bNum) return aNum - bNum

          // Then by name
          return a.player.last_name.localeCompare(b.player.last_name)
        })
      }

      setRosters(sportRosters)
    } catch (err) {
      console.error('Error fetching roster:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch roster')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, schoolId, sportId, seasonYear])

  useEffect(() => {
    fetchRoster()
  }, [fetchRoster])

  return { rosters, allPlayers, isLoading, error, refetch: fetchRoster }
}

// Hook for admin roster management
export interface RosterMutations {
  addPlayer: (player: { first_name: string; last_name: string; jersey_number?: number | null }) => Promise<Player | null>
  updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<boolean>
  deletePlayer: (playerId: string) => Promise<boolean>
  assignToSport: (playerId: string, sportId: string, seasonData: Omit<PlayerSeason, 'id' | 'created_at' | 'player_id' | 'sport_id'>) => Promise<boolean>
  removeFromSport: (playerId: string, sportId: string, seasonYear: number) => Promise<boolean>
  updateSeasonData: (playerSeasonId: string, updates: Partial<PlayerSeason>) => Promise<boolean>
}

export function useRosterMutations(schoolId: string | null): RosterMutations & { isLoading: boolean; error: string | null } {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const addPlayer = useCallback(async (
    playerData: { first_name: string; last_name: string; jersey_number?: number | null }
  ): Promise<Player | null> => {
    if (!supabase || !schoolId) return null

    try {
      setIsLoading(true)
      setError(null)

      const insertData = {
        school_id: schoolId,
        first_name: playerData.first_name,
        last_name: playerData.last_name,
        jersey_number: playerData.jersey_number ?? null
      }

      const { data, error: insertError } = await supabase
        .from('players')
        .insert(insertData as never)
        .select()
        .single()

      if (insertError) throw insertError

      return data as Player
    } catch (err) {
      console.error('Error adding player:', err)
      setError(err instanceof Error ? err.message : 'Failed to add player')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [supabase, schoolId])

  const updatePlayer = useCallback(async (
    playerId: string,
    updates: Partial<Player>
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('players')
        .update(updates as never)
        .eq('id', playerId)

      if (updateError) throw updateError

      return true
    } catch (err) {
      console.error('Error updating player:', err)
      setError(err instanceof Error ? err.message : 'Failed to update player')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const deletePlayer = useCallback(async (playerId: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      // Soft delete by setting is_active to false
      const { error: deleteError } = await supabase
        .from('players')
        .update({ is_active: false } as never)
        .eq('id', playerId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error deleting player:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete player')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const assignToSport = useCallback(async (
    playerId: string,
    sportId: string,
    seasonData: Omit<PlayerSeason, 'id' | 'created_at' | 'player_id' | 'sport_id'>
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error: insertError } = await supabase
        .from('player_seasons')
        .insert({
          player_id: playerId,
          sport_id: sportId,
          ...seasonData
        } as never)

      if (insertError) throw insertError

      return true
    } catch (err) {
      console.error('Error assigning player to sport:', err)
      setError(err instanceof Error ? err.message : 'Failed to assign player')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const removeFromSport = useCallback(async (
    playerId: string,
    sportId: string,
    seasonYear: number
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('player_seasons')
        .delete()
        .eq('player_id', playerId)
        .eq('sport_id', sportId)
        .eq('season_year', seasonYear)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error removing player from sport:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove player')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const updateSeasonData = useCallback(async (
    playerSeasonId: string,
    updates: Partial<PlayerSeason>
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('player_seasons')
        .update(updates as never)
        .eq('id', playerSeasonId)

      if (updateError) throw updateError

      return true
    } catch (err) {
      console.error('Error updating season data:', err)
      setError(err instanceof Error ? err.message : 'Failed to update season data')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  return {
    addPlayer,
    updatePlayer,
    deletePlayer,
    assignToSport,
    removeFromSport,
    updateSeasonData,
    isLoading,
    error
  }
}
