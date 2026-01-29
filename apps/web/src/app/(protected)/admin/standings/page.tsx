'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LEAGUES } from '@/lib/league-config'
import type { Sport, School, Team } from '@/types/database'

interface TeamWithSchool extends Team {
  school: School
  sport: Sport
}

// Season options
const SEASON_OPTIONS = [
  { value: '2025-2026', label: '2025-2026' },
  { value: '2024-2025', label: '2024-2025' },
]

// Division options per league
const DIVISION_OPTIONS: Record<string, string[]> = {
  OIA: ['Open', 'Division I', 'Division II'],
  ILH: ['Open', 'Division I', 'Division II', 'Division III'],
  BIIF: ['Division I', 'Division II'],
  MIL: ['Division I', 'Division II'],
  KIF: ['Division I', 'Division II'],
}

// Region options (OIA only)
const REGION_OPTIONS = ['East', 'West']

export default function AdminStandingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // State
  const [sports, setSports] = useState<Sport[]>([])
  const [teams, setTeams] = useState<TeamWithSchool[]>([])
  const [selectedSportId, setSelectedSportId] = useState<string>('')
  const [selectedSeason, setSelectedSeason] = useState<string>('2025-2026')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Track pending changes
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<Team>>>(new Map())

  // Fetch sports on mount
  useEffect(() => {
    if (!supabase) return

    const fetchSports = async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('active', true)
        .order('sort_order')

      if (!error && data) {
        const sportsData = data as Sport[]
        setSports(sportsData)
        // Default to first sport
        if (sportsData.length > 0 && !selectedSportId) {
          setSelectedSportId(sportsData[0].id)
        }
      }
      setIsLoading(false)
    }

    fetchSports()
  }, [supabase, selectedSportId])

  // Fetch teams when sport/season changes
  const fetchTeams = useCallback(async () => {
    if (!supabase || !selectedSportId || !selectedSeason) return

    setIsLoading(true)
    setMessage(null)

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        school:schools(*),
        sport:sports(*)
      `)
      .eq('sport_id', selectedSportId)
      .eq('season_year', selectedSeason)
      .eq('is_active', true)
      .order('school_id')

    if (error) {
      setMessage({ type: 'error', text: `Failed to load teams: ${error.message}` })
    } else {
      setTeams(data as TeamWithSchool[])
      setPendingChanges(new Map()) // Clear pending changes
    }

    setIsLoading(false)
  }, [supabase, selectedSportId, selectedSeason])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Get selected sport info
  const selectedSport = useMemo(() =>
    sports.find(s => s.id === selectedSportId),
    [sports, selectedSportId]
  )

  // Handle field change
  const handleFieldChange = (teamId: string, field: keyof Team, value: string | null) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(teamId) || {}
      newMap.set(teamId, { ...existing, [field]: value })
      return newMap
    })
  }

  // Get effective value (pending or current)
  const getEffectiveValue = (team: TeamWithSchool, field: keyof Team): string | null => {
    const pending = pendingChanges.get(team.id)
    if (pending && field in pending) {
      return pending[field] as string | null
    }
    return team[field] as string | null
  }

  // Check if team has pending changes
  const hasChanges = (teamId: string): boolean => {
    return pendingChanges.has(teamId)
  }

  // Save all changes
  const saveChanges = async () => {
    if (!supabase || pendingChanges.size === 0) {
      setMessage({ type: 'error', text: 'No changes to save' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      let errorCount = 0
      const totalChanges = pendingChanges.size

      for (const [teamId, changes] of pendingChanges) {
        const { error } = await supabase
          .from('teams')
          .update(changes as never)
          .eq('id', teamId)

        if (error) {
          errorCount++
          console.error(`Failed to update team ${teamId}:`, error)
        }
      }

      if (errorCount > 0) {
        setMessage({ type: 'error', text: `Failed to save ${errorCount} of ${totalChanges} updates` })
      } else {
        setMessage({ type: 'success', text: `Saved ${totalChanges} team(s)` })
        setPendingChanges(new Map())
        // Refresh teams
        fetchTeams()
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save changes' })
    } finally {
      setIsSaving(false)
    }
  }

  // Group teams by league for display
  const teamsByLeague = useMemo(() => {
    const grouped = new Map<string, TeamWithSchool[]>()

    for (const team of teams) {
      const league = getEffectiveValue(team, 'league') || 'Unassigned'
      if (!grouped.has(league)) {
        grouped.set(league, [])
      }
      grouped.get(league)!.push(team)
    }

    // Sort teams within each league by school name
    for (const [, leagueTeams] of grouped) {
      leagueTeams.sort((a, b) =>
        a.school.short_name.localeCompare(b.school.short_name)
      )
    }

    return grouped
  }, [teams, pendingChanges])

  // Get available leagues
  const leagueOptions = Object.keys(LEAGUES)

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-background border-b-2 border-border mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-lg neon-text-yellow uppercase tracking-wider">
              Team Assignments
            </h1>
            {selectedSport && (
              <p className="text-xs text-foreground-muted mt-1">
                Editing: {selectedSport.display_name || selectedSport.name} {selectedSeason}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pendingChanges.size > 0 && (
              <Badge variant="warning" className="mr-2">
                {pendingChanges.size} unsaved
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTeams}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={saveChanges}
              disabled={isSaving || pendingChanges.size === 0}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={cn(
            'mt-3 flex items-center gap-2 p-2 text-sm border-2',
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
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sport selector */}
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-2">
              Sport
            </label>
            <div className="relative">
              <select
                value={selectedSportId}
                onChange={(e) => setSelectedSportId(e.target.value)}
                className="w-full h-10 px-3 pr-10 border-2 border-border bg-background text-foreground font-display text-sm appearance-none cursor-pointer"
              >
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>
                    {sport.display_name || sport.name} ({sport.gender})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
            </div>
          </div>

          {/* Season selector */}
          <div>
            <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-2">
              Season
            </label>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full h-10 px-3 pr-10 border-2 border-border bg-background text-foreground font-display text-sm appearance-none cursor-pointer"
              >
                {SEASON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        </div>
      )}

      {/* Teams table */}
      {!isLoading && teams.length > 0 && (
        <div className="space-y-6">
          {Array.from(teamsByLeague.entries()).map(([league, leagueTeams]) => (
            <Card key={league} className="overflow-hidden">
              <div className="p-3 border-b-2 border-border bg-background-secondary">
                <h3 className="font-display font-bold text-neon-blue uppercase tracking-wider">
                  {league} ({leagueTeams.length} teams)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border bg-background-tertiary">
                      <th className="p-3 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                        School
                      </th>
                      <th className="p-3 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                        League
                      </th>
                      <th className="p-3 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                        Division
                      </th>
                      <th className="p-3 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                        Region
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueTeams.map(team => {
                      const effectiveLeague = getEffectiveValue(team, 'league')
                      const effectiveDivision = getEffectiveValue(team, 'division')
                      const effectiveRegion = getEffectiveValue(team, 'region')
                      const changed = hasChanges(team.id)

                      return (
                        <tr
                          key={team.id}
                          className={cn(
                            'border-b border-border hover:bg-background-tertiary transition-colors',
                            changed && 'bg-neon-yellow/10'
                          )}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {changed && (
                                <div className="w-2 h-2 rounded-full bg-neon-yellow" title="Unsaved changes" />
                              )}
                              <span className="font-display font-bold text-foreground">
                                {team.school.short_name}
                              </span>
                              <span className="text-xs text-foreground-muted">
                                ({team.gender})
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <select
                              value={effectiveLeague || ''}
                              onChange={(e) => handleFieldChange(team.id, 'league', e.target.value || null)}
                              className="w-full h-8 px-2 border border-border bg-background text-foreground text-sm"
                            >
                              <option value="">-- None --</option>
                              {leagueOptions.map(l => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={effectiveDivision || ''}
                              onChange={(e) => handleFieldChange(team.id, 'division', e.target.value || null)}
                              className="w-full h-8 px-2 border border-border bg-background text-foreground text-sm"
                              disabled={!effectiveLeague}
                            >
                              <option value="">-- None --</option>
                              {effectiveLeague && DIVISION_OPTIONS[effectiveLeague]?.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={effectiveRegion || ''}
                              onChange={(e) => handleFieldChange(team.id, 'region', e.target.value || null)}
                              className="w-full h-8 px-2 border border-border bg-background text-foreground text-sm"
                              disabled={effectiveLeague !== 'OIA'}
                            >
                              <option value="">-- None --</option>
                              {effectiveLeague === 'OIA' && REGION_OPTIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && teams.length === 0 && (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
          <h3 className="font-display font-bold text-foreground mb-2">No Teams Found</h3>
          <p className="text-sm text-foreground-muted">
            No teams found for {selectedSport?.display_name || 'this sport'} in {selectedSeason}.
          </p>
        </Card>
      )}

      {/* Back button */}
      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/admin')}>
          Back to Admin
        </Button>
      </div>
    </div>
  )
}
