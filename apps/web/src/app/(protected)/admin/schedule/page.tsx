'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  X,
  Save,
  MapPin,
  Copy,
  Trash2,
  BarChart3,
} from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { adminCache } from '@/lib/admin-cache'
import type { GameWithTeams, Sport, School, GameStatus, GameType } from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'

interface GameFormData {
  sport_id: string
  home_team_id: string
  away_team_id: string
  scheduled_at: string
  venue: string
  status: GameStatus
  game_type: GameType
  streaming_url: string
  predictions_enabled: boolean
}

const initialFormData: GameFormData = {
  sport_id: '',
  home_team_id: '',
  away_team_id: '',
  scheduled_at: '',
  venue: '',
  status: 'scheduled',
  game_type: 'regular_season',
  streaming_url: '',
  predictions_enabled: false,
}

// Get start of week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get end of week (Saturday)
function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

// Format date for display
function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Format date for week header
function formatWeekHeader(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

// Get days of the week
function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Check if date is today
function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export default function ScheduleAdminPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  // Week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()))

  // Data
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingGame, setEditingGame] = useState<GameWithTeams | null>(null)
  const [formData, setFormData] = useState<GameFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true

  // Computed values
  const weekEnd = useMemo(() => getWeekEnd(currentWeekStart), [currentWeekStart])
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart])

  // Fetch games for the current week
  const fetchGames = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // After migration 072, games reference teams instead of schools
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        sport:sports(*),
        home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
        away_team:teams!games_away_team_id_fkey(*, school:schools(*))
      `)
      .gte('scheduled_at', currentWeekStart.toISOString())
      .lte('scheduled_at', weekEnd.toISOString())
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.error('Error fetching games:', error)
    } else if (data) {
      setGames(data as GameWithTeams[])
    }

    setIsLoading(false)
  }, [supabase, currentWeekStart, weekEnd])

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!supabase) return

      // Check cache for sports
      const cachedSports = adminCache.getSports()
      if (cachedSports) {
        setSports(cachedSports)
      } else {
        const { data: sportsData } = await supabase
          .from('sports')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        if (sportsData) {
          const sports = sportsData as Sport[]
          setSports(sports)
          adminCache.setSports(sports)
        }
      }

      // Check cache for schools
      const cachedSchools = adminCache.getSchools()
      if (cachedSchools) {
        setSchools(cachedSchools)
      } else {
        const { data: schoolsData } = await supabase
          .from('schools')
          .select('*')
          .order('name')

        if (schoolsData) {
          const schools = schoolsData as School[]
          setSchools(schools)
          adminCache.setSchools(schools)
        }
      }
    }

    if (hasAdminAccess) {
      fetchInitialData()
    }
  }, [supabase, hasAdminAccess])

  // Fetch games when week changes
  useEffect(() => {
    if (hasAdminAccess) {
      fetchGames()
    }
  }, [fetchGames, hasAdminAccess])

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSport = sportFilter === 'all' || game.sport_id === sportFilter
      const homeSchool = getHomeSchool(game)
      const awaySchool = getAwaySchool(game)
      const matchesLeague =
        leagueFilter === 'all' ||
        homeSchool.league === leagueFilter ||
        awaySchool.league === leagueFilter
      const matchesSearch =
        searchTerm === '' ||
        homeSchool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        awaySchool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        homeSchool.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        awaySchool.short_name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSport && matchesLeague && matchesSearch
    })
  }, [games, sportFilter, leagueFilter, searchTerm])

  // Group games by day
  const gamesByDay = useMemo(() => {
    const grouped = new Map<string, GameWithTeams[]>()

    for (const day of weekDays) {
      const key = day.toISOString().split('T')[0]
      grouped.set(key, [])
    }

    for (const game of filteredGames) {
      const gameDate = new Date(game.scheduled_at)
      const key = gameDate.toISOString().split('T')[0]
      if (grouped.has(key)) {
        grouped.get(key)!.push(game)
      }
    }

    return grouped
  }, [filteredGames, weekDays])

  // Week navigation
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    setCurrentWeekStart(newStart)
  }

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    setCurrentWeekStart(newStart)
  }

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()))
  }

  // Form handlers
  const handleFormChange = (field: keyof GameFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const openAddForm = (date: Date) => {
    const localDate = new Date(date)
    localDate.setHours(17, 0, 0, 0) // Default to 5 PM
    const formatted = localDate.toISOString().slice(0, 16)

    setSelectedDate(date)
    setEditingGame(null)
    setFormData({
      ...initialFormData,
      scheduled_at: formatted,
    })
    setShowForm(true)
  }

  const openEditForm = (game: GameWithTeams) => {
    setEditingGame(game)
    setSelectedDate(new Date(game.scheduled_at))
    const gameExtended = game as GameWithTeams & { streaming_url?: string | null; predictions_enabled?: boolean }
    setFormData({
      sport_id: game.sport_id,
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      scheduled_at: new Date(game.scheduled_at).toISOString().slice(0, 16),
      venue: game.venue || '',
      status: game.status,
      game_type: game.game_type,
      streaming_url: gameExtended.streaming_url || '',
      predictions_enabled: gameExtended.predictions_enabled || false,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingGame(null)
    setSelectedDate(null)
    setFormData(initialFormData)
  }

  // Create game
  const handleCreateGame = async () => {
    if (!formData.sport_id || !formData.home_team_id || !formData.away_team_id || !formData.scheduled_at) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (formData.home_team_id === formData.away_team_id) {
      setMessage({ type: 'error', text: 'Home and away teams must be different' })
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
        .from('games')
        .insert({
          sport_id: formData.sport_id,
          home_team_id: formData.home_team_id,
          away_team_id: formData.away_team_id,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          venue: formData.venue || null,
          status: formData.status,
          game_type: formData.game_type,
          home_score: 0,
          away_score: 0,
          streaming_url: formData.streaming_url || null,
          predictions_enabled: formData.predictions_enabled,
        } as never)

      if (error) throw error

      setMessage({ type: 'success', text: 'Game created successfully' })
      closeForm()
      fetchGames()
    } catch (err) {
      console.error('Error creating game:', err)
      setMessage({ type: 'error', text: 'Failed to create game' })
    } finally {
      setIsSaving(false)
    }
  }

  // Update game
  const handleUpdateGame = async () => {
    if (!editingGame) return

    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('games')
        .update({
          sport_id: formData.sport_id,
          home_team_id: formData.home_team_id,
          away_team_id: formData.away_team_id,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          venue: formData.venue || null,
          status: formData.status,
          game_type: formData.game_type,
          streaming_url: formData.streaming_url || null,
          predictions_enabled: formData.predictions_enabled,
        } as never)
        .eq('id', editingGame.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Game updated successfully' })
      closeForm()
      fetchGames()
    } catch (err) {
      console.error('Error updating game:', err)
      setMessage({ type: 'error', text: 'Failed to update game' })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete game
  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This cannot be undone.')) {
      return
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    try {
      const { error } = await supabase.from('games').delete().eq('id', gameId)
      if (error) throw error

      setMessage({ type: 'success', text: 'Game deleted' })
      fetchGames()
    } catch (err) {
      console.error('Error deleting game:', err)
      setMessage({ type: 'error', text: 'Failed to delete game' })
    }
  }

  // Duplicate game (for recurring schedule)
  const handleDuplicateGame = async (game: GameWithTeams, daysToAdd: number) => {
    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    const newDate = new Date(game.scheduled_at)
    newDate.setDate(newDate.getDate() + daysToAdd)

    try {
      const { error } = await supabase
        .from('games')
        .insert({
          sport_id: game.sport_id,
          home_team_id: game.home_team_id,
          away_team_id: game.away_team_id,
          scheduled_at: newDate.toISOString(),
          venue: game.venue,
          status: 'scheduled',
          game_type: game.game_type,
          home_score: 0,
          away_score: 0,
        } as never)

      if (error) throw error

      setMessage({ type: 'success', text: `Game duplicated to ${formatDateDisplay(newDate)}` })
      fetchGames()
    } catch (err) {
      console.error('Error duplicating game:', err)
      setMessage({ type: 'error', text: 'Failed to duplicate game' })
    }
  }

  // Clear message after delay
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
    router.push('/login?redirect=/admin/schedule')
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

  // Get unique leagues from schools
  const leagues = [...new Set(schools.map((s) => s.league).filter(Boolean))] as string[]

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
              Schedule
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Message */}
        {message && (
          <div
            className={cn(
              'mb-4 flex items-center gap-2 p-3 text-sm border-2',
              message.type === 'success'
                ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                : 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink'
            )}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="font-display font-bold text-lg text-foreground">
              {formatWeekHeader(currentWeekStart, weekEnd)}
            </h2>
            <p className="text-xs text-foreground-muted">
              {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} this week
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
          >
            <option value="all">All Sports</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.display_name || sport.name}
              </option>
            ))}
          </select>
          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
          >
            <option value="all">All Leagues</option>
            {leagues.map((league) => (
              <option key={league} value={league}>
                {league}
              </option>
            ))}
          </select>
        </div>

        {/* Week View */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          </div>
        ) : (
          <div className="space-y-4">
            {weekDays.map((day) => {
              const dateKey = day.toISOString().split('T')[0]
              const dayGames = gamesByDay.get(dateKey) || []
              const dayIsToday = isToday(day)

              return (
                <div
                  key={dateKey}
                  className={cn(
                    'border-2 border-border',
                    dayIsToday && 'border-neon-blue/50'
                  )}
                >
                  {/* Day Header */}
                  <div
                    className={cn(
                      'flex items-center justify-between px-4 py-3 border-b-2 border-border',
                      dayIsToday ? 'bg-neon-blue/10' : 'bg-background-secondary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className={cn('h-5 w-5', dayIsToday ? 'text-neon-blue' : 'text-foreground-muted')} />
                      <span
                        className={cn(
                          'font-display font-bold',
                          dayIsToday ? 'text-neon-blue' : 'text-foreground'
                        )}
                      >
                        {formatDateDisplay(day)}
                      </span>
                      {dayIsToday && (
                        <Badge variant="default" className="text-[10px]">
                          Today
                        </Badge>
                      )}
                      <span className="text-xs text-foreground-muted">
                        ({dayGames.length} game{dayGames.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openAddForm(day)}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {/* Day Games */}
                  <div className="p-2">
                    {dayGames.length === 0 ? (
                      <div className="text-center py-4 text-foreground-muted text-sm">
                        No games scheduled
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayGames.map((game) => (
                          <ScheduleGameRow
                            key={game.id}
                            game={game}
                            onEdit={() => openEditForm(game)}
                            onDelete={() => handleDeleteGame(game.id)}
                            onDuplicate={(days) => handleDuplicateGame(game, days)}
                            onStats={() => router.push(`/admin/games/${game.id}/stats`)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add/Edit Game Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg neon-text-blue">
                  {editingGame ? 'Edit Game' : 'Add Game'}
                </h2>
                <Button variant="ghost" size="icon" onClick={closeForm}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {selectedDate && (
                <p className="text-sm text-foreground-muted mb-4">
                  {formatDateDisplay(selectedDate)}
                </p>
              )}

              <div className="space-y-4">
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

                {/* Teams */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Away Team *</label>
                    <select
                      value={formData.away_team_id}
                      onChange={(e) => handleFormChange('away_team_id', e.target.value)}
                      className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                    >
                      <option value="">Select team...</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.short_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Home Team *</label>
                    <select
                      value={formData.home_team_id}
                      onChange={(e) => handleFormChange('home_team_id', e.target.value)}
                      className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                    >
                      <option value="">Select team...</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.short_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date/Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => handleFormChange('scheduled_at', e.target.value)}
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Venue</label>
                  <Input
                    placeholder="e.g., Aloha Stadium"
                    value={formData.venue}
                    onChange={(e) => handleFormChange('venue', e.target.value)}
                  />
                </div>

                {/* Stream URL */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Live Stream URL</label>
                  <Input
                    placeholder="https://youtube.com/watch?v=... or NFHS Network link"
                    value={formData.streaming_url}
                    onChange={(e) => handleFormChange('streaming_url', e.target.value)}
                  />
                </div>

                {/* Status & Game Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value as GameStatus)}
                      className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="final">Final</option>
                      <option value="postponed">Postponed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Game Type</label>
                    <select
                      value={formData.game_type}
                      onChange={(e) => handleFormChange('game_type', e.target.value as GameType)}
                      className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                    >
                      <option value="regular_season">Regular Season</option>
                      <option value="playoff">Playoff</option>
                      <option value="championship">Championship</option>
                      <option value="tournament">Tournament</option>
                      <option value="exhibition">Exhibition</option>
                      <option value="scrimmage">Scrimmage</option>
                    </select>
                  </div>
                </div>

                {/* Predictions Toggle */}
                <div className="flex items-center gap-3 p-3 border-2 border-border bg-background-secondary">
                  <input
                    type="checkbox"
                    id="predictions_enabled"
                    checked={formData.predictions_enabled}
                    onChange={(e) => setFormData((prev) => ({ ...prev, predictions_enabled: e.target.checked }))}
                    className="h-5 w-5 border-2 border-border bg-background text-neon-yellow focus:ring-neon-yellow"
                  />
                  <div>
                    <label htmlFor="predictions_enabled" className="block text-sm font-medium text-foreground cursor-pointer">
                      Enable Predictions
                    </label>
                    <p className="text-xs text-foreground-muted">
                      Allow users to predict the final score and earn points
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button
                    onClick={editingGame ? handleUpdateGame : handleCreateGame}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingGame ? 'Save Changes' : 'Create Game'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

// Schedule Game Row Component
function ScheduleGameRow({
  game,
  onEdit,
  onDelete,
  onDuplicate,
  onStats,
}: {
  game: GameWithTeams
  onEdit: () => void
  onDelete: () => void
  onDuplicate: (days: number) => void
  onStats: () => void
}) {
  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false)

  // After migration 072: Get school data from team or directly
  const homeSchool = getHomeSchool(game)
  const awaySchool = getAwaySchool(game)

  const gameTime = new Date(game.scheduled_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  const getStatusColor = () => {
    switch (game.status) {
      case 'in_progress':
        return 'text-neon-pink'
      case 'final':
        return 'text-neon-green'
      case 'postponed':
      case 'canceled':
        return 'text-foreground-muted'
      default:
        return 'text-neon-blue'
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-background-tertiary border border-border hover:border-neon-blue/50 transition-colors">
      {/* Time */}
      <div className="w-16 flex-shrink-0">
        <span className={cn('text-sm font-mono', getStatusColor())}>{gameTime}</span>
      </div>

      {/* Sport */}
      <Badge variant="outline" className="text-[10px] flex-shrink-0">
        {game.sport.display_name || game.sport.name}
      </Badge>

      {/* Teams */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 font-display text-sm">
          <span className="text-foreground font-bold truncate">{awaySchool.short_name}</span>
          <span className="text-foreground-muted">@</span>
          <span className="text-foreground font-bold truncate">{homeSchool.short_name}</span>
        </div>
        {game.venue && (
          <div className="flex items-center gap-1 text-xs text-foreground-subtle mt-0.5">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{game.venue}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {game.status !== 'scheduled' && (
        <Badge
          variant={
            game.status === 'in_progress'
              ? 'destructive'
              : game.status === 'final'
                ? 'success'
                : 'secondary'
          }
          className="text-[10px]"
        >
          {game.status === 'in_progress' ? 'LIVE' : game.status.toUpperCase()}
        </Badge>
      )}

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-neon-blue hover:text-neon-blue"
          onClick={onStats}
          title="Enter Stats"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowDuplicateMenu(!showDuplicateMenu)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {showDuplicateMenu && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-background border-2 border-border shadow-lg">
              <button
                className="block w-full px-3 py-2 text-xs text-left hover:bg-background-secondary whitespace-nowrap"
                onClick={() => {
                  onDuplicate(7)
                  setShowDuplicateMenu(false)
                }}
              >
                Copy to next week
              </button>
              <button
                className="block w-full px-3 py-2 text-xs text-left hover:bg-background-secondary whitespace-nowrap"
                onClick={() => {
                  onDuplicate(1)
                  setShowDuplicateMenu(false)
                }}
              >
                Copy to tomorrow
              </button>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-neon-pink hover:text-neon-pink" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
