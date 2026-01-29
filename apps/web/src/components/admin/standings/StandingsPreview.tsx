'use client'

import { useMemo } from 'react'
import { Loader2, Trophy } from 'lucide-react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { LeagueStandings, TeamStanding } from '@/lib/standings-calculator'

interface StandingsPreviewProps {
  standings: LeagueStandings | null
  isLoading?: boolean
  league: string
  division: string
  region?: string | null
}

export function StandingsPreview({
  standings,
  isLoading,
  league,
  division,
  region,
}: StandingsPreviewProps) {
  const locationText = region
    ? `${league} ${division} ${region}`
    : `${league} ${division}`

  // Format record string
  const formatRecord = (w: number, l: number, t: number) => {
    if (t > 0) return `${w}-${l}-${t}`
    return `${w}-${l}`
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="p-3 border-b-2 border-border bg-background-secondary flex-shrink-0">
        <h3 className="font-display font-bold text-neon-green uppercase tracking-wider text-sm">
          Computed Standings
        </h3>
        <p className="text-xs text-foreground-muted mt-1">{locationText}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neon-yellow" />
          </div>
        ) : !standings || standings.teams.length === 0 ? (
          <div className="p-4 text-center text-foreground-muted text-sm">
            <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No standings data yet.</p>
            <p className="text-xs mt-1">Assign teams and play games to see standings.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-background-tertiary">
                <th className="p-2 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider w-8">
                  #
                </th>
                <th className="p-2 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  Team
                </th>
                <th className="p-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  Overall
                </th>
                <th className="p-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  League
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.teams.map((team, index) => (
                <tr
                  key={team.school.id}
                  className={cn(
                    'border-b border-border hover:bg-background-tertiary transition-colors',
                    index === 0 && 'bg-neon-yellow/5'
                  )}
                >
                  <td className="p-2">
                    <span className={cn(
                      'font-mono text-sm',
                      index === 0 && 'text-neon-yellow font-bold'
                    )}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="font-display font-bold text-foreground">
                      {team.school.short_name}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className="font-mono text-foreground-muted">
                      {formatRecord(team.wins, team.losses, team.ties)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={cn(
                      'font-mono',
                      team.leagueGamesPlayed > 0 ? 'text-foreground' : 'text-foreground-muted'
                    )}>
                      {team.leagueGamesPlayed > 0
                        ? formatRecord(team.leagueWins, team.leagueLosses, team.leagueTies)
                        : '-'
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {standings && standings.teams.length > 0 && (
        <div className="p-2 border-t border-border bg-background-secondary text-xs text-foreground-muted text-center flex-shrink-0">
          Sorted by league record, then overall record
        </div>
      )}
    </Card>
  )
}
