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
import { Button, Badge, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { useSchools } from '@/hooks/use-schools'
import { useSports } from '@/hooks/use-sports'
import { useRoster, useRosterMutations, type RosterPlayer } from '@/hooks/use-roster'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { getSportEmoji } from '@/lib/sport-utils'
import type { Player, PlayerSeason, Sport, School } from '@/types/database'

interface PlayerFormData {
  first_name: string
  last_name: string
  jersey_number: number | null
}

interface SeasonFormData {
  sport_id: string
  season_year: number
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

export default function AdminRostersPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { schools, isLoading: schoolsLoading } = useSchools()
  const { sports, isLoading: sportsLoading } = useSports()
  const supabase = useMemo(() => createClient()!, [])

  // Selection state
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null)
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null)
  const [seasonYear, setSeasonYear] = useState<number>(
    parseInt(new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu', year: 'numeric' }))
  )

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [showAssignSport, setShowAssignSport] = useState<Player | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    first_name: '',
    last_name: '',
    jersey_number: null,
  })
  const [seasonForm, setSeasonForm] = useState<SeasonFormData>({
    sport_id: '',
    season_year: seasonYear,
    jersey_number: null,
    position: '',
    grade: '',
    is_captain: false,
  })

  // Hooks
  const { rosters, allPlayers, isLoading: rosterLoading, refetch: refetchRoster } = useRoster({
    schoolId: selectedSchoolId,
    sportId: selectedSportId || undefined,
    seasonYear,
  })
  const { addPlayer, updatePlayer, deletePlayer, assignToSport, isLoading: mutationLoading, error: mutationError } = useRosterMutations(selectedSchoolId)

  // Get current school and sport for display
  const selectedSchool = schools.find(s => s.id === selectedSchoolId)
  const selectedSport = sports.find(s => s.id === selectedSportId)

  // Check authorization
  useEffect(() => {
    if (!authLoading && (!user || !profile?.is_admin)) {
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

    const newPlayer = await addPlayer({
      first_name: playerForm.first_name,
      last_name: playerForm.last_name,
      jersey_number: playerForm.jersey_number,
    })

    if (newPlayer) {
      setMessage({ type: 'success', text: 'Player added successfully' })
      setPlayerForm({ first_name: '', last_name: '', jersey_number: null })
      setShowAddPlayer(false)
      refetchRoster()
    } else {
      setMessage({ type: 'error', text: mutationError || 'Failed to add player' })
    }
  }

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return

    const success = await updatePlayer(editingPlayer.id, {
      first_name: playerForm.first_name,
      last_name: playerForm.last_name,
      jersey_number: playerForm.jersey_number,
    })

    if (success) {
      setMessage({ type: 'success', text: 'Player updated successfully' })
      setEditingPlayer(null)
      refetchRoster()
    } else {
      setMessage({ type: 'error', text: mutationError || 'Failed to update player' })
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to remove this player?')) return

    const success = await deletePlayer(playerId)

    if (success) {
      setMessage({ type: 'success', text: 'Player removed successfully' })
      refetchRoster()
    } else {
      setMessage({ type: 'error', text: mutationError || 'Failed to remove player' })
    }
  }

  const handleAssignToSport = async () => {
    if (!showAssignSport || !seasonForm.sport_id) {
      setMessage({ type: 'error', text: 'Please select a sport' })
      return
    }

    const success = await assignToSport(showAssignSport.id, seasonForm.sport_id, {
      season_year: seasonForm.season_year,
      jersey_number: seasonForm.jersey_number,
      position: seasonForm.position || null,
      grade: seasonForm.grade || null,
      is_captain: seasonForm.is_captain,
    })

    if (success) {
      setMessage({ type: 'success', text: 'Player assigned to sport successfully' })
      setShowAssignSport(null)
      setSeasonForm({
        sport_id: '',
        season_year: seasonYear,
        jersey_number: null,
        position: '',
        grade: '',
        is_captain: false,
      })
      refetchRoster()
    } else {
      setMessage({ type: 'error', text: mutationError || 'Failed to assign player' })
    }
  }

  const openEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setPlayerForm({
      first_name: player.first_name,
      last_name: player.last_name,
      jersey_number: player.jersey_number,
    })
  }

  const openAssignSport = (player: Player) => {
    setShowAssignSport(player)
    setSeasonForm({
      sport_id: selectedSportId || '',
      season_year: seasonYear,
      jersey_number: player.jersey_number,
      position: '',
      grade: '',
      is_captain: false,
    })
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  if (!user || !profile?.is_admin) {
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
        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* School selector */}
          <div>
            <label className="block text-sm font-display text-foreground-muted mb-2">
              School
            </label>
            <select
              value={selectedSchoolId || ''}
              onChange={e => setSelectedSchoolId(e.target.value || null)}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              disabled={schoolsLoading}
            >
              <option value="">Select a school...</option>
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
              Sport (optional)
            </label>
            <select
              value={selectedSportId || ''}
              onChange={e => setSelectedSportId(e.target.value || null)}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              disabled={sportsLoading}
            >
              <option value="">All Sports</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>
                  {getSportEmoji(sport.code)} {sport.display_name || sport.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season year selector */}
          <div>
            <label className="block text-sm font-display text-foreground-muted mb-2">
              Season Year
            </label>
            <select
              value={seasonYear}
              onChange={e => setSeasonYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>
                  {year}-{year + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content area */}
        {!selectedSchoolId ? (
          <div className="scoreboard-panel p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
            <p className="text-foreground-muted">Select a school to manage rosters</p>
          </div>
        ) : (
          <>
            {/* School header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {selectedSchool?.name}
                </h2>
                <p className="text-sm text-foreground-muted">
                  {filteredPlayers.length} players
                  {selectedSport && ` • ${selectedSport.display_name || selectedSport.name}`}
                </p>
              </div>

              <Button onClick={() => setShowAddPlayer(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </div>

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
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPlayers.map(rosterPlayer => (
                  <PlayerRow
                    key={rosterPlayer.player.id}
                    rosterPlayer={rosterPlayer}
                    onEdit={() => openEditPlayer(rosterPlayer.player)}
                    onDelete={() => handleDeletePlayer(rosterPlayer.player.id)}
                    onAssign={() => openAssignSport(rosterPlayer.player)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <Modal onClose={() => setShowAddPlayer(false)} title="Add Player">
          <div className="space-y-4">
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
            <div>
              <label className="block text-sm font-display text-foreground-muted mb-1">
                Jersey Number
              </label>
              <Input
                type="number"
                value={playerForm.jersey_number ?? ''}
                onChange={e => setPlayerForm(p => ({ ...p, jersey_number: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Jersey #"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowAddPlayer(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPlayer} disabled={mutationLoading}>
                {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <Modal onClose={() => setEditingPlayer(null)} title="Edit Player">
          <div className="space-y-4">
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
            <div>
              <label className="block text-sm font-display text-foreground-muted mb-1">
                Jersey Number
              </label>
              <Input
                type="number"
                value={playerForm.jersey_number ?? ''}
                onChange={e => setPlayerForm(p => ({ ...p, jersey_number: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Jersey #"
              />
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

      {/* Assign to Sport Modal */}
      {showAssignSport && (
        <Modal onClose={() => setShowAssignSport(null)} title={`Assign ${showAssignSport.first_name} ${showAssignSport.last_name} to Sport`}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-display text-foreground-muted mb-1">
                Sport *
              </label>
              <select
                value={seasonForm.sport_id}
                onChange={e => setSeasonForm(s => ({ ...s, sport_id: e.target.value }))}
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              >
                <option value="">Select sport...</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>
                    {getSportEmoji(sport.code)} {sport.display_name || sport.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-display text-foreground-muted mb-1">
                Season Year
              </label>
              <select
                value={seasonForm.season_year}
                onChange={e => setSeasonForm(s => ({ ...s, season_year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-neon-blue"
              >
                {[2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>
                    {year}-{year + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Jersey Number
                </label>
                <Input
                  type="number"
                  value={seasonForm.jersey_number ?? ''}
                  onChange={e => setSeasonForm(s => ({ ...s, jersey_number: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="#"
                />
              </div>
              <div>
                <label className="block text-sm font-display text-foreground-muted mb-1">
                  Grade
                </label>
                <select
                  value={seasonForm.grade}
                  onChange={e => setSeasonForm(s => ({ ...s, grade: e.target.value }))}
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
                value={seasonForm.position}
                onChange={e => setSeasonForm(s => ({ ...s, position: e.target.value }))}
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
                checked={seasonForm.is_captain}
                onChange={e => setSeasonForm(s => ({ ...s, is_captain: e.target.checked }))}
                className="rounded border-border"
              />
              <label htmlFor="is_captain" className="text-sm text-foreground flex items-center gap-1">
                <Star className="h-4 w-4 text-score-amber" />
                Team Captain
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowAssignSport(null)}>
                Cancel
              </Button>
              <Button onClick={handleAssignToSport} disabled={mutationLoading}>
                {mutationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Assign
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
  rosterPlayer: RosterPlayer
  onEdit: () => void
  onDelete: () => void
  onAssign: () => void
}

function PlayerRow({ rosterPlayer, onEdit, onDelete, onAssign }: PlayerRowProps) {
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
            {position && grade && <span>•</span>}
            {grade && <span>{grade}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onAssign} title="Assign to sport">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit} title="Edit player">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} title="Remove player" className="text-score-red hover:text-score-red">
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
