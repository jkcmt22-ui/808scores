'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { cn } from '@/lib/utils'
import { getCategoryEmoji, getSportEmoji } from '@/lib/sport-utils'
import { useSports } from '@/hooks/use-sports'
import { useStandings } from '@/hooks/use-standings'
import { LeagueFilter } from '@/components/filters/league-filter'
import { LEAGUES } from '@/lib/league-config'

export default function StandingsPage() {
  const { sports, isLoading: sportsLoading } = useSports()
  const [selectedSportCode, setSelectedSportCode] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)

  const { standings, sport: currentSport, isLoading: standingsLoading, error } = useStandings({
    sportCode: selectedSportCode || undefined,
    league: selectedLeague || undefined
  })

  const isLoading = sportsLoading || standingsLoading

  // Group sports by base name for selector
  const sportOptions = sports.reduce((acc, sport) => {
    const baseName = sport.name
    if (!acc.find(s => s.name === baseName)) {
      acc.push(sport)
    }
    return acc
  }, [] as typeof sports)

  return (
    <>
      <Header title="Standings" />

      {/* Sport selector */}
      <div className="border-b-2 border-border bg-background-secondary">
        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-3">
          <button
            onClick={() => setSelectedSportCode(null)}
            className={cn(
              'whitespace-nowrap px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all border-2',
              selectedSportCode === null
                ? 'bg-neon-blue/20 text-neon-blue border-neon-blue'
                : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-pink hover:text-neon-pink'
            )}
            style={selectedSportCode === null ? {
              textShadow: '0 0 10px var(--neon-blue)',
              boxShadow: '0 0 10px rgba(5, 217, 232, 0.3), inset 0 0 10px rgba(5, 217, 232, 0.1)'
            } : undefined}
          >
            All Sports
          </button>
          {sportOptions.map((sport) => (
            <button
              key={sport.code}
              onClick={() => setSelectedSportCode(sport.code)}
              className={cn(
                'whitespace-nowrap px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all border-2',
                selectedSportCode === sport.code
                  ? 'bg-neon-blue/20 text-neon-blue border-neon-blue'
                  : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-pink hover:text-neon-pink'
              )}
              style={selectedSportCode === sport.code ? {
                textShadow: '0 0 10px var(--neon-blue)',
                boxShadow: '0 0 10px rgba(5, 217, 232, 0.3), inset 0 0 10px rgba(5, 217, 232, 0.1)'
              } : undefined}
            >
              {getSportEmoji(sport.code)} {sport.display_name || sport.name}
            </button>
          ))}
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
                {selectedSportCode ? getSportEmoji(selectedSportCode) : getCategoryEmoji('Sports')}
              </span>
            </div>
            <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
              No Standings
            </h3>
            <p className="text-sm text-foreground-muted max-w-xs font-display">
              {selectedSportCode
                ? `Standings for ${currentSport?.display_name || currentSport?.name || 'this sport'} will be available once regular season games are completed.`
                : 'Select a sport to view standings, or check back once games have been played.'
              }
            </p>
          </div>
        )}
      </main>
    </>
  )
}
