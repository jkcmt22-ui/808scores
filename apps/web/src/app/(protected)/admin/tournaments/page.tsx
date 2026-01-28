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
  Trophy,
  ChevronLeft,
  Users,
  Calendar,
  MapPin,
  Search,
  Eye,
} from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useAuth, useSports } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type {
  Tournament,
  TournamentTeamWithSchool,
  Sport,
  School,
  TournamentFormat,
  TournamentStatus,
} from '@/types/database'

interface TournamentWithSport extends Tournament {
  sport: Sport
  tournament_teams?: TournamentTeamWithSchool[]
}

interface TournamentFormData {
  name: string
  sport_id: string
  format: TournamentFormat
  status: TournamentStatus
  description: string
  start_date: string
  end_date: string
  venue: string
  island: string
  num_teams: number | null
  season: string
  league: string
  division: string
}

const initialFormData: TournamentFormData = {
  name: '',
  sport_id: '',
  format: 'single_elimination',
  status: 'upcoming',
  description: '',
  start_date: '',
  end_date: '',
  venue: '',
  island: '',
  num_teams: null,
  season: '2025-26',
  league: '',
  division: '',
}

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  round_robin: 'Round Robin',
  pool_play: 'Pool Play',
  custom: 'Custom',
}

const STATUS_LABELS: Record<TournamentStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  canceled: 'Canceled',
}

const LEAGUES = ['OIA', 'ILH', 'BIIF', 'MIL', 'KIF', 'HHSAA']
const DIVISIONS = ['Division I', 'Division II', 'Open']
const ISLANDS = ['Oahu', 'Maui', 'Hawaii', 'Kauai', 'Molokai', 'Lanai']

