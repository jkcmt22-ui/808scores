'use client'

import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/ui'
import { usePastWinners } from '@/hooks'
import { cn } from '@/lib/utils'

interface PastWinnersProps {
  limit?: number
}

/** Format winner name for privacy: "First L." */
function formatWinnerName(name: string | null | undefined): string {
  if (!name) return 'Winner'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export function PastWinners({ limit = 10 }: PastWinnersProps) {
  const { winners, isLoading } = usePastWinners(limit)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (isLoading || winners.length === 0) {
    return null
  }

  const visibleWinners = winners.slice(currentIndex, currentIndex + 3)
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex + 3 < winners.length

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const scrollRight = () => {
    if (canScrollRight) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-neon-yellow" />
        <h2 className="font-display text-lg font-bold text-foreground uppercase tracking-wider">
          Recent Winners
        </h2>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        {winners.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background-secondary border-2 border-border',
                canScrollLeft ? 'hover:border-neon-blue text-foreground' : 'opacity-50 cursor-not-allowed text-foreground-subtle'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background-secondary border-2 border-border',
                canScrollRight ? 'hover:border-neon-blue text-foreground' : 'opacity-50 cursor-not-allowed text-foreground-subtle'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Winners Carousel */}
        <div className="flex gap-3 px-6 overflow-hidden">
          {visibleWinners.map((winner) => (
            <div
              key={winner.id}
              className="flex-1 min-w-0 scoreboard-panel p-3 border-neon-yellow/30 text-center"
              style={{ boxShadow: '0 0 10px rgba(250, 204, 21, 0.1)' }}
            >
              {/* Winner Avatar with Crown/Trophy */}
              <div className="relative inline-block mb-2">
                <Avatar
                  src={winner.user.avatar_url}
                  fallback={winner.user.display_name || 'W'}
                  size="lg"
                />
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-neon-yellow rounded-full flex items-center justify-center">
                  <Trophy className="h-3 w-3 text-background" />
                </div>
              </div>

              {/* Winner Name (privacy-formatted: "First L.") */}
              <p className="font-display font-bold text-foreground text-sm truncate">
                {formatWinnerName(winner.user.display_name)}
              </p>

              {/* Prize */}
              {winner.prize && (
                <p className="text-xs text-neon-yellow font-display mt-1 truncate">
                  {winner.prize.name}
                </p>
              )}

              {/* Position Badge */}
              {winner.position <= 3 && (
                <div className={cn(
                  'inline-block px-2 py-0.5 rounded-full text-[10px] font-display font-bold mt-2',
                  winner.position === 1 && 'bg-neon-yellow/20 text-neon-yellow',
                  winner.position === 2 && 'bg-foreground-muted/20 text-foreground-muted',
                  winner.position === 3 && 'bg-neon-pink/20 text-neon-pink'
                )}>
                  {winner.position === 1 ? '1st Place' : winner.position === 2 ? '2nd Place' : '3rd Place'}
                </div>
              )}

              {/* Raffle Name */}
              {winner.raffle && (
                <p className="text-[10px] text-foreground-subtle mt-1 truncate">
                  {winner.raffle.name}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        {winners.length > 3 && (
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: Math.ceil(winners.length / 3) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 3)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  Math.floor(currentIndex / 3) === i
                    ? 'w-4 bg-neon-yellow'
                    : 'w-1.5 bg-foreground-subtle'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
