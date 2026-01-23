'use client'

import Link from 'next/link'
import { MapPin, Clock, Star, MessageCircle, Trophy, Swords } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn, formatGameTime, isGameLive, isGameFinal } from '@/lib/utils'
import { getSportEmoji } from '@/lib/sport-utils'
import type { GameWithTeams, GameType } from '@/types/database'

interface GameCardProps {
  game: GameWithTeams
  showSport?: boolean
}

// Helper to get game type display info
function getGameTypeBadge(gameType: GameType): { label: string; variant: 'default' | 'warning' | 'success' | 'secondary'; icon?: React.ReactNode } | null {
  switch (gameType) {
    case 'playoff':
      return { label: 'Playoff', variant: 'warning', icon: <Trophy className="h-3 w-3" /> }
    case 'championship':
      return { label: 'Championship', variant: 'success', icon: <Trophy className="h-3 w-3" /> }
    case 'tournament':
      return { label: 'Tourney', variant: 'warning', icon: <Swords className="h-3 w-3" /> }
    case 'exhibition':
    case 'scrimmage':
      return null // Don't show badge, these are shown in separate section
    default:
      return null
  }
}

// Helper to format overtime display
function getOvertimeDisplay(overtimeCount: number): string | null {
  if (overtimeCount === 0) return null
  if (overtimeCount === 1) return 'OT'
  return `${overtimeCount}OT`
}

export function GameCard({ game, showSport = false }: GameCardProps) {
  const isLive = isGameLive(game.status)
  const isFinal = isGameFinal(game.status)
  const isScheduled = game.status === 'scheduled'
  const gameTypeBadge = getGameTypeBadge(game.game_type)
  const overtimeDisplay = getOvertimeDisplay(game.overtime_count)

  return (
    <Link href={`/game/${game.id}`}>
      <div className={cn(
        'scoreboard-panel p-4 transition-all hover:border-neon-blue/50',
        isLive && 'border-neon-pink/50'
      )}
      style={isLive ? { boxShadow: '0 0 20px rgba(255, 42, 109, 0.2)' } : undefined}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 neon-text-pink text-xs font-display font-bold uppercase tracking-widest animate-live-pulse">
                <span className="h-2 w-2 rounded-full bg-neon-pink" style={{ boxShadow: '0 0 8px var(--neon-pink)' }} />
                Live
              </span>
            )}
            {isFinal && (
              <span className="text-foreground-muted text-xs font-display font-bold uppercase tracking-widest">
                Final{overtimeDisplay && ` (${overtimeDisplay})`}
              </span>
            )}
            {isScheduled && (
              <span className="neon-text-yellow text-xs font-display font-bold">
                {formatGameTime(game.scheduled_at)}
              </span>
            )}
            {gameTypeBadge && (
              <Badge variant={gameTypeBadge.variant} className="gap-1 text-[10px] font-display">
                {gameTypeBadge.icon}
                {gameTypeBadge.label}
              </Badge>
            )}
            {game.golden_game && (
              <Badge variant="warning" className="gap-1 text-[10px] font-display">
                <Star className="h-3 w-3" />
                3x
              </Badge>
            )}
          </div>
          {showSport && (
            <span className="text-sm font-display font-bold text-neon-blue uppercase tracking-wider">
              {getSportEmoji(game.sport.code)} {game.sport.display_name || game.sport.name}
            </span>
          )}
        </div>

        {/* Scoreboard */}
        <div className="space-y-2">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center bg-background-tertiary text-xs font-display font-black text-neon-blue border-2 border-neon-blue/30">
                {game.away_team.short_name.slice(0, 2).toUpperCase()}
              </div>
              <span className={cn(
                'font-display font-bold text-foreground truncate',
                isFinal && game.away_score > game.home_score && 'neon-text-green'
              )}>
                {game.away_team.short_name}
              </span>
            </div>
            <div className={cn(
              'score-led text-2xl tabular-nums min-w-[70px] text-center',
              isLive && 'animate-led-blink',
              isFinal && game.away_score > game.home_score && 'score-led-green',
              isFinal && game.away_score <= game.home_score && 'score-led-amber'
            )}>
              {!isScheduled ? game.away_score : '--'}
            </div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center bg-background-tertiary text-xs font-display font-black text-neon-pink border-2 border-neon-pink/30">
                {game.home_team.short_name.slice(0, 2).toUpperCase()}
              </div>
              <span className={cn(
                'font-display font-bold text-foreground truncate',
                isFinal && game.home_score > game.away_score && 'neon-text-green'
              )}>
                {game.home_team.short_name}
              </span>
            </div>
            <div className={cn(
              'score-led text-2xl tabular-nums min-w-[70px] text-center',
              isLive && 'animate-led-blink',
              isFinal && game.home_score > game.away_score && 'score-led-green',
              isFinal && game.home_score <= game.away_score && 'score-led-amber'
            )}>
              {!isScheduled ? game.home_score : '--'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-xs text-foreground-subtle">
            {isLive && game.current_period && (
              <>
                <Clock className="h-3 w-3 text-neon-pink" />
                <span className="font-display text-neon-pink">
                  {overtimeDisplay || game.current_period}
                  {game.time_remaining && ` ${game.time_remaining}`}
                </span>
              </>
            )}
            {!isLive && game.venue && (
              <>
                <MapPin className="h-3 w-3" />
                <span className="font-display truncate max-w-[150px]">{game.venue}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {game.is_verified && (
              <span className="text-[10px] neon-text-green font-display font-bold uppercase tracking-widest">
                Verified
              </span>
            )}
            <MessageCircle className="h-4 w-4 text-neon-blue" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// Compact version for lists
export function GameCardCompact({ game }: { game: GameWithTeams }) {
  const isLive = isGameLive(game.status)
  const isScheduled = game.status === 'scheduled'

  return (
    <Link href={`/game/${game.id}`}>
      <div className={cn(
        'flex items-center justify-between border-2 border-border bg-background-secondary p-3 transition-colors hover:border-border-hover',
        isLive && 'border-live/50'
      )}>
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="h-2 w-2 rounded-full bg-live animate-live-pulse" />
          )}
          <div className="text-sm font-mono">
            <span className="font-semibold text-foreground">{game.away_team.short_name}</span>
            <span className="mx-2 text-foreground-subtle">@</span>
            <span className="font-semibold text-foreground">{game.home_team.short_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isScheduled ? (
            <span className={cn(
              'font-mono font-bold tabular-nums',
              isLive ? 'text-live' : 'text-score-amber'
            )}>
              {game.away_score} - {game.home_score}
            </span>
          ) : (
            <span className="text-sm font-mono text-score-amber">{formatGameTime(game.scheduled_at)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
