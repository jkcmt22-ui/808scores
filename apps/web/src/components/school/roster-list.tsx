'use client'

import { useRoster, type SportRoster, type RosterPlayer } from '@/hooks/use-roster'
import { getSportEmoji } from '@/lib/sport-utils'
import { Users, Star, Loader2 } from 'lucide-react'

interface RosterListProps {
  schoolId: string
  seasonYear?: number
}

export function RosterList({ schoolId, seasonYear }: RosterListProps) {
  const { rosters, isLoading, error } = useRoster({ schoolId, seasonYear })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-neon-pink">
        Error loading roster: {error}
      </div>
    )
  }

  if (rosters.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <Users className="mx-auto h-8 w-8 text-foreground-muted" />
        <p className="mt-2 text-foreground-muted">No roster information available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {rosters.map(roster => (
        <SportRosterCard key={roster.sport.id} roster={roster} />
      ))}
    </div>
  )
}

interface SportRosterCardProps {
  roster: SportRoster
}

function SportRosterCard({ roster }: SportRosterCardProps) {
  return (
    <div className="scoreboard-panel p-4">
      <h3 className="mb-4 font-display font-bold text-neon-pink uppercase tracking-wider flex items-center gap-2">
        <span>{getSportEmoji(roster.sport.code)}</span>
        {roster.sport.display_name || roster.sport.name}
        <span className="text-sm font-normal text-foreground-muted">
          ({roster.players.length})
        </span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider w-12">
                #
              </th>
              <th className="pb-2 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Name
              </th>
              <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">
                Pos
              </th>
              <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider hidden sm:table-cell">
                Gr
              </th>
            </tr>
          </thead>
          <tbody>
            {roster.players.map(rosterPlayer => (
              <PlayerRow key={rosterPlayer.player.id} rosterPlayer={rosterPlayer} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface PlayerRowProps {
  rosterPlayer: RosterPlayer
}

function PlayerRow({ rosterPlayer }: PlayerRowProps) {
  const { player, jerseyNumber, position, grade, isCaptain } = rosterPlayer

  return (
    <tr className="border-b border-border hover:bg-background-tertiary transition-colors">
      <td className="py-3 text-center">
        {jerseyNumber !== null ? (
          <span className="font-display font-bold text-neon-yellow tabular-nums">
            {jerseyNumber}
          </span>
        ) : (
          <span className="text-foreground-muted">-</span>
        )}
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-foreground">
            {player.first_name} {player.last_name}
          </span>
          {isCaptain && (
            <span title="Captain">
              <Star className="h-4 w-4 text-score-amber fill-score-amber" />
            </span>
          )}
        </div>
      </td>
      <td className="py-3 text-center text-foreground-muted hidden sm:table-cell">
        {position || '-'}
      </td>
      <td className="py-3 text-center text-foreground-muted hidden sm:table-cell">
        {grade || '-'}
      </td>
    </tr>
  )
}
