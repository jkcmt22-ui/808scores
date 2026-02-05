'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus,
  Loader2,
  Calendar,
  Users,
  Trophy,
  Star,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { Button, Card, Badge, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import type { Season, Sport, SeasonStatus } from '@/types/database'

interface SeasonWithCounts extends Season {
  team_count?: number
}

export default function AdminSeasonsPage() {
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  // State
  const [seasons, setSeasons] = useState<SeasonWithCounts[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
    variant?: 'destructive' | 'default'
  } | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [formData, setFormData] = useState({
    year: '',
    display_name: '',
    start_date: '',
    end_date: '',
    sports_enabled: [] as string[],
  })

  // Fetch seasons and sports
  const fetchData = useCallback(async () => {
    if (!supabase) return

    setIsLoading(true)

    try {
      // Fetch seasons
      const { data: seasonsData, error: seasonsError } = await supabase
        .from('seasons')
        .select('*')
        .order('year', { ascending: false })

      if (seasonsError) throw seasonsError

      // Fetch sports
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('*')
        .eq('active', true)
        .order('sort_order')

      if (sportsError) throw sportsError

      // Get team counts per season in a single query (avoid N+1)
      const seasonYears = (seasonsData || []).map((s: Season) => s.year)
      const { data: teamsData } = await supabase
        .from('teams')
        .select('season_year')
        .in('season_year', seasonYears)
        .eq('is_active', true)

      // Count teams per season in JS
      const countsByYear: Record<string, number> = {}
      for (const team of teamsData || []) {
        const year = (team as { season_year: string }).season_year
        countsByYear[year] = (countsByYear[year] || 0) + 1
      }

      const seasonsWithCounts: SeasonWithCounts[] = (seasonsData || []).map((season: Season) => ({
        ...season,
        team_count: countsByYear[season.year] || 0,
      }))

      setSeasons(seasonsWithCounts)
      setSports((sportsData || []) as Sport[])
    } catch (err) {
      console.error('Error fetching data:', err)
      toast({ type: 'error', text: 'Failed to load data' })
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Generate next season year
  const generateNextYear = () => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    // Check if current-next exists, if so use next-next+1
    const currentSeason = `${currentYear}-${nextYear}`
    const exists = seasons.some(s => s.year === currentSeason)
    if (exists) {
      return `${nextYear}-${nextYear + 1}`
    }
    return currentSeason
  }

  // Open create form
  const handleCreate = () => {
    const nextYear = generateNextYear()
    setFormData({
      year: nextYear,
      display_name: `${nextYear} Season`,
      start_date: `${nextYear.split('-')[0]}-08-01`,
      end_date: `${nextYear.split('-')[1]}-06-30`,
      sports_enabled: sports.map(s => s.id),
    })
    setEditingSeason(null)
    setShowForm(true)
  }

  // Open edit form
  const handleEdit = (season: Season) => {
    setFormData({
      year: season.year,
      display_name: season.display_name || '',
      start_date: season.start_date || '',
      end_date: season.end_date || '',
      sports_enabled: season.sports_enabled || [],
    })
    setEditingSeason(season)
    setShowForm(true)
  }

  // Save season
  const handleSave = async () => {
    if (!supabase || !formData.year) {
      toast({ type: 'error', text: 'Please enter a season year' })
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        year: formData.year,
        display_name: formData.display_name || `${formData.year} Season`,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        sports_enabled: formData.sports_enabled,
      }

      if (editingSeason) {
        // Update
        const { error } = await supabase
          .from('seasons')
          .update(payload as never)
          .eq('id', editingSeason.id)

        if (error) throw error
        toast({ type: 'success', text: 'Season updated successfully' })
      } else {
        // Create
        const { error } = await supabase
          .from('seasons')
          .insert(payload as never)

        if (error) throw error
        toast({ type: 'success', text: 'Season created successfully' })
      }

      setShowForm(false)
      setEditingSeason(null)
      fetchData()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save season'
      toast({ type: 'error', text: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  // Set as current season
  const handleSetCurrent = async (seasonId: string) => {
    if (!supabase) return

    setIsSaving(true)

    try {
      // Use the set_current_season function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('set_current_season', {
        p_season_id: seasonId,
      })

      if (error) throw error

      toast({ type: 'success', text: 'Current season updated' })
      fetchData()
    } catch (err) {
      console.error('Error setting current season:', err)
      toast({ type: 'error', text: 'Failed to set current season' })
    } finally {
      setIsSaving(false)
    }
  }

  // Generate teams for a season
  const handleGenerateTeams = (season: Season) => {
    if (!supabase) return

    setConfirmAction({
      action: async () => {
        setIsGenerating(true)

        try {
          // Get all schools
          const { data: schools, error: schoolsError } = await supabase
            .from('schools')
            .select('id')

          if (schoolsError) throw schoolsError

          // Get enabled sports (or all if none specified)
          const enabledSportIds = season.sports_enabled?.length
            ? season.sports_enabled
            : sports.map(s => s.id)

          const enabledSports = sports.filter(s => enabledSportIds.includes(s.id))

          let createdCount = 0
          let skippedCount = 0

          // Create teams for each school + sport combination
          for (const school of (schools || []) as Array<{ id: string }>) {
            for (const sport of enabledSports) {
              // Check if team already exists
              const { data: existing } = await supabase
                .from('teams')
                .select('id')
                .eq('school_id', school.id)
                .eq('sport_id', sport.id)
                .eq('gender', sport.gender)
                .eq('level', 'varsity')
                .eq('season_year', season.year)
                .single()

              if (existing) {
                skippedCount++
                continue
              }

              // Create the team
              const { error: insertError } = await supabase
                .from('teams')
                .insert({
                  school_id: school.id,
                  sport_id: sport.id,
                  gender: sport.gender,
                  level: 'varsity',
                  season_year: season.year,
                  is_active: true,
                } as never)

              if (insertError) {
                console.error('Error creating team:', insertError)
              } else {
                createdCount++
              }
            }
          }

          toast({
            type: 'success',
            text: `Generated ${createdCount} teams (${skippedCount} already existed)`,
          })
          fetchData()
        } catch (err) {
          console.error('Error generating teams:', err)
          toast({ type: 'error', text: 'Failed to generate teams' })
        } finally {
          setIsGenerating(false)
        }
      },
      title: 'Generate Teams',
      description: `Generate teams for ${season.year}? This will create team entries for all schools \u00d7 all enabled sports (${season.sports_enabled?.length || sports.length} sports). Existing teams will not be duplicated.`,
      confirmLabel: 'Generate',
      variant: 'default',
    })
    return
  }

  // Toggle sport enabled
  const toggleSport = (sportId: string) => {
    setFormData(prev => ({
      ...prev,
      sports_enabled: prev.sports_enabled.includes(sportId)
        ? prev.sports_enabled.filter(id => id !== sportId)
        : [...prev.sports_enabled, sportId],
    }))
  }

  // Status badge color
  const getStatusColor = (status: SeasonStatus) => {
    switch (status) {
      case 'active':
        return 'bg-neon-green/20 text-neon-green border-neon-green/30'
      case 'planning':
        return 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30'
      case 'completed':
        return 'bg-foreground-muted/20 text-foreground-muted border-foreground-muted/30'
      default:
        return ''
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl neon-text-yellow uppercase tracking-wider">
            Seasons
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Manage competitive seasons and generate teams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            New Season
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="mb-6 p-4 border-2 border-neon-blue/30">
          <h2 className="font-display font-bold text-lg text-neon-blue mb-4">
            {editingSeason ? 'Edit Season' : 'Create Season'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-1">
                Season Year *
              </label>
              <Input
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2025-2026"
                disabled={!!editingSeason}
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-1">
                Display Name
              </label>
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="2025-26 Season"
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Sports Selection */}
          <div className="mb-4">
            <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-2">
              Enabled Sports ({formData.sports_enabled.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => toggleSport(sport.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-display uppercase border-2 rounded transition-colors',
                    formData.sports_enabled.includes(sport.id)
                      ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                      : 'bg-background border-border text-foreground-muted hover:border-foreground-muted'
                  )}
                >
                  {sport.name} ({sport.gender})
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSeason ? 'Update Season' : 'Create Season'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setEditingSeason(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Seasons List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        </div>
      ) : seasons.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
          <h3 className="font-display font-bold text-foreground mb-2">No Seasons</h3>
          <p className="text-sm text-foreground-muted mb-4">
            Create your first season to get started.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Season
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => (
            <Card
              key={season.id}
              className={cn(
                'p-4 border-2',
                season.is_current && 'border-neon-green/50 bg-neon-green/5'
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {season.display_name || season.year}
                    </h3>
                    {season.is_current && (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                        <Star className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                    <Badge className={getStatusColor(season.status)}>
                      {season.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-foreground-muted space-y-1">
                    <div className="flex items-center gap-4">
                      <span>Year: {season.year}</span>
                      {season.start_date && season.end_date && (
                        <span>
                          {new Date(season.start_date).toLocaleDateString()} -{' '}
                          {new Date(season.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {season.team_count || 0} teams
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {season.sports_enabled?.length || sports.length} sports enabled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!season.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetCurrent(season.id)}
                      disabled={isSaving}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Set Current
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateTeams(season)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4 mr-1" />
                    )}
                    Generate Teams
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(season)}>
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        onConfirm={async () => { await confirmAction?.action(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Confirm'}
        variant={confirmAction?.variant || 'destructive'}
      />
    </div>
  )
}
