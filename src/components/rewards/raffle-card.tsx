'use client'

import { useState, useEffect } from 'react'
import { Ticket, Clock, Trophy, Info } from 'lucide-react'
import { Badge } from '@/components/ui'
import { PrizeChip } from './prize-display'
import { cn } from '@/lib/utils'
import type { RaffleWithPrize } from '@/types/database'

interface RaffleCardProps {
  raffle: RaffleWithPrize
  userPoints?: number // User's points = their automatic entry count
  totalEntries?: number // Total entries across all users
}

export function RaffleCard({
  raffle,
  userPoints = 0,
  totalEntries = 0,
}: RaffleCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('')

  // Calculate countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const closeDate = new Date(raffle.entries_close_at)
      const diff = closeDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Closed')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [raffle.entries_close_at])

  const isOpen = raffle.status === 'open'
  const isMonthly = raffle.raffle_type === 'monthly'
  const typeLabel = isMonthly ? 'Monthly' :
                    raffle.raffle_type === 'season_end' ? 'Season End' : 'Special'

  // Calculate win probability (approximate)
  const winProbability = totalEntries > 0 && userPoints > 0
    ? Math.min(100, (userPoints / totalEntries) * 100 * raffle.winner_count)
    : 0

  return (
    <div
      className={cn(
        'scoreboard-panel p-4 transition-all',
        isOpen && 'border-neon-yellow/50 hover:border-neon-yellow'
      )}
      style={isOpen ? { boxShadow: '0 0 15px rgba(250, 204, 21, 0.15)' } : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="h-4 w-4 text-neon-yellow" />
            <Badge
              variant={isOpen ? 'default' : 'secondary'}
              className={cn(
                'text-[10px]',
                isOpen && 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow'
              )}
            >
              {typeLabel}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {isOpen ? 'Open' : raffle.status}
            </Badge>
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {raffle.name}
          </h3>
        </div>

        {/* Countdown */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-foreground-muted">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono text-sm">{timeRemaining}</span>
          </div>
          <p className="text-[10px] text-foreground-subtle">remaining</p>
        </div>
      </div>

      {/* Description */}
      {raffle.description && (
        <p className="text-sm text-foreground-muted mb-3 line-clamp-2">
          {raffle.description}
        </p>
      )}

      {/* Prize Preview */}
      {raffle.prize && (
        <div className="mb-3">
          <PrizeChip prize={raffle.prize} />
        </div>
      )}

      {/* Your Automatic Entries */}
      <div className="bg-background-tertiary rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-muted font-display uppercase mb-1">
              Your Entries
            </p>
            <p className="score-led text-2xl">{userPoints.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground-muted font-display uppercase mb-1">
              Win Chance
            </p>
            <p className={cn(
              'font-display font-bold text-lg',
              winProbability > 10 && 'text-neon-green',
              winProbability > 0 && winProbability <= 10 && 'text-neon-yellow',
              winProbability === 0 && 'text-foreground-muted'
            )}>
              {winProbability > 0 ? `~${winProbability.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>

        {/* Info about entries */}
        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border">
          <Info className="h-3.5 w-3.5 text-foreground-subtle mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-foreground-subtle">
            {isMonthly
              ? 'Entries = points earned this month. Earn more points to increase your chances!'
              : 'Entries = your total season points. Keep earning to boost your odds!'
            }
          </p>
        </div>
      </div>

      {/* Raffle Stats */}
      <div className="flex items-center justify-between text-xs text-foreground-muted font-display">
        <div className="flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5 text-neon-yellow" />
          <span>{raffle.winner_count} {raffle.winner_count === 1 ? 'winner' : 'winners'}</span>
        </div>
        <span>{totalEntries.toLocaleString()} total entries</span>
      </div>
    </div>
  )
}
