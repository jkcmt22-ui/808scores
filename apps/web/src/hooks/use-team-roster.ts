'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Player, Sport, Team, TeamRosterEntry, TeamGender } from '@/types/database'

// ============================================
// Types
// ============================================

export type { TeamGender }

export interface TeamRosterPlayer {
  player: Player
  rosterEntry: TeamRosterEntry
  jerseyNumber: number | null
  position: string | null
  grade: string | null
  isCaptain: boolean
  isStarter: boolean
}

export interface TeamWithRoster {
  team: Team
  sport: Sport
  players: TeamRosterPlayer[]
}

interface UseTeamRosterOptions {
  schoolId: string | null
  sportId?: string | null
  gender?: TeamGender | null
  division?: string | null  // "Division I", "Division II", "Open", etc.
  seasonYear?: string  // "2025-2026" format
}

interface UseTeamRosterReturn {
  teams: TeamWithRoster[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// ============================================
// Helpers
// ============================================

/**
 * Get the current season year in "YYYY-YYYY" format
 * Uses Hawaii timezone for consistency
 */
export function getCurrentSeasonYear(): string {
  const now = new Date()
  const hawaiiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }))
  const year = hawaiiDate.getFullYear()
  const month = hawaiiDate.getMonth() + 1  // 0-indexed

  // School year typically starts in August
  // If we're in Aug-Dec, we're in the first year of the season
  // If we're in Jan-July, we're in the second year of the season
  if (month >= 8) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

/**
 * Parse season year to numeric start year
 */
export function parseSeasonYear(seasonYear: string): number {
  const parts = seasonYear.split('-')
  return parseInt(parts[0], 10)
}

// ============================================
// Main Hook
// ============================================

