'use client'

import { useTeamRoster, type TeamWithRoster, type TeamRosterPlayer } from '@/hooks/use-team-roster'
import { getSportEmoji } from '@/lib/sport-utils'
import { Users, Star, Loader2 } from 'lucide-react'

interface RosterListProps {
  schoolId: string
  seasonYear?: string  // "2025-2026" format
}

export function RosterList({ schoolId, seasonYear }: RosterListProps) {
  // Use the new team roster hook - no filters, get all teams for the school
  const { teams, isLoading, error } = useTeamRoster({
    schoolId,
    seasonYear,
  })

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

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <Users className="mx-auto h-8 w-8 text-foreground-muted" />
        <p className="mt-2 text-foreground-muted">No roster information available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {teams.map(teamWithRoster => (
        <TeamRosterCard key={teamWithRoster.team.id} teamWithRoster={teamWithRoster} />
      ))}
    </div>
  )
}

interface TeamRosterCardProps {
  teamWithRoster: TeamWithRoster
}

function TeamRosterCard({ teamWithRoster }: TeamRosterCardProps) {
  const { team, sport, players } = teamWithRoster

  // Format display name with gender prefix
  const displayGender = team.gender === 'boys' ? 'Boys' : team.gender === 'girls' ? 'Girls' : ''
  const sportBaseName = sport.name.replace(/^(Boys|Girls)\s+/i, '')
  const displayName = displayGender ? `${displayGender} ${sportBaseName}` : sportBaseName

  return (
    <div className="scoreboard-panel p-4">
      <h3 className="mb-4 font-display font-bold text-neon-pink uppercase tracking-wider flex items-center gap-2">
        <span>{getSportEmoji(sport.code)}</span>
        {displayName}
        <span className="text-sm font-normal text-foreground-muted">
          ({players.length})
        </span>
      </h3>

      {players.length === 0 ? (
        <p className="text-foreground-muted text-sm py-4 text-center">
          No players on this roster yet
        </p>
      ) : (
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
              {players.map(rosterPlayer => (
                <PlayerRow key={rosterPlayer.rosterEntry.id} rosterPlayer={rosterPlayer} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface PlayerRowProps {
  rosterPlayer: TeamRosterPlayer
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
