'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { cn } from '@/lib/utils'
import { getCategoryEmoji, getSportEmoji } from '@/lib/sport-utils'
import { useSports } from '@/hooks/use-sports'
import { useStandings } from '@/hooks/use-standings'
import { LeagueFilter } from '@/components/filters/league-filter'
import { LEAGUES } from '@/lib/league-config'

// Season configuration for grouping sports
const SEASON_ORDER = ['fall', 'winter', 'spring'] as const
const SEASON_LABELS: Record<string, string> = {
  fall: 'FALL 2025',
  winter: 'WINTER 2025-26',
  spring: 'SPRING 2025'
}

// Get season year based on sport season type
function getSeasonYear(season: string | null): number {
  const now = new Date()
  const currentYear = parseInt(now.toLocaleDateString('en-CA', {
    timeZone: 'Pacific/Honolulu',
    year: 'numeric'
  }))
  const currentMonth = now.getMonth() + 1 // 1-12

  // Fall sports (Aug-Nov) use previous year if we're in Jan-Jul
  if (season === 'fall') {
    return currentMonth < 8 ? currentYear - 1 : currentYear
  }
  // Spring sports (Feb-May) use previous year if we're in Aug-Dec
  if (season === 'spring') {
    return currentMonth >= 8 ? currentYear : currentYear
  }
  // Winter sports (Dec-Feb) use current calendar year
  return currentYear
}