export function useTeamRoster(options: UseTeamRosterOptions): UseTeamRosterReturn {
  const { schoolId, sportId, gender, division, seasonYear } = options
  const [teams, setTeams] = useState<TeamWithRoster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const currentSeasonYear = seasonYear || getCurrentSeasonYear()

  const fetchTeamRosters = useCallback(async () => {
    if (!supabase || !schoolId) {
      setIsLoading(false)
      setTeams([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Build teams query
      let teamsQuery = supabase
        .from('teams')
        .select(`
          *,
          sport:sports(*)
        `)
        .eq('school_id', schoolId)
        .eq('season_year', currentSeasonYear)
        .eq('is_active', true)

      if (sportId) {
        teamsQuery = teamsQuery.eq('sport_id', sportId)
      }

      if (gender) {
        teamsQuery = teamsQuery.eq('gender', gender)
      }

      if (division) {
        teamsQuery = teamsQuery.eq('division', division)
      }

      const { data: teamsData, error: teamsError } = await teamsQuery

      if (teamsError) throw teamsError

      if (!teamsData || teamsData.length === 0) {
        setTeams([])
        setIsLoading(false)
        return
      }

      // Define type for joined query result
      type TeamWithSport = Team & { sport: Sport }
      const typedTeamsData = teamsData as TeamWithSport[]

      // Fetch roster entries for all teams
      const teamIds = typedTeamsData.map(t => t.id)
      const { data: rosterData, error: rosterError } = await supabase
        .from('team_rosters')
        .select(`
          *,
          player:players(*)
        `)
        .in('team_id', teamIds)
        .eq('season_year', currentSeasonYear)
        .eq('is_active', true)

      if (rosterError) throw rosterError

      // Define type for roster with player
      type RosterWithPlayer = TeamRosterEntry & { player: Player }

      // Group roster entries by team
      const rosterByTeam = new Map<string, RosterWithPlayer[]>()
      for (const entry of (rosterData || []) as RosterWithPlayer[]) {
        if (!rosterByTeam.has(entry.team_id)) {
          rosterByTeam.set(entry.team_id, [])
        }
        rosterByTeam.get(entry.team_id)!.push(entry)
      }

      // Build TeamWithRoster array
      const result: TeamWithRoster[] = typedTeamsData.map(teamData => {
        const rosterEntries = rosterByTeam.get(teamData.id) || []

        const players: TeamRosterPlayer[] = rosterEntries.map(entry => ({
          player: entry.player,
          rosterEntry: entry,
          jerseyNumber: entry.jersey_number ?? entry.player.jersey_number,
          position: entry.position,
          grade: entry.grade,
          isCaptain: entry.is_captain,
          isStarter: entry.is_starter,
        }))

        // Sort players: captains first, then by jersey number, then by name
        players.sort((a, b) => {
          if (a.isCaptain && !b.isCaptain) return -1
          if (!a.isCaptain && b.isCaptain) return 1

          const aNum = a.jerseyNumber ?? 999
          const bNum = b.jerseyNumber ?? 999
          if (aNum !== bNum) return aNum - bNum

          return a.player.last_name.localeCompare(b.player.last_name)
        })

        return {
          team: teamData,
          sport: teamData.sport,
          players,
        }
      })

      // Sort teams by sport sort_order, then by gender
      result.sort((a, b) => {
        const sportOrder = a.sport.sort_order - b.sport.sort_order
        if (sportOrder !== 0) return sportOrder

        // Boys before girls for consistency
        if (a.team.gender === 'boys' && b.team.gender !== 'boys') return -1
        if (a.team.gender !== 'boys' && b.team.gender === 'boys') return 1

        return 0
      })

      setTeams(result)
    } catch (err) {
      console.error('Error fetching team rosters:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch team rosters')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, schoolId, sportId, gender, division, currentSeasonYear])

  useEffect(() => {
    fetchTeamRosters()
  }, [fetchTeamRosters])

  return { teams, isLoading, error, refetch: fetchTeamRosters }
}

// ============================================
// Mutations Hook
// ============================================

export interface TeamRosterMutations {
  addPlayer: (player: { first_name: string; last_name: string; jersey_number?: number | null }) => Promise<Player | null>
  updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<boolean>
  deletePlayer: (playerId: string) => Promise<boolean>
  addToTeamRoster: (teamId: string, playerId: string, rosterData: {
    jersey_number?: number | null
    position?: string | null
    grade?: string | null
    is_captain?: boolean
    is_starter?: boolean
    season_year: string
  }) => Promise<boolean>
  updateRosterEntry: (rosterEntryId: string, updates: Partial<TeamRosterEntry>) => Promise<boolean>
  removeFromTeamRoster: (rosterEntryId: string) => Promise<boolean>
  getOrCreateTeam: (options: {
    schoolId: string
    sportId: string
    gender: TeamGender
    seasonYear: string
  }) => Promise<Team | null>
}

export function useTeamRosterMutations(schoolId: string | null): TeamRosterMutations & { isLoading: boolean; error: string | null } {
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

      const { data, error: insertError } = await supabase
        .from('players')
        .insert({
          school_id: schoolId,
          first_name: playerData.first_name,
          last_name: playerData.last_name,
          jersey_number: playerData.jersey_number ?? null,
        } as never)
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

  const getOrCreateTeam = useCallback(async (options: {
    schoolId: string
    sportId: string
    gender: TeamGender
    seasonYear: string
  }): Promise<Team | null> => {
    if (!supabase) return null

    try {
      setIsLoading(true)
      setError(null)

      // First try to find existing team
      const { data: existingTeam, error: findError } = await supabase
        .from('teams')
        .select('*')
        .eq('school_id', options.schoolId)
        .eq('sport_id', options.sportId)
        .eq('gender', options.gender)
        .eq('season_year', options.seasonYear)
        .single()

      if (existingTeam) {
        return existingTeam as Team
      }

      // If not found, create new team
      if (findError && findError.code !== 'PGRST116') {  // PGRST116 = no rows
        throw findError
      }

      const { data: newTeam, error: insertError } = await supabase
        .from('teams')
        .insert({
          school_id: options.schoolId,
          sport_id: options.sportId,
          gender: options.gender,
          season_year: options.seasonYear,
        } as never)
        .select()
        .single()

      if (insertError) throw insertError

      return newTeam as Team
    } catch (err) {
      console.error('Error getting or creating team:', err)
      setError(err instanceof Error ? err.message : 'Failed to get or create team')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const addToTeamRoster = useCallback(async (
    teamId: string,
    playerId: string,
    rosterData: {
      jersey_number?: number | null
      position?: string | null
      grade?: string | null
      is_captain?: boolean
      is_starter?: boolean
      season_year: string
    }
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error: insertError } = await supabase
        .from('team_rosters')
        .insert({
          team_id: teamId,
          player_id: playerId,
          jersey_number: rosterData.jersey_number ?? null,
          position: rosterData.position ?? null,
          grade: rosterData.grade ?? null,
          is_captain: rosterData.is_captain ?? false,
          is_starter: rosterData.is_starter ?? false,
          season_year: rosterData.season_year,
        } as never)

      if (insertError) throw insertError

      return true
    } catch (err) {
      console.error('Error adding to team roster:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to roster')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const updateRosterEntry = useCallback(async (
    rosterEntryId: string,
    updates: Partial<TeamRosterEntry>
  ): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('team_rosters')
        .update(updates as never)
        .eq('id', rosterEntryId)

      if (updateError) throw updateError

      return true
    } catch (err) {
      console.error('Error updating roster entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to update roster entry')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const removeFromTeamRoster = useCallback(async (rosterEntryId: string): Promise<boolean> => {
    if (!supabase) return false

    try {
      setIsLoading(true)
      setError(null)

      // Soft delete by setting is_active to false
      const { error: deleteError } = await supabase
        .from('team_rosters')
        .update({ is_active: false } as never)
        .eq('id', rosterEntryId)

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error removing from roster:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove from roster')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  return {
    addPlayer,
    updatePlayer,
    deletePlayer,
    addToTeamRoster,
    updateRosterEntry,
    removeFromTeamRoster,
    getOrCreateTeam,
    isLoading,
    error,
  }
}
