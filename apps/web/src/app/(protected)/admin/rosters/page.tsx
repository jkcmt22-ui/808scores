'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  Search,
  ArrowLeft,
  Star,
  X,
  Save,
} from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/hooks'
import { useSchools } from '@/hooks/use-schools'
import { useSports } from '@/hooks/use-sports'
import {
  useTeamRoster,
  useTeamRosterMutations,
  getCurrentSeasonYear,
  type TeamRosterPlayer,
  type TeamGender,
} from '@/hooks/use-team-roster'
import { cn } from '@/lib/utils'
import { getSportEmoji } from '@/lib/sport-utils'
import type { Player } from '@/types/database'

interface PlayerFormData {
  first_name: string
  last_name: string
  jersey_number: number | null
}

interface RosterFormData {
  jersey_number: number | null
  position: string
  grade: string
  is_captain: boolean
}

const GRADES = ['Freshman', 'Sophomore', 'Junior', 'Senior']
const POSITIONS_BY_SPORT: Record<string, string[]> = {
  football: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
  basketball: ['PG', 'SG', 'SF', 'PF', 'C'],
  volleyball: ['Setter', 'Outside', 'Middle', 'Libero', 'Opposite'],
  baseball: ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF', 'DH'],
  softball: ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF', 'DP'],
  soccer: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'],
}

const GENDER_OPTIONS: { value: TeamGender; label: string }[] = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
]