export default function StandingsPage() {
  const { sports, isLoading: sportsLoading } = useSports()
  const [selectedSportCode, setSelectedSportCode] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)

  // Get unique sports list
  const uniqueSports = useMemo(() => {
    const seen = new Set<string>()
    return sports.filter(s => {
      if (seen.has(s.code)) return false
      seen.add(s.code)
      return true
    })
  }, [sports])

  // Default to first sport if none selected
  const effectiveSportCode = selectedSportCode || uniqueSports[0]?.code || null

  // Get the selected sport's season for correct year lookup
  const selectedSport = useMemo(() =>
    sports.find(s => s.code === effectiveSportCode),
    [sports, effectiveSportCode]
  )
  const seasonYear = selectedSport ? getSeasonYear(selectedSport.season) : undefined

  const { standings, sport: currentSport, isLoading: standingsLoading, error } = useStandings({
    sportCode: effectiveSportCode || undefined,
    league: selectedLeague || undefined,
    season: seasonYear?.toString()
  })

  const isLoading = sportsLoading || standingsLoading

  // Group sports by season for dropdown
  const sportsByseason = useMemo(() => {
    const grouped = new Map<string, typeof sports>()

    // Initialize groups in order
    for (const season of SEASON_ORDER) {
      grouped.set(season, [])
    }

    // Group unique sports by season
    const seen = new Set<string>()
    for (const sport of sports) {
      if (seen.has(sport.code)) continue
      seen.add(sport.code)

      const season = sport.season || 'other'
      if (!grouped.has(season)) {
        grouped.set(season, [])
      }
      grouped.get(season)!.push(sport)
    }

    return grouped
  }, [sports])

  return (
    <>
      <Header title="Standings" />

      {/* Sport selector dropdown */}
      <div className="border-b-2 border-border bg-background-secondary">
        <div className="px-4 py-3">
          <label className="text-xs text-foreground-muted block mb-2 font-display uppercase tracking-wider">
            Select Sport
          </label>
          <div className="relative">
            <select
              value={effectiveSportCode || ''}
              onChange={(e) => setSelectedSportCode(e.target.value || null)}
              className={cn(
                'w-full md:w-80 appearance-none bg-background-tertiary border-2 px-4 py-3 pr-10',
                'font-display text-sm font-bold uppercase tracking-wide',
                'focus:outline-none cursor-pointer',
                'border-neon-blue text-neon-blue'
              )}
              style={{
                textShadow: '0 0 10px var(--neon-blue)',
                boxShadow: '0 0 10px rgba(5, 217, 232, 0.3), inset 0 0 10px rgba(5, 217, 232, 0.1)'
              }}
            >
              {SEASON_ORDER.map(season => {
                const seasonSports = sportsByseason.get(season) || []
                if (seasonSports.length === 0) return null
                return (
                  <optgroup key={season} label={SEASON_LABELS[season]}>
                    {seasonSports.map(sport => (
                      <option key={sport.code} value={sport.code}>
                        {getSportEmoji(sport.code)} {sport.display_name || sport.name}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* League filter */}
      <div className="px-4 py-3 border-b border-border bg-background">
        <label className="text-xs text-foreground-muted block mb-2 font-display uppercase tracking-wider">
          Filter by League
        </label>
        <LeagueFilter
          selected={selectedLeague}
          onChange={setSelectedLeague}
        />
      </div>

      <main className="px-4 pb-24 grid-bg">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4 mt-4">
            {[1, 2].map(i => (
              <div key={i} className="scoreboard-panel p-4 animate-pulse">
                <div className="h-6 w-32 bg-border rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-10 bg-border rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="scoreboard-panel p-6 mt-4 text-center text-neon-pink">
            Error loading standings: {error}
          </div>
        )}

        {/* Standings tables */}
        {!isLoading && !error && standings.length > 0 && (
          <div className="space-y-4 mt-4">
            {standings.map((leagueStanding) => (
              <div key={leagueStanding.displayName} className="scoreboard-panel p-4">
                <h3 className="mb-4 font-display font-bold text-neon-pink uppercase tracking-wider flex items-center gap-2">
                  {leagueStanding.displayName}
                  {LEAGUES[leagueStanding.league] && (
                    <span className="text-xs font-normal text-foreground-muted normal-case">
                      ({LEAGUES[leagueStanding.league].name})
                    </span>
                  )}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="pb-2 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">Team</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">W</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">L</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">T</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">PCT</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider hidden md:table-cell">PF</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider hidden md:table-cell">PA</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider hidden lg:table-cell">STRK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leagueStanding.teams.map((team, index) => {
                        const colors = team.school.colors as { primary?: string } | null
                        return (
                          <tr
                            key={team.school.id}
                            className={cn(
                              'border-b border-border hover:bg-background-tertiary transition-colors',
                              index < 2 && 'bg-neon-green/5'
                            )}
                          >
                            <td className="py-3">
                              <Link href={`/school/${team.school.id}`} className="flex items-center gap-2 group">
                                <span className="text-xs font-display font-bold text-neon-yellow w-4">{index + 1}</span>
                                {colors?.primary && (
                                  <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: colors.primary }}
                                  />
                                )}
                                <span className="font-display font-bold text-foreground group-hover:text-score-amber transition-colors">
                                  {team.school.short_name}
                                </span>
                              </Link>
                            </td>
                            <td className="py-3 text-center font-display tabular-nums text-neon-green">{team.wins}</td>
                            <td className="py-3 text-center font-display tabular-nums text-foreground-muted">{team.losses}</td>
                            <td className="py-3 text-center font-display tabular-nums text-foreground-muted hidden sm:table-cell">{team.ties}</td>
                            <td className="py-3 text-center font-display tabular-nums text-foreground">{team.winPct.toFixed(3)}</td>
                            <td className="py-3 text-center font-display tabular-nums text-foreground-subtle hidden md:table-cell">{team.pointsFor}</td>
                            <td className="py-3 text-center font-display tabular-nums text-foreground-subtle hidden md:table-cell">{team.pointsAgainst}</td>
                            <td className="py-3 text-center font-display tabular-nums hidden lg:table-cell">
                              <span className={cn(
                                team.streak.startsWith('W') && 'text-neon-green',
                                team.streak.startsWith('L') && 'text-neon-pink'
                              )}>
                                {team.streak}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && standings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="scoreboard-panel p-8 mb-4">
              <div className="score-led text-5xl mb-4 neon-text-pink">--</div>
              <span className="text-4xl">
                {effectiveSportCode ? getSportEmoji(effectiveSportCode) : getCategoryEmoji('Sports')}
              </span>
            </div>
            <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
              No Standings
            </h3>
            <p className="text-sm text-foreground-muted max-w-xs font-display">
              Standings for {currentSport?.display_name || currentSport?.name || 'this sport'} will be available once regular season games are completed.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
