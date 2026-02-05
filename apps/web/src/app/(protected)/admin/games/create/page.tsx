'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { hawaiiDatetimeToUTC } from '@/lib/utils'
import { adminCache } from '@/lib/admin-cache'
import { GameForm, initialFormData, type GameFormData } from '@/components/admin/game-form'
import type { GameWithTeams, Sport, School, TeamWithSchool, Tournament } from '@/types/database'
import { getCurrentSeasonYear } from '@/hooks'

export default function AdminCreateGamePage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  const [sports, setSports] = useState<Sport[]>([])
  const [teams, setTeams] = useState<TeamWithSchool[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [formData, setFormData] = useState<GameFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const hasLoadedRef = useRef(false)

  // Fetch reference data needed for the form
  const fetchReferenceData = useCallback(async () => {
    if (!supabase) return
    setIsLoadingData(true)

    try {
      // Sports
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
          setSports(sportsData as Sport[])
          adminCache.setSports(sportsData as Sport[])
        }
      }

      // Teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*, school:schools(*)')
        .eq('is_active', true)
        .eq('season_year', getCurrentSeasonYear())
        .order('school_id')

      if (teamsData) setTeams(teamsData as TeamWithSchool[])

      // Tournaments
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'in_progress'])
        .order('start_date', { ascending: false })

      if (tournamentsData) setTournaments(tournamentsData as Tournament[])

      // Games (needed for tournament source game dropdowns)
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*))
        `)
        .order('scheduled_at', { ascending: false })
        .limit(100)

      if (gamesData) setGames(gamesData as GameWithTeams[])
    } catch (err) {
      console.error('Error fetching reference data:', err)
      toast({ type: 'error', text: 'Failed to load form data' })
    } finally {
      setIsLoadingData(false)
    }
  }, [supabase, toast])

  const fetchTeams = useCallback(async () => {
    if (!supabase) return 0

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*, school:schools(*)')
      .eq('is_active', true)
      .eq('season_year', getCurrentSeasonYear())
      .order('school_id')

    if (teamsData) {
      setTeams(teamsData as TeamWithSchool[])
      return teamsData.length
    }
    return 0
  }, [supabase])

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    fetchReferenceData()
  }, [fetchReferenceData])

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

  // Create game
  const handleCreateGame = async () => {
    if (!supabase) return
    if (!formData.sport_id || !formData.home_team_id || !formData.away_team_id || !formData.scheduled_at) {
      toast({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setIsSaving(true)

    try {
      const gameData = {
        sport_id: formData.sport_id,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        scheduled_at: hawaiiDatetimeToUTC(formData.scheduled_at),
        venue: formData.venue || null,
        status: formData.status,
        game_type: formData.game_type,
        home_score: formData.home_score,
        away_score: formData.away_score,
        current_period: formData.current_period || null,
        time_remaining: formData.time_remaining || null,
        is_verified: formData.is_verified,
        golden_game: formData.golden_game,
        tournament_id: formData.tournament_id || null,
        tournament_round: formData.tournament_round || null,
        home_team_source_game_id: formData.home_team_source_game_id || null,
        home_team_source_type: formData.home_team_source_type || null,
        away_team_source_game_id: formData.away_team_source_game_id || null,
        away_team_source_type: formData.away_team_source_type || null,
      }

      const { data: newGame, error } = await supabase
        .from('games')
        .insert(gameData as never)
        .select(`
          *,
          sport:sports(*),
          home_team:teams!games_home_team_id_fkey(*, school:schools(*)),
          away_team:teams!games_away_team_id_fkey(*, school:schools(*))
        `)
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      toast({ type: 'success', text: 'Game created successfully' })
      // Navigate back to games list
      router.push('/admin/games')
    } catch (err) {
      console.error('Error creating game:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game'
      toast({ type: 'error', text: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg neon-text-green">Create New Game</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              toast({ type: 'info', text: 'Refreshing teams...' })
              const count = await fetchTeams()
              toast({ type: 'success', text: `Loaded ${count} teams` })
            }}
            title="Refresh teams (use after adding new schools)"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="text-xs">{teams.length} teams</span>
          </Button>
        </div>
        <GameForm
          formData={formData}
          onChange={handleFormChange}
          sports={sports}
          teams={teams}
          tournaments={tournaments}
          games={games}
          isEdit={false}
          editingGame={null}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => router.push('/admin/games')}>
            Cancel
          </Button>
          <Button onClick={handleCreateGame} disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Game'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
