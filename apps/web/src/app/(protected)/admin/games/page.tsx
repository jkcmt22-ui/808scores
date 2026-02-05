'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn, hawaiiDatetimeToUTC, utcToHawaiiDatetime } from '@/lib/utils'
import { adminCache } from '@/lib/admin-cache'
import { perf } from '@/lib/perf'
import { GameRow } from '@/components/admin/game-row'
import { GameForm, initialFormData, type GameFormData } from '@/components/admin/game-form'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import type { GameWithTeams, Sport, School, GameStatus, TeamWithSchool, Tournament } from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'
import { getCurrentSeasonYear } from '@/hooks'

const GAMES_PER_PAGE = 20

export default function AdminGamesPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  const [games, setGames] = useState<GameWithTeams[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [teams, setTeams] = useState<TeamWithSchool[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [gamesPage, setGamesPage] = useState(1)
  const [dateSortOrder, setDateSortOrder] = useState<'desc' | 'asc'>('desc')
  const [editingGame, setEditingGame] = useState<GameWithTeams | null>(null)
  const [formData, setFormData] = useState<GameFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
  } | null>(null)
  const hasLoadedRef = useRef(false)

  // Fetch common data (sports, schools, teams, tournaments)
  const fetchCommonData = useCallback(async () => {
    if (!supabase) return

    try {
      const cachedSports = adminCache.getSports()
      if (cachedSports) {
        setSports(cachedSports)
      } else {
        const { data: sportsData, error: sportsError } = await supabase
          .from('sports')
          .select('*')
          .eq('active', true)
          .order('sort_order')

        if (!sportsError && sportsData) {
          setSports(sportsData as Sport[])
          adminCache.setSports(sportsData as Sport[])
        }
      }

      const cachedSchools = adminCache.getSchools()
      if (cachedSchools) {
        setSchools(cachedSchools)
      } else {
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select('*')
          .order('name')

        if (!schoolsError && schoolsData) {
          setSchools(schoolsData as School[])
          adminCache.setSchools(schoolsData as School[])
        }
      }

      // Fetch teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*, school:schools(*)')
        .eq('is_active', true)
        .eq('season_year', getCurrentSeasonYear())
        .order('school_id')

      if (teamsData) setTeams(teamsData as TeamWithSchool[])

      // Fetch tournaments
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'in_progress'])
        .order('start_date', { ascending: false })

      if (tournamentsData) setTournaments(tournamentsData as Tournament[])
    } catch (err) {
      console.error('Error fetching common data:', err)
    }
  }, [supabase])

  // Fetch games
  const fetchGames = useCallback(async () => {
    if (!supabase) return

    const endTimer = perf.start('Admin Games: Fetch Games')
    setIsLoading(true)

    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*))
        `)
        .order('scheduled_at', { ascending: false })
        .limit(100)

      if (gamesError) {
        toast({ type: 'error', text: `Failed to load games: ${gamesError.message}` })
      } else if (gamesData) {
        setGames(gamesData as GameWithTeams[])
      }
    } catch (err) {
      console.error('Error fetching games:', err)
      toast({ type: 'error', text: 'Failed to load games' })
    } finally {
      endTimer()
      setIsLoading(false)
    }
  }, [supabase, toast])

  // Initial load
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    fetchCommonData()
    fetchGames()
  }, [fetchCommonData, fetchGames])

  // Filter and sort games
  const filteredGames = useMemo(() => {
    const filtered = games.filter((game) => {
      const homeSchool = getHomeSchool(game)
      const awaySchool = getAwaySchool(game)
      const matchesSearch =
        searchTerm === '' ||
        homeSchool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        awaySchool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.sport.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || game.status === statusFilter

      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      const dateA = new Date(a.scheduled_at).getTime()
      const dateB = new Date(b.scheduled_at).getTime()
      return dateSortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })
  }, [games, searchTerm, statusFilter, dateSortOrder])

  // Paginate games
  const totalGamePages = Math.ceil(filteredGames.length / GAMES_PER_PAGE)
  const paginatedGames = useMemo(() => {
    const startIndex = (gamesPage - 1) * GAMES_PER_PAGE
    return filteredGames.slice(startIndex, startIndex + GAMES_PER_PAGE)
  }, [filteredGames, gamesPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setGamesPage(1)
  }, [searchTerm, statusFilter, dateSortOrder])

  // Handle form changes
  const handleFormChange = (field: keyof GameFormData, value: string | number | boolean) => {
    setFormData((prev) => {
      if (field === 'sport_id' && value !== prev.sport_id) {
        return { ...prev, sport_id: value as string, home_team_id: '', away_team_id: '', tournament_id: '', tournament_round: '' }
      }
      if (field === 'tournament_id' && value) {
        return { ...prev, tournament_id: value as string, game_type: 'tournament' }
      }
      if (field === 'tournament_id' && !value) {
        return { ...prev, tournament_id: '', tournament_round: '', game_type: prev.game_type === 'tournament' ? 'regular_season' : prev.game_type }
      }
      if (field === 'tournament_round' && value === 'final') {
        return { ...prev, tournament_round: value as string, game_type: 'championship' }
      }
      return { ...prev, [field]: value }
    })
  }

  // Update game
  const handleUpdateGame = async () => {
    if (!supabase || !editingGame) return

    setIsSaving(true)
    try {
      const updateData = {
        status: formData.status,
        game_type: formData.game_type,
        home_score: formData.home_score,
        away_score: formData.away_score,
        current_period: formData.current_period || null,
        time_remaining: formData.time_remaining || null,
        is_verified: formData.is_verified,
        golden_game: formData.golden_game,
        venue: formData.venue || null,
        tournament_id: formData.tournament_id || null,
        tournament_round: formData.tournament_round || null,
        home_team_source_game_id: formData.home_team_source_game_id || null,
        home_team_source_type: formData.home_team_source_type || null,
        away_team_source_game_id: formData.away_team_source_game_id || null,
        away_team_source_type: formData.away_team_source_type || null,
      }

      const { data: updatedGame, error } = await supabase
        .from('games')
        .update(updateData as never)
        .eq('id', editingGame.id)
        .select(`
          *,
          sport:sports(*),
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*))
        `)
        .single()

      if (error) throw error

      if (updatedGame) {
        setGames(prev => prev.map(g =>
          g.id === editingGame.id ? updatedGame as GameWithTeams : g
        ))
        toast({ type: 'success', text: 'Game updated successfully' })
        setEditingGame(null)
      }
    } catch (err) {
      console.error('Error updating game:', err)
      toast({ type: 'error', text: 'Failed to update game' })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete game
  const handleDeleteGame = (gameId: string) => {
    if (!supabase) return
    setConfirmAction({
      action: async () => {
        try {
          const { error } = await supabase
            .from('games')
            .delete()
            .eq('id', gameId)

          if (error) throw error

          setGames((prev) => prev.filter((g) => g.id !== gameId))
          toast({ type: 'success', text: 'Game deleted successfully' })
        } catch (err) {
          console.error('Error deleting game:', err)
          toast({ type: 'error', text: 'Failed to delete game' })
        }
      },
      title: 'Delete Game',
      description: 'Are you sure you want to delete this game? This cannot be undone.',
      confirmLabel: 'Delete',
    })
  }

  // Quick update game (for inline score editing)
  const handleQuickUpdate = async (
    gameId: string,
    updates: { home_score?: number; away_score?: number; status?: GameStatus }
  ) => {
    if (!supabase) return

    const endTimer = perf.start('Admin Games: Quick Update Score')
    try {
      const { error } = await supabase
        .from('games')
        .update(updates as never)
        .eq('id', gameId)

      if (error) throw error

      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId ? { ...g, ...updates } : g
        )
      )
      toast({ type: 'success', text: 'Score updated' })
    } catch (err) {
      console.error('Error updating game:', err)
      toast({ type: 'error', text: 'Failed to update score' })
    } finally {
      endTimer()
    }
  }

  // Start editing a game
  const startEditing = (game: GameWithTeams) => {
    setEditingGame(game)
    const gameWithExtras = game as GameWithTeams & {
      photos_url?: string | null
      instagram_url?: string | null
      streaming_url?: string | null
      tournament_id?: string | null
      tournament_round?: string | null
    }
    setFormData({
      sport_id: game.sport_id,
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      scheduled_at: utcToHawaiiDatetime(game.scheduled_at),
      venue: game.venue || '',
      status: game.status,
      game_type: game.game_type,
      home_score: game.home_score,
      away_score: game.away_score,
      current_period: game.current_period || '',
      time_remaining: game.time_remaining || '',
      is_verified: game.is_verified,
      golden_game: game.golden_game,
      photos_url: gameWithExtras.photos_url || '',
      instagram_url: gameWithExtras.instagram_url || '',
      streaming_url: gameWithExtras.streaming_url || '',
      tournament_id: gameWithExtras.tournament_id || '',
      tournament_round: gameWithExtras.tournament_round || '',
      home_team_source_game_id: gameWithExtras.home_team_source_game_id || '',
      home_team_source_type: gameWithExtras.home_team_source_type || '',
      away_team_source_game_id: gameWithExtras.away_team_source_game_id || '',
      away_team_source_type: gameWithExtras.away_team_source_type || '',
    })
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg neon-text-yellow">
          Manage Games
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchGames}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            size="sm"
            onClick={() => router.push('/admin/games/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Game
          </Button>
        </div>
      </div>

      {/* Edit Game Modal */}
      {editingGame && (
        <Card className="mb-6 p-4">
          <h2 className="font-display font-bold text-lg mb-4 neon-text-blue">
            Edit: {getAwaySchool(editingGame).short_name} @ {getHomeSchool(editingGame).short_name}
          </h2>
          <GameForm
            formData={formData}
            onChange={handleFormChange}
            sports={sports}
            teams={teams}
            tournaments={tournaments}
            games={games}
            isEdit={true}
            editingGame={editingGame}
          />
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setEditingGame(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGame} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      {!editingGame && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search games..."
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
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="final">Final</option>
              <option value="postponed">Postponed</option>
              <option value="canceled">Canceled</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setDateSortOrder(dateSortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2"
              title={dateSortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            >
              <Calendar className="h-4 w-4" />
              {dateSortOrder === 'desc' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              <span className="hidden sm:inline text-xs">
                {dateSortOrder === 'desc' ? 'Newest' : 'Oldest'}
              </span>
            </Button>
          </div>

          {/* Games List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground-muted font-display">No games found</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedGames.map((game) => (
                  <GameRow
                    key={game.id}
                    game={game}
                    onEdit={() => startEditing(game)}
                    onDelete={() => handleDeleteGame(game.id)}
                    onQuickUpdate={handleQuickUpdate}
                    onEnterStats={() => router.push(`/admin/games/${game.id}/stats`)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalGamePages > 1 && (
                <div className="flex items-center justify-between mt-6 p-4 border-2 border-border bg-background-secondary">
                  <div className="text-sm text-foreground-muted">
                    Showing {(gamesPage - 1) * GAMES_PER_PAGE + 1}-{Math.min(gamesPage * GAMES_PER_PAGE, filteredGames.length)} of {filteredGames.length} games
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGamesPage(p => Math.max(1, p - 1))}
                      disabled={gamesPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalGamePages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalGamePages ||
                          Math.abs(page - gamesPage) <= 1
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={page === gamesPage ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setGamesPage(page)}
                              className="min-w-[2.5rem]"
                            >
                              {page}
                            </Button>
                          )
                        } else if (
                          page === gamesPage - 2 ||
                          page === gamesPage + 2
                        ) {
                          return <span key={page} className="px-1">...</span>
                        }
                        return null
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGamesPage(p => Math.min(totalGamePages, p + 1))}
                      disabled={gamesPage === totalGamePages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        onConfirm={async () => { await confirmAction?.action(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Delete'}
        variant="destructive"
      />
    </div>
  )
}