export default function TournamentsAdminPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { sports } = useSports()
  const supabase = useMemo(() => createClient(), [])

  const [tournaments, setTournaments] = useState<TournamentWithSport[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingTournament, setEditingTournament] = useState<TournamentWithSport | null>(null)
  const [formData, setFormData] = useState<TournamentFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Teams management
  const [showTeamsModal, setShowTeamsModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<TournamentWithSport | null>(null)
  const [tournamentTeams, setTournamentTeams] = useState<TournamentTeamWithSchool[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [teamSeed, setTeamSeed] = useState<number | ''>('')
  const [teamPool, setTeamPool] = useState('')

  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      // Fetch tournaments with sport
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select(`
          *,
          sport:sports(*)
        `)
        .order('start_date', { ascending: false })

      if (tournamentsData) setTournaments(tournamentsData as TournamentWithSport[])

      // Fetch schools
      const { data: schoolsData } = await supabase
        .from('schools')
        .select('*')
        .order('name')

      if (schoolsData) setSchools(schoolsData as School[])

      setIsLoading(false)
    }

    if (hasAdminAccess) {
      fetchData()
    }
  }, [supabase, hasAdminAccess])

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      const matchesSearch =
        searchTerm === '' ||
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.sport.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || tournament.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tournaments, searchTerm, statusFilter])

  // Handle form changes
  const handleFormChange = (field: keyof TournamentFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Create tournament
  const handleCreateTournament = async () => {
    if (!formData.name || !formData.sport_id || !formData.start_date) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('tournaments')
        .insert({
          name: formData.name,
          sport_id: formData.sport_id,
          format: formData.format,
          status: formData.status,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          venue: formData.venue || null,
          island: formData.island || null,
          num_teams: formData.num_teams,
          season: formData.season || null,
          league: formData.league || null,
          division: formData.division || null,
        } as never)

      if (error) throw error

      setMessage({ type: 'success', text: 'Tournament created successfully' })
      setFormData(initialFormData)
      setShowForm(false)

      // Refresh tournaments
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select(`*, sport:sports(*)`)
        .order('start_date', { ascending: false })

      if (tournamentsData) setTournaments(tournamentsData as TournamentWithSport[])
    } catch (err) {
      console.error('Error creating tournament:', err)
      setMessage({ type: 'error', text: 'Failed to create tournament' })
    } finally {
      setIsSaving(false)
    }
  }

  // Update tournament
  const handleUpdateTournament = async () => {
    if (!editingTournament) return

    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('tournaments')
        .update({
          name: formData.name,
          sport_id: formData.sport_id,
          format: formData.format,
          status: formData.status,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          venue: formData.venue || null,
          island: formData.island || null,
          num_teams: formData.num_teams,
          season: formData.season || null,
          league: formData.league || null,
          division: formData.division || null,
        } as never)
        .eq('id', editingTournament.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Tournament updated successfully' })
      setEditingTournament(null)
      setShowForm(false)

      // Refresh tournaments
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select(`*, sport:sports(*)`)
        .order('start_date', { ascending: false })

      if (tournamentsData) setTournaments(tournamentsData as TournamentWithSport[])
    } catch (err) {
      console.error('Error updating tournament:', err)
      setMessage({ type: 'error', text: 'Failed to update tournament' })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete tournament
  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This will also remove all team associations.')) {
      return
    }

    if (!supabase) return

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)

      if (error) throw error

      setTournaments((prev) => prev.filter((t) => t.id !== tournamentId))
      setMessage({ type: 'success', text: 'Tournament deleted successfully' })
    } catch (err) {
      console.error('Error deleting tournament:', err)
      setMessage({ type: 'error', text: 'Failed to delete tournament' })
    }
  }

  // Start editing
  const startEditing = (tournament: TournamentWithSport) => {
    setEditingTournament(tournament)
    setFormData({
      name: tournament.name,
      sport_id: tournament.sport_id,
      format: tournament.format,
      status: tournament.status,
      description: tournament.description || '',
      start_date: tournament.start_date,
      end_date: tournament.end_date || '',
      venue: tournament.venue || '',
      island: tournament.island || '',
      num_teams: tournament.num_teams,
      season: tournament.season || '',
      league: tournament.league || '',
      division: tournament.division || '',
    })
    setShowForm(true)
  }

  // Open teams modal
  const openTeamsModal = async (tournament: TournamentWithSport) => {
    setSelectedTournament(tournament)
    setShowTeamsModal(true)

    if (!supabase) return

    // Fetch tournament teams
    const { data } = await supabase
      .from('tournament_teams')
      .select(`*, school:schools(*)`)
      .eq('tournament_id', tournament.id)
      .order('seed', { ascending: true, nullsFirst: false })

    if (data) setTournamentTeams(data as TournamentTeamWithSchool[])
  }

  // Add team to tournament
  const handleAddTeam = async () => {
    if (!selectedTournament || !selectedSchoolId) return

    if (!supabase) return

    try {
      const { error } = await supabase
        .from('tournament_teams')
        .insert({
          tournament_id: selectedTournament.id,
          school_id: selectedSchoolId,
          seed: teamSeed || null,
          pool: teamPool || null,
        } as never)

      if (error) throw error

      // Refresh teams
      const { data } = await supabase
        .from('tournament_teams')
        .select(`*, school:schools(*)`)
        .eq('tournament_id', selectedTournament.id)
        .order('seed', { ascending: true, nullsFirst: false })

      if (data) setTournamentTeams(data as TournamentTeamWithSchool[])

      setSelectedSchoolId('')
      setTeamSeed('')
      setTeamPool('')
      setMessage({ type: 'success', text: 'Team added to tournament' })
    } catch (err) {
      console.error('Error adding team:', err)
      setMessage({ type: 'error', text: 'Failed to add team' })
    }
  }

  // Remove team from tournament
  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm('Remove this team from the tournament?')) return

    if (!supabase) return

    try {
      const { error } = await supabase
        .from('tournament_teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      setTournamentTeams((prev) => prev.filter((t) => t.id !== teamId))
      setMessage({ type: 'success', text: 'Team removed from tournament' })
    } catch (err) {
      console.error('Error removing team:', err)
      setMessage({ type: 'error', text: 'Failed to remove team' })
    }
  }

  // Update team seed
  const handleUpdateTeamSeed = async (teamId: string, seed: number | null) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('tournament_teams')
        .update({ seed } as never)
        .eq('id', teamId)

      if (error) throw error

      setTournamentTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, seed } : t))
      )
    } catch (err) {
      console.error('Error updating seed:', err)
    }
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    router.push('/login?redirect=/admin/tournaments')
    return null
  }

  // No admin access
  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">Access Denied</h1>
        <p className="mb-4 text-foreground-muted text-sm text-center">
          You need admin privileges to access this area.
        </p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display font-bold text-lg neon-text-yellow uppercase tracking-wider">
              Tournaments
            </h1>
          </div>
          <Button
            onClick={() => {
              setEditingTournament(null)
              setFormData(initialFormData)
              setShowForm(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Tournament
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Message */}
        {message && (
          <div className={cn(
            'mb-4 flex items-center gap-2 p-3 text-sm border-2',
            message.type === 'success'
              ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
              : 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink'
          )}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <Card className="mb-6 p-4">
            <h2 className="font-display font-bold text-lg mb-4 neon-text-blue">
              {editingTournament ? 'Edit Tournament' : 'Create Tournament'}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                <Input
                  placeholder="e.g., 2026 HHSAA Boys Basketball State Championship"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
              </div>

              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sport *</label>
                <select
                  value={formData.sport_id}
                  onChange={(e) => handleFormChange('sport_id', e.target.value)}
                  className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                >
                  <option value="">Select sport...</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.display_name || sport.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => handleFormChange('format', e.target.value as TournamentFormat)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value as TournamentStatus)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleFormChange('start_date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleFormChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              {/* League, Division, Season */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">League</label>
                  <select
                    value={formData.league}
                    onChange={(e) => handleFormChange('league', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    <option value="">Select...</option>
                    {LEAGUES.map((league) => (
                      <option key={league} value={league}>{league}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Division</label>
                  <select
                    value={formData.division}
                    onChange={(e) => handleFormChange('division', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    <option value="">Select...</option>
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Season</label>
                  <Input
                    placeholder="2025-26"
                    value={formData.season}
                    onChange={(e) => handleFormChange('season', e.target.value)}
                  />
                </div>
              </div>

              {/* Venue & Island */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Venue</label>
                  <Input
                    placeholder="e.g., Neal Blaisdell Arena"
                    value={formData.venue}
                    onChange={(e) => handleFormChange('venue', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Island</label>
                  <select
                    value={formData.island}
                    onChange={(e) => handleFormChange('island', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    <option value="">Select...</option>
                    {ISLANDS.map((island) => (
                      <option key={island} value={island}>{island}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Number of Teams */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Number of Teams</label>
                <Input
                  type="number"
                  min="2"
                  placeholder="e.g., 8"
                  value={formData.num_teams || ''}
                  onChange={(e) => handleFormChange('num_teams', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  className="w-full h-20 px-3 py-2 border-2 border-border bg-background text-foreground font-display text-sm resize-none"
                  placeholder="Optional description..."
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTournament(null)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingTournament ? handleUpdateTournament : handleCreateTournament}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingTournament ? (
                    'Save Changes'
                  ) : (
                    'Create Tournament'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Teams Modal */}
        {showTeamsModal && selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b-2 border-border">
                <h2 className="font-display font-bold text-lg neon-text-blue">
                  Manage Teams: {selectedTournament.name}
                </h2>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                {/* Add Team Form */}
                <div className="mb-4 p-3 bg-background-secondary border-2 border-border">
                  <h3 className="font-display font-bold text-sm mb-3">Add Team</h3>
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="flex-1 min-w-[200px] h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                    >
                      <option value="">Select school...</option>
                      {schools
                        .filter((s) => !tournamentTeams.some((t) => t.school_id === s.id))
                        .map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                    </select>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Seed"
                      value={teamSeed}
                      onChange={(e) => setTeamSeed(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-20"
                    />
                    {selectedTournament.format === 'pool_play' && (
                      <Input
                        placeholder="Pool (A, B...)"
                        value={teamPool}
                        onChange={(e) => setTeamPool(e.target.value)}
                        className="w-24"
                      />
                    )}
                    <Button onClick={handleAddTeam} disabled={!selectedSchoolId}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Teams List */}
                <div className="space-y-2">
                  {tournamentTeams.length === 0 ? (
                    <p className="text-center text-foreground-muted py-8">
                      No teams added yet
                    </p>
                  ) : (
                    tournamentTeams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between gap-3 p-3 bg-background-secondary border-2 border-border"
                      >
                        <div className="flex items-center gap-3">
                          {team.seed && (
                            <span className="w-8 h-8 flex items-center justify-center bg-neon-yellow/20 text-neon-yellow font-display font-bold text-sm">
                              #{team.seed}
                            </span>
                          )}
                          <div>
                            <p className="font-display font-bold text-foreground">
                              {team.school.name}
                            </p>
                            {team.pool && (
                              <p className="text-xs text-foreground-muted">Pool {team.pool}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Seed"
                            value={team.seed || ''}
                            onChange={(e) => handleUpdateTeamSeed(
                              team.id,
                              e.target.value ? parseInt(e.target.value) : null
                            )}
                            className="w-20 h-8 text-sm"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveTeam(team.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 border-t-2 border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTeamsModal(false)
                    setSelectedTournament(null)
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        {!showForm && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tournaments List */}
        {!showForm && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
                <p className="text-foreground-muted font-display">No tournaments found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTournaments.map((tournament) => (
                  <TournamentRow
                    key={tournament.id}
                    tournament={tournament}
                    onEdit={() => startEditing(tournament)}
                    onDelete={() => handleDeleteTournament(tournament.id)}
                    onManageTeams={() => openTeamsModal(tournament)}
                    onView={() => router.push(`/tournaments/${tournament.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// Tournament Row Component
function TournamentRow({
  tournament,
  onEdit,
  onDelete,
  onManageTeams,
  onView,
}: {
  tournament: TournamentWithSport
  onEdit: () => void
  onDelete: () => void
  onManageTeams: () => void
  onView: () => void
}) {
  return (
    <div className={cn(
      'border-2 border-border bg-background-secondary p-4',
      tournament.status === 'in_progress' && 'border-neon-pink/50'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status & Sport */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              variant={
                tournament.status === 'in_progress'
                  ? 'destructive'
                  : tournament.status === 'completed'
                  ? 'secondary'
                  : tournament.status === 'canceled'
                  ? 'outline'
                  : 'default'
              }
              className="text-[10px]"
            >
              {STATUS_LABELS[tournament.status]}
            </Badge>
            <span className="text-[10px] text-neon-blue font-display font-bold uppercase">
              {tournament.sport.display_name || tournament.sport.name}
            </span>
            <Badge variant="warning" className="text-[10px]">
              {FORMAT_LABELS[tournament.format]}
            </Badge>
          </div>

          {/* Name */}
          <h3 className="font-display font-bold text-foreground mb-1">{tournament.name}</h3>

          {/* Details */}
          <div className="flex items-center gap-4 text-xs text-foreground-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(tournament.start_date).toLocaleDateString()}
              {tournament.end_date && ` - ${new Date(tournament.end_date).toLocaleDateString()}`}
            </span>
            {tournament.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {tournament.venue}
              </span>
            )}
            {tournament.num_teams && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {tournament.num_teams} teams
              </span>
            )}
            {tournament.league && (
              <span className="text-neon-yellow">{tournament.league}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onManageTeams}>
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