export default function AdminRostersPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { schools, isLoading: schoolsLoading } = useSchools()
  const { sports, isLoading: sportsLoading } = useSports()

  // Selection state - now includes gender and division
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null)
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState<TeamGender | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const [seasonYear, setSeasonYear] = useState<string>(getCurrentSeasonYear())

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<{ player: Player; rosterEntryId: string | null } | null>(null)
  const [showAssignToRoster, setShowAssignToRoster] = useState<Player | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    first_name: '',
    last_name: '',
    jersey_number: null,
  })
  const [rosterForm, setRosterForm] = useState<RosterFormData>({
    jersey_number: null,
    position: '',
    grade: '',
    is_captain: false,
  })

  // Check if all selectors are filled (required for editing)
  const hasFullContext = selectedSchoolId && selectedSportId && selectedGender

  // Use new team roster hook
  const { teams, isLoading: rosterLoading, refetch: refetchRoster } = useTeamRoster({
    schoolId: selectedSchoolId,
    sportId: selectedSportId,
    gender: selectedGender,
    seasonYear,
  })

  const {
    addPlayer,
    updatePlayer,
    deletePlayer,
    addToTeamRoster,
    updateRosterEntry,
    removeFromTeamRoster,
    getOrCreateTeam,
    isLoading: mutationLoading,
    error: mutationError,
  } = useTeamRosterMutations(selectedSchoolId)

  // Get current school, sport, and team for display
  const selectedSchool = schools.find(s => s.id === selectedSchoolId)
  const selectedSport = sports.find(s => s.id === selectedSportId)

  // Extract available divisions from fetched teams
  const availableDivisions = useMemo(() => {
    const divisions = new Set<string>()
    teams.forEach(t => {
      if (t.team.division) {
        divisions.add(t.team.division)
      }
    })
    return Array.from(divisions).sort()
  }, [teams])

  // Auto-select division when only one is available
  useEffect(() => {
    if (availableDivisions.length === 1 && !selectedDivision) {
      setSelectedDivision(availableDivisions[0])
    } else if (availableDivisions.length > 1 && selectedDivision && !availableDivisions.includes(selectedDivision)) {
      // Reset if selected division is no longer available
      setSelectedDivision(null)
    }
  }, [availableDivisions, selectedDivision])

  // Filter to get the current team based on selected division
  const currentTeam = useMemo(() => {
    if (teams.length === 0) return null
    if (teams.length === 1) return teams[0]
    if (selectedDivision) {
      return teams.find(t => t.team.division === selectedDivision) || null
    }
    // If no division selected and multiple teams, return null to force selection
    return null
  }, [teams, selectedDivision])

  // Get all players from the current team
  const allPlayers = currentTeam?.players || []

  // Check authorization
  useEffect(() => {
    if (!authLoading && (!user || (!profile?.is_admin && !profile?.is_super_admin))) {
      router.push('/')
    }
  }, [authLoading, user, profile, router])

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Filter players by search term
  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return allPlayers
    const term = searchTerm.toLowerCase()
    return allPlayers.filter(rp =>
      rp.player.first_name.toLowerCase().includes(term) ||
      rp.player.last_name.toLowerCase().includes(term) ||
      (rp.jerseyNumber?.toString() || '').includes(term)
    )
  }, [allPlayers, searchTerm])

  // Get positions for selected sport
  const positions = selectedSport
    ? POSITIONS_BY_SPORT[selectedSport.name.toLowerCase()] || []
    : []

  // Handlers
  const handleAddPlayer = async () => {
    if (!playerForm.first_name || !playerForm.last_name) {
      setMessage({ type: 'error', text: 'First and last name are required' })
      return
    }

    if (!hasFullContext || !currentTeam) {
      setMessage({ type: 'error', text: 'Please select school, sport, gender, and division first' })
      return
    }

    // First add the player
    const newPlayer = await addPlayer({
      first_name: playerForm.first_name,
      last_name: playerForm.last_name,
      jersey_number: playerForm.jersey_number,
    })

    if (!newPlayer) {
      setMessage({ type: 'error', text: mutationError || 'Failed to add player' })
      return
    }

    // Use the currently selected team
    const team = currentTeam.team

    // Add to roster with form data
    const rosterSuccess = await addToTeamRoster(team.id, newPlayer.id, {
      jersey_number: rosterForm.jersey_number,
      position: rosterForm.position || null,
      grade: rosterForm.grade || null,
      is_captain: rosterForm.is_captain,
      season_year: seasonYear,
    })

    if (rosterSuccess) {
      setMessage({ type: 'success', text: 'Player added to roster successfully' })
      setPlayerForm({ first_name: '', last_name: '', jersey_number: null })
      setRosterForm({ jersey_number: null, position: '', grade: '', is_captain: false })
      setShowAddPlayer(false)
      refetchRoster()
    } else {
      setMessage({ type: 'error', text: mutationError || 'Failed to add player to roster' })
    }
  }

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return

    const success = await updatePlayer(editingPlayer.player.id, {
      first_name: playerForm.first_name,
      last_name: playerForm.last_name,
      jersey_number: playerForm.jersey_number,
    })

    // Also update roster entry if it exists
    if (success && editingPlayer.rosterEntryId) {
      await updateRosterEntry(editingPlayer.rosterEntryId, {
        jersey_number: rosterForm.jersey_number,
        position: rosterForm.position || null,
        grade: rosterForm.grade || null,
        is_captain: rosterForm.is_captain,
      })
    }

    if (success) {
      setMessage({ type: 'success', text: 'Player updated successfully' })
      setEditingPlayer(null)
      refetchRoster()
    } else {
      setMessage({ type: 'error', text: mutationError || 'Failed to update player' })
    }
  }

  const handleDeletePlayer = async (rosterPlayer: TeamRosterPlayer) => {
    if (!confirm('Are you sure you want to remove this player from the roster?')) return

    // Remove from roster (soft delete)
    const success = await removeFromTeamRoster(rosterPlayer.rosterEntry.id)

    if (success) {
      setMessage({ type: 'success', text: 'Player removed from roster' })
      refetchRoster()
    } else {
      setMessage({ type: 'error', text: mutationError || 'Failed to remove player' })
    }
  }

  const openEditPlayer = (rosterPlayer: TeamRosterPlayer) => {
    setEditingPlayer({
      player: rosterPlayer.player,
      rosterEntryId: rosterPlayer.rosterEntry.id,
    })
    setPlayerForm({
      first_name: rosterPlayer.player.first_name,
      last_name: rosterPlayer.player.last_name,
      jersey_number: rosterPlayer.player.jersey_number,
    })
    setRosterForm({
      jersey_number: rosterPlayer.jerseyNumber,
      position: rosterPlayer.position || '',
      grade: rosterPlayer.grade || '',
      is_captain: rosterPlayer.isCaptain,
    })
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  if (!user || (!profile?.is_admin && !profile?.is_super_admin)) {
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Users className="h-5 w-5 text-neon-pink" />
          <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
            Roster Management
          </span>
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg',
          message.type === 'success' ? 'bg-score-green text-black' : 'bg-score-red text-white'
        )}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Selectors - School, Sport, Gender, Division, Season */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* School selector */}
          <div>
            <label className="block text-sm font-display text-foreground-muted mb-2">
              School *
            </label>
            <select
              value={selectedSchoolId || ''}
              onChange={e => {
                setSelectedSchoolId(e.target.value || null)
                // Reset downstream selections when school changes
                setSelectedSportId(null)
                setSelectedGender(null)
                setSelectedDivision(null)
              }}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              disabled={schoolsLoading}
            >
              <option value="">Select school...</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sport selector */}
          <div>
            <label className="block text-sm font-display text-foreground-muted mb-2">
              Sport *
            </label>
            <select
              value={selectedSportId || ''}
              onChange={e => {
                setSelectedSportId(e.target.value || null)
                // Reset gender and division when sport changes
                setSelectedGender(null)
                setSelectedDivision(null)
              }}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              disabled={sportsLoading || !selectedSchoolId}
            >
              <option value="">Select sport...</option>
              {sports
                .filter((sport, index, self) =>
                  // Deduplicate by base sport name (without gender)
                  index === self.findIndex(s =>
                    s.name.replace(/^(Boys|Girls)\s+/i, '') === sport.name.replace(/^(Boys|Girls)\s+/i, '')
                  )
                )
                .map(sport => (
                  <option key={sport.id} value={sport.id}>
                    {getSportEmoji(sport.code)} {sport.name.replace(/^(Boys|Girls)\s+/i, '')}
                  </option>
                ))}
            </select>
          </div>

          {/* Gender selector */}
          <div>
            <label className="block text-sm font-display text-foreground-muted mb-2">
              Gender *
            </label>
            <select
              value={selectedGender || ''}
              onChange={e => {
                setSelectedGender(e.target.value as TeamGender || null)
                setSelectedDivision(null)
              }}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              disabled={!selectedSportId}
            >
              <option value="">Select gender...</option>
              {GENDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Division selector - only show if multiple divisions available */}
          <div>
            <label className="block text-sm font-display text-foreground-muted mb-2">
              Division {availableDivisions.length > 1 ? '*' : ''}
            </label>
            <select
              value={selectedDivision || ''}
              onChange={e => setSelectedDivision(e.target.value || null)}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              disabled={!selectedGender || availableDivisions.length === 0}
            >
              {availableDivisions.length === 0 ? (
                <option value="">No teams</option>
              ) : availableDivisions.length === 1 ? (
                <option value={availableDivisions[0]}>{availableDivisions[0]}</option>
              ) : (
                <>
                  <option value="">Select division...</option>
                  {availableDivisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Season year selector */}
          <div>
            <label className="block text-sm font-display text-foreground-muted mb-2">
              Season
            </label>
            <select
              value={seasonYear}
              onChange={e => setSeasonYear(e.target.value)}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
            >
              {['2024-2025', '2025-2026', '2026-2027', '2027-2028'].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pinned context header - shows when all selections are made and team is selected */}
        {hasFullContext && selectedSchool && selectedSport && currentTeam && (
          <div className="mb-6 p-4 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getSportEmoji(selectedSport.code)}</span>
                <div>
                  <h2 className="font-display font-bold text-foreground">
                    Editing: {selectedSchool.name}
                  </h2>
                  <p className="text-sm text-foreground-muted">
                    {selectedGender === 'boys' ? 'Boys' : 'Girls'}{' '}
                    {selectedSport.name.replace(/^(Boys|Girls)\s+/i, '')}
                    {currentTeam?.team.division && ` - ${currentTeam.team.division}`}{' '}
                    ({seasonYear})
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowAddPlayer(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </div>
          </div>
        )}

        {/* Content area */}
        {!selectedSchoolId ? (
          <div className="scoreboard-panel p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <p className="text-foreground-muted">Select a school to manage rosters</p>
          </div>
        ) : !hasFullContext ? (
          <div className="scoreboard-panel p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <p className="text-foreground-muted">
              Select sport and gender to view and edit the roster
            </p>
          </div>
        ) : availableDivisions.length > 1 && !selectedDivision ? (
          <div className="scoreboard-panel p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <p className="text-foreground-muted">
              This school has multiple teams for this sport/gender.
            </p>
            <p className="text-foreground-muted mt-2">
              Select a division: {availableDivisions.join(', ')}
            </p>
          </div>
        ) : !currentTeam ? (
          <div className="scoreboard-panel p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <p className="text-foreground-muted">
              No team found for this selection
            </p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Players list */}
            {rosterLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="scoreboard-panel p-8 text-center">
                <Users className="h-8 w-8 mx-auto text-foreground-muted mb-2" />
                <p className="text-foreground-muted">
                  {searchTerm ? 'No players match your search' : 'No players on roster yet'}
                </p>
                <Button className="mt-4" onClick={() => setShowAddPlayer(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Player
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-foreground-muted mb-2">
                  {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
                </p>
                {filteredPlayers.map(rosterPlayer => (
                  <PlayerRow
                    key={rosterPlayer.rosterEntry.id}
                    rosterPlayer={rosterPlayer}
                    onEdit={() => openEditPlayer(rosterPlayer)}
                    onDelete={() => handleDeletePlayer(rosterPlayer)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <Modal onClose={() => setShowAddPlayer(false)} title="Add Player to Roster">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  First Name *
                </label>
                <Input
                  value={playerForm.first_name}
                  onChange={e => setPlayerForm(p => ({ ...p, first_name: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Last Name *
                </label>
                <Input
                  value={playerForm.last_name}
                  onChange={e => setPlayerForm(p => ({ ...p, last_name: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Jersey Number
                </label>
                <Input
                  type="number"
                  value={rosterForm.jersey_number ?? ''}
                  onChange={e => setRosterForm(r => ({ ...r, jersey_number: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="#"
                />
              </div>
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Grade
                </label>
                <select
                  value={rosterForm.grade}
                  onChange={e => setRosterForm(r => ({ ...r, grade: e.target.value }))}
                  className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
                >
                  <option value="">Select...</option>
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-display text-foreground-muted mb-1">
                Position
              </label>
              <select
                value={rosterForm.position}
                onChange={e => setRosterForm(r => ({ ...r, position: e.target.value }))}
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              >
                <option value="">Select...</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_captain"
                checked={rosterForm.is_captain}
                onChange={e => setRosterForm(r => ({ ...r, is_captain: e.target.checked }))}
                className="rounded border-border"
              />
              <label htmlFor="is_captain" className="text-sm text-foreground flex items-center gap-1">
                <Star className="h-4 w-4 text-score-amber" />
                Team Captain
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowAddPlayer(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPlayer} disabled={mutationLoading}>
                {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Add to Roster
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <Modal onClose={() => setEditingPlayer(null)} title="Edit Player">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  First Name *
                </label>
                <Input
                  value={playerForm.first_name}
                  onChange={e => setPlayerForm(p => ({ ...p, first_name: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Last Name *
                </label>
                <Input
                  value={playerForm.last_name}
                  onChange={e => setPlayerForm(p => ({ ...p, last_name: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Jersey Number
                </label>
                <Input
                  type="number"
                  value={rosterForm.jersey_number ?? ''}
                  onChange={e => setRosterForm(r => ({ ...r, jersey_number: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="#"
                />
              </div>
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Grade
                </label>
                <select
                  value={rosterForm.grade}
                  onChange={e => setRosterForm(r => ({ ...r, grade: e.target.value }))}
                  className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
                >
                  <option value="">Select...</option>
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-display text-foreground-muted mb-1">
                Position
              </label>
              <select
                value={rosterForm.position}
                onChange={e => setRosterForm(r => ({ ...r, position: e.target.value }))}
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              >
                <option value="">Select...</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_captain"
                checked={rosterForm.is_captain}
                onChange={e => setRosterForm(r => ({ ...r, is_captain: e.target.checked }))}
                className="rounded border-border"
              />
              <label htmlFor="edit_is_captain" className="text-sm text-foreground flex items-center gap-1">
                <Star className="h-4 w-4 text-score-amber" />
                Team Captain
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setEditingPlayer(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePlayer} disabled={mutationLoading}>
                {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Update
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Player Row Component
interface PlayerRowProps {
  rosterPlayer: TeamRosterPlayer
  onEdit: () => void
  onDelete: () => void
}

function PlayerRow({ rosterPlayer, onEdit, onDelete }: PlayerRowProps) {
  const { player, jerseyNumber, position, grade, isCaptain } = rosterPlayer

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background-secondary hover:border-neon-blue transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 text-center">
          {jerseyNumber !== null ? (
            <span className="font-display font-bold text-neon-yellow text-lg">
              {jerseyNumber}
            </span>
          ) : (
            <span className="text-foreground-muted">-</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-foreground">
              {player.first_name} {player.last_name}
            </span>
            {isCaptain && (
              <Star className="h-4 w-4 text-score-amber fill-score-amber" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            {position && <span>{position}</span>}
            {position && grade && <span>-</span>}
            {grade && <span>{grade}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit} title="Edit player">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} title="Remove from roster" className="text-score-red hover:text-score-red">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Modal Component
interface ModalProps {
  onClose: () => void
  title: string
  children: React.ReactNode
}

function Modal({ onClose, title, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-background border border-border rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-display font-bold text-foreground">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
