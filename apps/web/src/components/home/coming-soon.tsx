'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Clock, ChevronRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getSportEmoji } from '@/lib/sport-utils'
import { formatGameTime } from '@/lib/utils'
import type { GameWithTeams } from '@/types/database'

interface ComingSoonProps {
  maxGames?: number
}

export function ComingSoon({ maxGames = 5 }: ComingSoonProps) {
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const supabase = useMemo(() => createClient()!, [])

  useEffect(() => {
    const fetchUpcomingGames = async () => {
      setIsLoading(true)

      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(tomorrow.getHours() + 24)

      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .eq('status', 'scheduled')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', tomorrow.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(maxGames)

      if (!error && data) {
        setGames(data as GameWithTeams[])
      }
      setIsLoading(false)
    }

    fetchUpcomingGames()
  }, [supabase, maxGames])

  // Don't render if loading or no upcoming games
  if (isLoading) {
    return (
      <div className="mb-4 p-4 border-2 border-border bg-background-secondary">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-neon-blue" />
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return null
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) {
      return `in ${diffMins}m`
    }
    if (diffHours < 24) {
      return `in ${diffHours}h`
    }
    return formatGameTime(dateString)
  }

  // Get the next game for preview when collapsed
  const nextGame = games[0]

  return (
    <div className="mb-4">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 border-2 border-border bg-background-secondary hover:border-neon-blue transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Clock className="h-5 w-5 text-neon-blue flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
              Coming Soon
            </h3>
            <span className="text-xs text-foreground-muted">({games.length})</span>
          </div>
          {/* Preview of next game when collapsed */}
          {!isExpanded && nextGame && (
            <span className="text-xs text-foreground-muted truncate hidden sm:inline">
              — {nextGame.away_team.short_name} @ {nextGame.home_team.short_name} {formatRelativeTime(nextGame.scheduled_at)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-foreground-muted" />
          ) : (
            <ChevronDown className="h-5 w-5 text-foreground-muted" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-2 border-t-0 border-border bg-background-secondary/50">
          <div className="divide-y divide-border/50">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="flex items-center justify-between p-3 hover:bg-background-tertiary transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">
                    {getSportEmoji(game.sport.code)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-sm truncate">
                      {game.away_team.short_name} @ {game.home_team.short_name}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {game.sport.display_name || game.sport.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-display font-bold text-neon-yellow">
                    {formatRelativeTime(game.scheduled_at)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-foreground-muted" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
