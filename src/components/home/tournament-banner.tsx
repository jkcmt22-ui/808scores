'use client'

import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import { useActiveTournaments } from '@/hooks'
import type { Sport } from '@/types/database'

interface TournamentWithSport {
  sport?: Sport
}

export function TournamentBanner() {
  const { tournaments, isLoading } = useActiveTournaments()

  // Don't render if loading or no active tournaments
  if (isLoading || tournaments.length === 0) {
    return null
  }

  const activeTournament = tournaments[0] as typeof tournaments[0] & TournamentWithSport
  const sportName = activeTournament.sport?.display_name || activeTournament.sport?.name || 'Tournament'

  return (
    <Link
      href="/tournaments"
      className="block mb-4 p-4 border-2 border-neon-yellow/50 bg-neon-yellow/10 hover:bg-neon-yellow/20 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-neon-yellow/20 border border-neon-yellow/30">
            <Trophy className="h-5 w-5 text-neon-yellow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-yellow animate-pulse" />
              <span className="font-display text-xs font-bold text-neon-yellow uppercase tracking-wider">
                Tournament Active
              </span>
            </div>
            <p className="font-display font-bold text-foreground text-sm mt-0.5">
              {activeTournament.name}
            </p>
            <p className="text-xs text-foreground-muted">
              {sportName} {tournaments.length > 1 && `+${tournaments.length - 1} more`}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-neon-yellow" />
      </div>
    </Link>
  )
}
