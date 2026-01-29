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
import { Button, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { TeamAssignmentPanel } from '@/components/admin/standings/TeamAssignmentPanel'
import { StandingsPreview } from '@/components/admin/standings/StandingsPreview'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LEAGUES } from '@/lib/league-config'
import type { Sport, School, Team } from '@/types/database'
import type { LeagueStandings, TeamStanding } from '@/lib/standings-calculator'

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

// All league codes
const LEAGUE_CODES = Object.keys(LEAGUES) as (keyof typeof LEAGUES)[]

export default function AdminStandingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Core selection state
  const [sports, setSports] = useState<Sport[]>([])
  const [teams, setTeams] = useState<TeamWithSchool[]>([])
  const [selectedSportId, setSelectedSportId] = useState<string>('')
  const [selectedSeason, setSelectedSeason] = useState<string>('2025-2026')
  const [selectedLeague, setSelectedLeague] = useState<string>('OIA')
  const [selectedDivision, setSelectedDivision] = useState<string>('Division I')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Computed standings
  const [standings, setStandings] = useState<LeagueStandings | null>(null)
  const [isLoadingStandings, setIsLoadingStandings] = useState(false)

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
      setPendingChanges(new Map())
    }

    setIsLoading(false)
  }, [supabase, selectedSportId, selectedSeason])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Fetch computed standings for current selection
  const fetchStandings = useCallback(async () => {
    if (!supabase || !selectedSportId || !selectedSeason) return

    setIsLoadingStandings(true)

    const selectedSport = sports.find(s => s.id === selectedSportId)
    if (!selectedSport) {
      setIsLoadingStandings(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('get_computed_standings', {
        p_sport_id: selectedSportId,
        p_gender: selectedSport.gender,
        p_season_year: selectedSeason,
        p_league: selectedLeague
      })

      if (error) {
        console.error('Error fetching standings:', error)
        setStandings(null)
      } else {
        // Filter to current division and region
        const rows = data as {
          school_id: string
          school_name: string
          school_short_name: string
          league: string | null
          division: string | null
          region: string | null
          overall_wins: number
          overall_losses: number
          overall_ties: number
          league_wins: number
          league_losses: number
          league_ties: number
          points_for: number
          points_against: number
        }[]

        const filtered = rows.filter(r => {
          if (r.division !== selectedDivision) return false
          if (selectedRegion && r.region !== selectedRegion) return false
          if (!selectedRegion && r.region) return false
          return true
        })

        if (filtered.length > 0) {
          const teams: TeamStanding[] = filtered.map(r => {
            const gamesPlayed = r.overall_wins + r.overall_losses + r.overall_ties
            const winPct = gamesPlayed > 0
              ? (r.overall_wins + r.overall_ties * 0.5) / gamesPlayed
              : 0
            const leagueGamesPlayed = r.league_wins + r.league_losses + r.league_ties
            const leagueWinPct = leagueGamesPlayed > 0
              ? (r.league_wins + r.league_ties * 0.5) / leagueGamesPlayed
              : 0

            return {
              school: {
                id: r.school_id,
                name: r.school_name,
                short_name: r.school_short_name,
                mascot: null,
                island: '',
                league: r.league,
                division: r.division,
                colors: null,
                logo_url: null,
                created_at: ''
              },
              wins: r.overall_wins,
              losses: r.overall_losses,
              ties: r.overall_ties,
              winPct,
              pointsFor: r.points_for,
              pointsAgainst: r.points_against,
              pointDiff: r.points_for - r.points_against,
              streak: '-',
              gamesPlayed,
              leagueWins: r.league_wins,
              leagueLosses: r.league_losses,
              leagueTies: r.league_ties,
              leagueWinPct,
              leagueGamesPlayed
            }
          })

          // Sort by league win%, then overall
          teams.sort((a, b) => {
            if (b.leagueWinPct !== a.leagueWinPct) return b.leagueWinPct - a.leagueWinPct
            if (b.leagueWins !== a.leagueWins) return b.leagueWins - a.leagueWins
            return b.winPct - a.winPct
          })

          let displayName = `${selectedLeague} ${selectedDivision}`
          if (selectedRegion) displayName += ` ${selectedRegion}`

          setStandings({
            league: selectedLeague,
            division: selectedDivision,
            region: selectedRegion,
            displayName,
            teams
          })
        } else {
          setStandings(null)
        }
      }
    } catch (err) {
      console.error('Error fetching standings:', err)
      setStandings(null)
    } finally {
      setIsLoadingStandings(false)
    }
  }, [supabase, selectedSportId, selectedSeason, selectedLeague, selectedDivision, selectedRegion, sports])

  useEffect(() => {
    fetchStandings()
  }, [fetchStandings])

  // Get selected sport info
  const selectedSport = useMemo(() =>
    sports.find(s => s.id === selectedSportId),
    [sports, selectedSportId]
  )

  // Get effective value (pending or current)
  const getEffectiveValue = useCallback((team: TeamWithSchool, field: keyof Team): string | null => {
    const pending = pendingChanges.get(team.id)
    if (pending && field in pending) {
      return pending[field] as string | null
    }
    return team[field] as string | null
  }, [pendingChanges])

  // Teams assigned to current selection
  const assignedTeams = useMemo(() => {
    return teams.filter(team => {
      const league = getEffectiveValue(team, 'league')
      const division = getEffectiveValue(team, 'division')
      const region = getEffectiveValue(team, 'region')

      if (league !== selectedLeague) return false
      if (division !== selectedDivision) return false
      if (selectedRegion) {
        return region === selectedRegion
      } else {
        return !region
      }
    }).sort((a, b) =>
      a.school.short_name.localeCompare(b.school.short_name)
    )
  }, [teams, selectedLeague, selectedDivision, selectedRegion, getEffectiveValue])

  // Teams available to assign (not in current selection)
  const availableTeams = useMemo(() => {
    return teams.filter(team => {
      const league = getEffectiveValue(team, 'league')
      const division = getEffectiveValue(team, 'division')
      const region = getEffectiveValue(team, 'region')

      // Available if not assigned to current selection
      if (league === selectedLeague && division === selectedDivision) {
        if (selectedRegion) {
          return region !== selectedRegion
        } else {
          return region !== null
        }
      }
      return true
    }).sort((a, b) =>
      a.school.short_name.localeCompare(b.school.short_name)
    )
  }, [teams, selectedLeague, selectedDivision, selectedRegion, getEffectiveValue])

  // Assign team to current selection
  const handleAssign = useCallback((teamId: string) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev)
      const updates: Partial<Team> = {
        league: selectedLeague,
        division: selectedDivision,
        region: selectedRegion ?? null
      }
      newMap.set(teamId, { ...(newMap.get(teamId) || {}), ...updates })
      return newMap
    })
  }, [selectedLeague, selectedDivision, selectedRegion])

  // Unassign team from current selection
  const handleUnassign = useCallback((teamId: string) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev)
      const updates: Partial<Team> = {
        league: null,
        division: null,
        region: null
      }
      newMap.set(teamId, { ...(newMap.get(teamId) || {}), ...updates })
      return newMap
    })
  }, [])

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
        fetchTeams()
        fetchStandings()
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save changes' })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle league change
  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league)
    // Reset division to first available
    const divisions = DIVISION_OPTIONS[league] || []
    setSelectedDivision(divisions[0] || 'Division I')
    // Reset region
    if (LEAGUES[league as keyof typeof LEAGUES]?.hasRegional) {
      setSelectedRegion('East')
    } else {
      setSelectedRegion(null)
    }
  }

  // Handle division change
  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division)
    // Reset region if needed
    const leagueConfig = LEAGUES[selectedLeague as keyof typeof LEAGUES]
    if (leagueConfig?.hasRegional && leagueConfig.regionalDivisions?.includes(division)) {
      setSelectedRegion('East')
    } else {
      setSelectedRegion(null)
    }
  }

  // Check if current division needs region
  const needsRegion = useMemo(() => {
    const leagueConfig = LEAGUES[selectedLeague as keyof typeof LEAGUES]
    return leagueConfig?.hasRegional && leagueConfig.regionalDivisions?.includes(selectedDivision)
  }, [selectedLeague, selectedDivision])

  // Context string for header
  const contextString = useMemo(() => {
    const parts = [selectedSeason]
    if (selectedSport) parts.push(selectedSport.display_name || selectedSport.name)
    parts.push(selectedLeague)
    parts.push(selectedDivision)
    if (selectedRegion) parts.push(selectedRegion)
    return parts.join(' • ')
  }, [selectedSeason, selectedSport, selectedLeague, selectedDivision, selectedRegion])

  return (
    <div className="flex flex-col h-full">
      {/* Pinned Header */}
      <div className="sticky top-0 z-20 bg-background border-b-2 border-border">
        {/* Context Bar */}
        <div className="px-4 py-2 bg-neon-blue/10 border-b border-neon-blue/20">
          <p className="text-xs font-mono text-neon-blue uppercase tracking-wider">
            Editing: {contextString}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-lg neon-text-yellow uppercase tracking-wider">
              Team Assignments
            </h1>
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
              onClick={() => {
                fetchTeams()
                fetchStandings()
              }}
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
            'mx-4 mb-3 flex items-center gap-2 p-2 text-sm border-2',
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

      {/* Navigation Area */}
      <div className="p-4 space-y-4 border-b border-border bg-background-secondary">
        {/* Sport and Season Row */}
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

        {/* League Tabs */}
        <div>
          <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-2">
            League
          </label>
          <Tabs defaultValue={selectedLeague} value={selectedLeague} onValueChange={handleLeagueChange}>
            <TabsList aria-label="Select league" className="w-full flex-wrap">
              {LEAGUE_CODES.map(code => (
                <TabsTrigger key={code} value={code}>
                  {code}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Division and Region Row */}
        <div className="flex flex-wrap gap-4">
          {/* Division Tabs */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-2">
              Division
            </label>
            <Tabs defaultValue={selectedDivision} value={selectedDivision} onValueChange={handleDivisionChange}>
              <TabsList aria-label="Select division" className="flex-wrap">
                {(DIVISION_OPTIONS[selectedLeague] || []).map(div => (
                  <TabsTrigger key={div} value={div}>
                    {div}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Region Tabs (OIA only) */}
          {needsRegion && (
            <div>
              <label className="block text-xs font-display uppercase tracking-wider text-foreground-muted mb-2">
                Region
              </label>
              <Tabs defaultValue="East" value={selectedRegion || 'East'} onValueChange={setSelectedRegion}>
                <TabsList aria-label="Select region">
                  {REGION_OPTIONS.map(reg => (
                    <TabsTrigger key={reg} value={reg}>
                      {reg}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Side by Side Panels */}
      <div className="flex-1 p-4 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          </div>
        ) : teams.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
            <h3 className="font-display font-bold text-foreground mb-2">No Teams Found</h3>
            <p className="text-sm text-foreground-muted">
              No teams found for {selectedSport?.display_name || 'this sport'} in {selectedSeason}.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Team Assignment Panel */}
            <TeamAssignmentPanel
              assignedTeams={assignedTeams}
              availableTeams={availableTeams}
              onAssign={handleAssign}
              onUnassign={handleUnassign}
              isLoading={isLoading}
              league={selectedLeague}
              division={selectedDivision}
              region={selectedRegion}
            />

            {/* Standings Preview */}
            <StandingsPreview
              standings={standings}
              isLoading={isLoadingStandings}
              league={selectedLeague}
              division={selectedDivision}
              region={selectedRegion}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background-secondary flex-shrink-0">
        <Button variant="outline" onClick={() => router.push('/admin')}>
          Back to Admin
        </Button>
      </div>
    </div>
  )
}
