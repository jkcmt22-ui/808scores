'use client'

import Link from 'next/link'
import { Trophy, Calendar, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Tournament, TournamentStatus, TournamentFormat, Sport } from '@/types/database'

interface TournamentWithSport extends Tournament {
  sport: Sport
}

interface TournamentCardProps {
  tournament: TournamentWithSport
  teamCount?: number
  className?: string
}

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  single_elimination: 'Single Elim',
  double_elimination: 'Double Elim',
  round_robin: 'Round Robin',
  pool_play: 'Pool Play',
  custom: 'Custom',
}

const STATUS_LABELS: Record<TournamentStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  canceled: 'Canceled',
}

export function TournamentCard({ tournament, teamCount, className }: TournamentCardProps) {
  const isLive = tournament.status === 'in_progress'
  const isCompleted = tournament.status === 'completed'

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className={cn(
        'block border-2 bg-background-secondary p-4 transition-colors hover:border-neon-blue',
        isLive && 'border-neon-pink/50',
        !isLive && 'border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center',
            isLive && 'bg-neon-pink/20',
            isCompleted && 'bg-neon-green/20',
            !isLive && !isCompleted && 'bg-neon-yellow/20'
          )}>
            <Trophy className={cn(
              'h-5 w-5',
              isLive && 'text-neon-pink',
              isCompleted && 'text-neon-green',
              !isLive && !isCompleted && 'text-neon-yellow'
            )} />
          </div>
          <div>
            <Badge
              variant={
                isLive
                  ? 'destructive'
                  : isCompleted
                  ? 'secondary'
                  : tournament.status === 'canceled'
                  ? 'outline'
                  : 'default'
              }
              className="text-[10px]"
            >
              {STATUS_LABELS[tournament.status]}
            </Badge>
          </div>
        </div>

        <span className="text-[10px] text-neon-blue font-display font-bold uppercase tracking-wider">
          {tournament.sport.display_name || tournament.sport.name}
        </span>
      </div>

      {/* Tournament Name */}
      <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2">
        {tournament.name}
      </h3>

      {/* Details */}
      <div className="flex items-center gap-4 text-xs text-foreground-muted flex-wrap mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(tournament.start_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'Pacific/Honolulu',
          })}
          {tournament.end_date && tournament.end_date !== tournament.start_date && (
            <>
              {' - '}
              {new Date(tournament.end_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'Pacific/Honolulu',
              })}
            </>
          )}
        </span>

        {tournament.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {tournament.venue}
          </span>
        )}

        {(tournament.num_teams || teamCount) && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {teamCount || tournament.num_teams} teams
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="warning" className="text-[10px]">
          {FORMAT_LABELS[tournament.format]}
        </Badge>
        {tournament.league && (
          <Badge variant="outline" className="text-[10px]">
            {tournament.league}
          </Badge>
        )}
        {tournament.division && (
          <Badge variant="outline" className="text-[10px]">
            {tournament.division}
          </Badge>
        )}
      </div>
    </Link>
  )
}

// Compact version for sidebars/small spaces
interface CompactTournamentCardProps {
  tournament: TournamentWithSport
  className?: string
}

export function CompactTournamentCard({ tournament, className }: CompactTournamentCardProps) {
  const isLive = tournament.status === 'in_progress'

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className={cn(
        'flex items-center gap-3 p-3 border-2 bg-background-secondary transition-colors hover:border-neon-blue',
        isLive && 'border-neon-pink/50',
        !isLive && 'border-border',
        className
      )}
    >
      <div className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center',
        isLive && 'bg-neon-pink/20',
        !isLive && 'bg-neon-yellow/20'
      )}>
        <Trophy className={cn(
          'h-4 w-4',
          isLive && 'text-neon-pink',
          !isLive && 'text-neon-yellow'
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-display text-sm font-bold text-foreground truncate">
          {tournament.name}
        </h4>
        <p className="text-[10px] text-foreground-muted">
          {tournament.sport.display_name || tournament.sport.name}
          {tournament.league && ` · ${tournament.league}`}
        </p>
      </div>

      {isLive && (
        <Badge variant="destructive" className="text-[10px] flex-shrink-0">
          Live
        </Badge>
      )}
    </Link>
  )
}
